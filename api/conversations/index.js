import { authTenant } from '../../lib/auth.js';
import { query } from '../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  const q = (req.query.query || '').toLowerCase();
  const rows = await query(`SELECT id, provider_call_id AS "providerCallId", agent_id AS "agentId",
    direction, phone, status, started_at AS "startedAt", ended_at AS "endedAt",
    duration_sec AS "durationSec", recording_url AS "recordingUrl", summary
    FROM calls WHERE tenant_id=$1 ORDER BY started_at DESC LIMIT 200`, [tenantId]);
  const items = rows.filter(r => q ? ((r.summary||'').toLowerCase().includes(q) || (r.phone||'').includes(q)) : true);
  res.json({ items, nextCursor: null });
}
