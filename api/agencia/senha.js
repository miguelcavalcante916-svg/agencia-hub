/* POST /api/agencia/senha
   Define ou troca a senha do painel.
   Corpo: { novaSenha, senhaAtual? , chave? }
   - já existe senha  -> exige a senha ATUAL (ou a chave de administração,
                         que é a saída para quem esqueceu)
   - não existe ainda -> qualquer um define a primeira, porque o painel
                         está aberto de qualquer forma nesse estado */
import {
  criarHashSenha, conferirSenha, kvLer, kvGravar,
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
  if (!bancoConfigurado()) {
    return responder(res, 503, { erro: 'Banco ainda não configurado na Vercel.', codigo: 'NAO_CONFIGURADO' });
  }

  const corpo = lerCorpo(req);
  const nova = String(corpo.novaSenha || '');
  if (nova.length < 6) return responder(res, 400, { erro: 'A senha precisa ter pelo menos 6 caracteres.' });

  const atual = await kvLer('painel:senha');
  if (atual) {
    const porSenha = corpo.senhaAtual && conferirSenha(corpo.senhaAtual, atual.hash);
    const porChave = chaveConfere(corpo.chave, process.env.PORTAL_CHAVE_ADMIN);
    if (!porSenha && !porChave) {
      return responder(res, 401, { erro: 'A senha atual não confere. Se esqueceu, use a chave de administração.' });
    }
  }

  await kvGravar('painel:senha', {
    hash: criarHashSenha(nova),
    trocadaEm: new Date().toISOString()
  });
  return responder(res, 200, { ok: true, primeira: !atual });
}
