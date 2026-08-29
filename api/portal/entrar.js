/* POST /api/portal/entrar
   Corpo: { email, senha }  ou  { token }
   Devolve os dados do portal daquele cliente e um token de sessão. */
import {
  conferirSenha, criarToken, lerToken, normalizarEmail,
  kvLer, bancoConfigurado, podeTentar, registrarErro, limparErros,
  responder, lerCorpo
} from '../_portal-comum.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' });

  const segredo = process.env.PORTAL_SEGREDO;
  if (!segredo || !bancoConfigurado()) {
    return responder(res, 503, {
      erro: 'O login por e-mail ainda não foi ligado nesta conta.',
      codigo: 'NAO_CONFIGURADO'
    });
  }

  const corpo = lerCorpo(req);

  /* --- volta por token (o aparelho já entrou antes) --- */
  if (corpo.token) {
    const dados = lerToken(corpo.token, segredo);
    if (!dados) return responder(res, 401, { erro: 'Sessão expirada. Entre de novo.' });
    const cliente = await kvLer('cliente:' + dados.e);
    if (!cliente) return responder(res, 401, { erro: 'Acesso não encontrado.' });
    return responder(res, 200, { token: corpo.token, nome: cliente.nome || '', dados: cliente.dados });
  }

  /* --- entrada com e-mail e senha --- */
  const email = normalizarEmail(corpo.email);
  const senha = String(corpo.senha || '');
  if (!email || !senha) return responder(res, 400, { erro: 'Informe o e-mail e a senha.' });

  if (!(await podeTentar(email))) {
    return responder(res, 429, {
      erro: 'Muitas tentativas seguidas. Espere 15 minutos ou fale com a agência no WhatsApp.'
    });
  }

  const cliente = await kvLer('cliente:' + email);

  /* Mensagem IDÊNTICA para e-mail inexistente e senha errada, de propósito:
     mensagens diferentes contam para um estranho quais e-mails são clientes. */
  const generico = { erro: 'E-mail ou senha não conferem.' };

  if (!cliente || !conferirSenha(senha, cliente.senhaHash)) {
    await registrarErro(email);
    return responder(res, 401, generico);
  }

  await limparErros(email);
  return responder(res, 200, {
    token: criarToken(email, segredo),
    nome: cliente.nome || '',
    dados: cliente.dados
  });
}
