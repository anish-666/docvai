import { authTenant } from '../lib/auth.js';
import { ensureTenantAgent, query } from '../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  const tenantId = authTenant(req) || 't_demo';
  await ensureTenantAgent(tenantId);
  const items = await query('SELECT id,name,platform,provider_agent_id AS "providerAgentId",voice,model,active FROM agents WHERE tenant_id=$1',[tenantId]);
  res.json({ items });
}
