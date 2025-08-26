import { authTenant } from '../../lib/auth.js';
import { query } from '../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  const rows = await query(`SELECT date_trunc('day', started_at) AS day, direction, status
                            FROM calls WHERE tenant_id=$1`, [tenantId]);
  const map = new Map();
  for(const r of rows){
    const k = r.day.toISOString().slice(0,10);
    if(!map.has(k)) map.set(k,{inbound:0,outbound:0,total:0,success:0});
    const m = map.get(k);
    m.total++; if(r.direction==='inbound') m.inbound++; else m.outbound++; if(r.status==='completed') m.success++;
  }
  const points = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([ts,m])=>({ ts, inbound:m.inbound, outbound:m.outbound, successRate: m.total? m.success/m.total:0 }));
  res.json({ points });
}
