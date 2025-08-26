import { authTenant } from '../../lib/auth.js';
import { query } from '../../lib/db.js';
import { randomUUID } from 'node:crypto';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  if(req.method==='POST'){
    const { name, agentId='agt_1', concurrency=5, record=true, respectDNC=true, prompt, leads=[], scheduleAt=null, fromPhone=null } = req.body || {};
    const id = 'cmp_' + randomUUID();
    await query(`INSERT INTO campaigns(id,tenant_id,name,agent_id,concurrency,record,respect_dnc,prompt,status,scheduled_for,from_phone)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, tenantId, name, agentId, concurrency, record, respectDNC, prompt, scheduleAt ? 'scheduled' : 'running', scheduleAt, fromPhone]);
    for(const lead of leads){
      await query(`INSERT INTO campaign_runs(run_id,campaign_id,phone,lead_meta,state) VALUES ($1,$2,$3,$4,'queued')`,
        ['run_'+randomUUID(), id, lead.phone, JSON.stringify(lead.custom||{})]);
    }
    res.status(201).json({ id });
  } else {
    const items = await query(`SELECT c.*, 
      (SELECT COUNT(*) FROM campaign_runs r WHERE r.campaign_id=c.id) AS total,
      (SELECT COUNT(*) FROM campaign_runs r WHERE r.campaign_id=c.id AND r.state='queued') AS queued,
      (SELECT COUNT(*) FROM campaign_runs r WHERE r.campaign_id=c.id AND r.state='running') AS running,
      (SELECT COUNT(*) FROM campaign_runs r WHERE r.campaign_id=c.id AND r.state='completed') AS completed,
      (SELECT COUNT(*) FROM campaign_runs r WHERE r.campaign_id=c.id AND r.state='failed') AS failed
      FROM campaigns c WHERE c.tenant_id=$1 ORDER BY c.created_at DESC`, [tenantId]);
    res.json({ items, nextCursor: null });
  }
}
