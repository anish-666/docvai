import { authTenant } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  const id = req.query.id;
  const ok = await query('SELECT 1 FROM calls WHERE id=$1 AND tenant_id=$2',[id,tenantId]);
  if(!ok.length) return res.status(404).json({ error:'CALL_NOT_FOUND' });
  const turns = await query(`SELECT id, ts, role, text, tokens, latency_ms AS "latencyMs"
                             FROM turns WHERE call_id=$1 ORDER BY ts ASC`, [id]);
  res.json({ id, turns });
}
