import { authTenant } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  const id = req.query.id;
  const items = await query('SELECT run_id AS "runId", phone, lead_meta AS "leadMeta", state, error, ended_at AS "endedAt" FROM campaign_runs WHERE campaign_id=$1', [id]);
  res.json({ items, nextCursor: null });
}
