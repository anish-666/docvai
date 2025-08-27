// api/auth/login.js
export const config = { runtime: 'nodejs' };

import { parseDemoUsers, makeToken } from '../../lib/auth.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Requested-With, If-Modified-Since'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default async function handler(req, res) {
  setCors(res);

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ---------- TEMP BYPASS ----------
  if (process.env.AUTH_BYPASS === '1') {
    const body = await readJsonBody(req);
    const email = (body?.email || 'demo').toLowerCase();
    const token = makeToken('t_demo', email);
    return res.json({ token, tenantId: 't_demo', email });
  }
  // ---------------------------------

  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = await readJsonBody(req);

  const users = parseDemoUsers();
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const token = makeToken(u.tenantId, u.email);
  return res.json({ token, tenantId: u.tenantId, email: u.email });
}
