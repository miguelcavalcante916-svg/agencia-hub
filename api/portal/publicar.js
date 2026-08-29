/* POST /api/portal/publicar
   Só a agência chama isto, com a chave de administração.
   Corpo: { chave, email, senha?, nome?, dados }
   - senha presente  -> cria ou troca a senha daquele cliente
   - senha ausente   -> só atualiza os dados, mantendo a senha atual */
import {
  criarHashSenha, normalizarEmail, kvLer, kvGravar, kvApagar,
  bancoConfigurado, responder, lerCorpo
} from '../_portal-comum.js';
import { timingSafeEqual } from 'node:crypto';

function chaveConfere(enviada, real) {
  const a = Buffer.from(String(enviada || ''));
  const b = Buffer.from(String(real || ''));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' });

  const chaveAdmin = process.env.PORTAL_CHAVE_ADMIN;
  if (!chaveAdmin || !bancoConfigurado()) {
    return responder(res, 503, { erro: 'Portal ainda não configurado.', codigo: 'NAO_CONFIGURADO' });
  }

  const corpo = lerCorpo(req);
  if (!chaveConfere(corpo.chave, chaveAdmin)) {
    return responder(res, 401, { erro: 'Chave de administração inválida.' });
  }

  const email = normalizarEmail(corpo.email);
  if (!email || email.indexOf('@') < 1) return responder(res, 400, { erro: 'E-mail inválido.' });

  /* remover o acesso de um cliente */
  if (corpo.remover) {
    await kvApagar('cliente:' + email);
    return responder(res, 200, { ok: true, removido: email });
  }

  const atual = await kvLer('cliente:' + email);

  let senhaHash = atual && atual.senhaHash;
  if (corpo.senha) {
    if (String(corpo.senha).length < 6) {
      return responder(res, 400, { erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }
    senhaHash = criarHashSenha(corpo.senha);
  }
  if (!senhaHash) return responder(res, 400, { erro: 'Defina uma senha para este cliente.' });

  await kvGravar('cliente:' + email, {
    email,
    nome: corpo.nome || (atual && atual.nome) || '',
    senhaHash,
    dados: corpo.dados != null ? corpo.dados : (atual && atual.dados) || null,
    atualizadoEm: new Date().toISOString()
  });

  return responder(res, 200, { ok: true, email, senhaTrocada: !!corpo.senha });
}
