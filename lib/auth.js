import jwt from 'jsonwebtoken';

export function parseDemoUsers(){
  const raw = process.env.DEMO_USERS || 'admin@demo.com:demo123:t_demo';
  return raw.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
    const [email,password,tenantId] = s.split(':');
    return { email, password, tenantId };
  });
}

export function makeToken(tenantId, email){
  const secret = process.env.JWT_SECRET || 'dev';
  return jwt.sign({ t: tenantId, e: email }, secret, { expiresIn: '7d' });
}

export function authTenant(req){
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if(!token){ return null; }
  try{
    const secret = process.env.JWT_SECRET || 'dev';
    const p = jwt.verify(token, secret);
    return p.t || null;
  }catch(e){ return null; }
}
