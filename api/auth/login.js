// --- add these helpers near the top of api/index.js ---
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

async function readBody(req) {
  // already parsed?
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const ct = req.headers['content-type'] || '';

  if (ct.includes('application/json')) {
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }
  return raw; // form-data / text fallback
}
// inside your handler(req, res) after you construct url/path:
const url = new URL(req.url, `http://${req.headers.host}`);
req.query = Object.fromEntries(url.searchParams.entries());

// parse body for POST/PATCH/PUT
if (['POST','PUT','PATCH'].includes(req.method)) {
  req.body = await readBody(req);
}

import { parseDemoUsers, makeToken } from '../../lib/auth.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).end();

  const { email, password } = req.body || {};
  const users = parseDemoUsers();
  const u = users.find(x => x.email===email && x.password===password);
  if(!u) return res.status(401).json({ error:'INVALID_CREDENTIALS' });
  const token = makeToken(u.tenantId, u.email);
  res.json({ token, tenantId: u.tenantId, email: u.email });
}
