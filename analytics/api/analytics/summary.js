import { authTenant } from '../../lib/auth.js';
import { query } from '../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  const rows = await query('SELECT direction,status,duration_sec,cost_usd FROM calls WHERE tenant_id=$1',[tenantId]);
  const inbound = rows.filter(r=>r.direction==='inbound').length;
  const outbound = rows.filter(r=>r.direction==='outbound').length;
  const completed = rows.filter(r=>r.status==='completed').length;
  const successRate = completed / Math.max(rows.length,1);
  const avg = Math.round((rows.filter(r=>r.status==='completed').reduce((a,c)=>a+(c.duration_sec||0),0))/Math.max(completed,1)||0);
  const cost = Number(rows.reduce((a,c)=>a+(Number(c.cost_usd)||0),0).toFixed(2));
  res.json({ inbound, outbound, avgDurationSec: avg, successRate, costUSD: cost });
}
