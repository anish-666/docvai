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
