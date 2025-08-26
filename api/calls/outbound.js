import { authTenant } from '../../lib/auth.js';
import { ensureTenantAgent, createCall, updateCallProviderId } from '../../lib/db.js';

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).end();

  try{
    const tenantId = authTenant(req) || 't_demo';
    const agent = await ensureTenantAgent(tenantId);
    const { phone, fromPhone, prompt, record=true } = req.body || {};

    const localId = await createCall({ tenantId, agentId: agent.id, providerAgentId: agent.provider_agent_id || agent.providerAgentId, direction: 'outbound', phone });

    const base = (process.env.BOLNA_BASE_URL || '').replace(/\/$/, '');
    const key  = process.env.BOLNA_API_KEY;
    const body = { agent_id: agent.provider_agent_id || process.env.BOLNA_PROVIDER_AGENT_ID, recipient_phone_number: phone };
    if(fromPhone) body.from_phone_number = fromPhone;
    if(prompt || record !== undefined){ body.metadata = { ...(prompt?{prompt}:{}) , ...(record!==undefined?{record}:{}) }; }

    const r = await fetch(`${base}/call`, { method:'POST', headers:{ 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    const txt = await r.text(); if(!r.ok) return res.status(502).json({ error:'BOLNA_CALL_FAILED', detail:txt });
    let data={}; try{ data=JSON.parse(txt); }catch{}
    const providerCallId = data.call_id || data.id || data.callId || null;
    if(providerCallId) await updateCallProviderId(localId, providerCallId);

    res.status(202).json({ callId: localId, providerCallId });
  }catch(e){
    res.status(500).json({ error:'OUTBOUND_ERROR', detail:String(e.message||e) });
  }
}
