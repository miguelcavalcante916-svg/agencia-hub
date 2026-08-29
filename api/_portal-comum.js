/* Peças compartilhadas pelas funções do Portal do Cliente.
   Zero dependência: só o módulo crypto do próprio Node e fetch. Isso evita
   package.json, build e o risco de uma dependência quebrar o deploy. */
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

/* ---------- senha ---------- */
/* scrypt com sal por usuário. Nunca guardamos a senha, só o hash — se o banco
   vazar, as senhas continuam inúteis para quem pegou. */
const CUSTO = { N: 16384, r: 8, p: 1, keylen: 32 };

export function criarHashSenha(senha) {
  const sal = randomBytes(16);
  const chave = scryptSync(String(senha), sal, CUSTO.keylen, CUSTO);
  return 'scrypt$' + sal.toString('base64url') + '$' + chave.toString('base64url');
}

export function conferirSenha(senha, guardado) {
  try {
    const [algo, salB64, chaveB64] = String(guardado || '').split('$');
    if (algo !== 'scrypt' || !salB64 || !chaveB64) return false;
    const sal = Buffer.from(salB64, 'base64url');
    const esperada = Buffer.from(chaveB64, 'base64url');
    const obtida = scryptSync(String(senha), sal, esperada.length, CUSTO);
    /* comparação em tempo constante: comparar com === vazaria, pelo tempo de
       resposta, quantos bytes do hash o atacante já acertou */
    return esperada.length === obtida.length && timingSafeEqual(esperada, obtida);
  } catch { return false; }
}

/* ---------- sessão ---------- */
/* Token assinado com HMAC. O cliente guarda isso e não a senha, e ele expira
   sozinho — ninguém precisa "deslogar" nada do lado do servidor. */
const DIAS = 30;

export function criarToken(email, segredo) {
  const corpo = Buffer.from(JSON.stringify({
    e: email, exp: Date.now() + DIAS * 86400000
  })).toString('base64url');
  const assinatura = createHmac('sha256', segredo).update(corpo).digest('base64url');
  return corpo + '.' + assinatura;
}

export function lerToken(token, segredo) {
  try {
    const [corpo, assinatura] = String(token || '').split('.');
    if (!corpo || !assinatura) return null;
    const esperada = createHmac('sha256', segredo).update(corpo).digest('base64url');
    const a = Buffer.from(assinatura), b = Buffer.from(esperada);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString());
    if (!dados.exp || dados.exp < Date.now()) return null;
    return dados;
  } catch { return null; }
}

/* ---------- e-mail como chave ---------- */
export function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/* ---------- banco (Vercel KV / Upstash, via REST) ---------- */
/* Usamos a API REST em vez do pacote @vercel/kv para não precisar de
   node_modules nenhum na função. */
function configKV() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

export function bancoConfigurado() { return configKV() !== null; }

export async function kvLer(chave) {
  const c = configKV();
  if (!c) throw new Error('BANCO_NAO_CONFIGURADO');
  const r = await fetch(c.url + '/get/' + encodeURIComponent(chave), {
    headers: { Authorization: 'Bearer ' + c.token }, cache: 'no-store'
  });
  if (!r.ok) throw new Error('KV_ERRO_' + r.status);
  const j = await r.json();
  if (j.result == null) return null;
  try { return JSON.parse(j.result); } catch { return j.result; }
}

export async function kvGravar(chave, valor) {
  const c = configKV();
  if (!c) throw new Error('BANCO_NAO_CONFIGURADO');
  const r = await fetch(c.url + '/set/' + encodeURIComponent(chave), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, 'content-type': 'application/json' },
    body: JSON.stringify(valor)
  });
  if (!r.ok) throw new Error('KV_ERRO_' + r.status);
  return true;
}

export async function kvApagar(chave) {
  const c = configKV();
  if (!c) throw new Error('BANCO_NAO_CONFIGURADO');
  const r = await fetch(c.url + '/del/' + encodeURIComponent(chave), {
    method: 'POST', headers: { Authorization: 'Bearer ' + c.token }
  });
  return r.ok;
}

/* ---------- freio de tentativas ---------- */
/* Sem isto, qualquer um roda um script tentando senhas a noite inteira.
   Cinco erros no mesmo e-mail e a porta fecha por 15 minutos. */
const LIMITE = 5, JANELA_MS = 15 * 60000;

export async function podeTentar(email) {
  try {
    const reg = await kvLer('freio:' + email);
    if (!reg) return true;
    if (Date.now() - reg.desde > JANELA_MS) return true;
    return reg.erros < LIMITE;
  } catch { return true; }   /* banco fora do ar não pode travar quem acerta a senha */
}

export async function registrarErro(email) {
  try {
    const reg = await kvLer('freio:' + email);
    if (!reg || Date.now() - reg.desde > JANELA_MS) {
      await kvGravar('freio:' + email, { erros: 1, desde: Date.now() });
    } else {
      await kvGravar('freio:' + email, { erros: reg.erros + 1, desde: reg.desde });
    }
  } catch { /* silencioso de propósito: o freio é defesa, não função crítica */ }
}

export async function limparErros(email) {
  try { await kvApagar('freio:' + email); } catch { /* idem */ }
}

/* ---------- resposta ---------- */
export function responder(res, status, corpo) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.status(status).end(JSON.stringify(corpo));
}

export function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
