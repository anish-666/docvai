export const config = { runtime: 'nodejs18.x' };

// api/auth/login.js
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
  // If Vercel already parsed it:
  if (req.body && typeof req.body === 'object') return req.body;

  // Node runtime stream read:
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default async function handler(req, res) {
  setCors(res);

  // Preflight must be 200 + CORS headers
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = await readJsonBody(req);

  const users = parseDemoUsers();
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const token = makeToken(u.tenantId, u.email);
  return res.json({ token, tenantId: u.tenantId, email: u.email });
}
