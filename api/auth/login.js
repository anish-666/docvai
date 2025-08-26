// api/auth/login.js
import { parseDemoUsers, makeToken } from '../../lib/auth.js';

function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }
  return raw;
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const body = await readBody(req);
  const { email, password } = body || {};

  const users = parseDemoUsers();
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const token = makeToken(u.tenantId, u.email);
  res.json({ token, tenantId: u.tenantId, email: u.email });
}
