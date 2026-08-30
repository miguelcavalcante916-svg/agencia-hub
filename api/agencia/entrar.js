/* POST /api/agencia/entrar
   Corpo: { senha }  ou  { token }
   Porta do painel da agência. A senha vive só como hash no banco — nunca
   no repositório, nunca no JavaScript que vai para o navegador. */
import {
  conferirSenha, criarToken, lerToken, kvLer,
  bancoConfigurado, podeTentar, registrarErro, limparErros,
  responder, lerCorpo
} from '../_portal-comum.js';

const CONTA = 'agencia';

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' });

  const segredo = process.env.PORTAL_SEGREDO;
  if (!segredo || !bancoConfigurado()) {
    /* Sem banco configurado a porta NÃO tranca: o dono não pode ficar de
       fora do próprio sistema por causa de uma variável que faltou. */
    return responder(res, 503, { erro: 'Trava do painel ainda não configurada.', codigo: 'NAO_CONFIGURADO' });
  }

  const corpo = lerCorpo(req);

  if (corpo.token) {
    const dados = lerToken(corpo.token, segredo);
    if (!dados || dados.e !== CONTA) return responder(res, 401, { erro: 'Sessão expirada.' });
    return responder(res, 200, { token: corpo.token });
  }

  const guardado = await kvLer('painel:senha');
  if (!guardado) {
    /* Ninguém definiu senha ainda: entra e o app avisa para definir. */
    return responder(res, 200, { token: criarToken(CONTA, segredo), semSenha: true });
  }

  const senha = String(corpo.senha || '');
  if (!senha) return responder(res, 400, { erro: 'Digite a senha do painel.' });

  if (!(await podeTentar(CONTA))) {
    return responder(res, 429, { erro: 'Muitas tentativas seguidas. Espere 15 minutos.' });
  }
  if (!conferirSenha(senha, guardado.hash)) {
    await registrarErro(CONTA);
    return responder(res, 401, { erro: 'Senha incorreta.' });
  }
  await limparErros(CONTA);
  return responder(res, 200, { token: criarToken(CONTA, segredo) });
}
