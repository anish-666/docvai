import { upsertByProviderCallId, insertTurn } from '../../lib/db.js';

function pick(o, keys, d=null){ for(const k of keys){ if(o && typeof o==='object' && k in o) return o[k]; } return d; }

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).end();

  try{
    const evt = req.body || {};
    const tenantId = pick(evt,['tenantId','tenant_id'],'t_demo');
    const type = pick(evt, ['type','event','event_type'],'unknown');
    const eCallId = pick(evt, ['callId','call_id','id']);
    const ts = pick(evt, ['ts','timestamp','time'], new Date().toISOString());
    const direction = pick(evt, ['direction','call_direction'], null) || (pick(evt,['inbound'],null) ? 'inbound' : null);
    const phone = pick(evt, ['phone','from','caller','customer_number','recipient_phone_number'], '');

    if(type==='call.started' || type==='call_started'){
      await upsertByProviderCallId(tenantId, eCallId, { status:'in-progress', started_at: ts, direction: direction || 'inbound', phone });
    } else if(type==='turn.final' || type==='turn_final' || type==='transcript.appended'){
      const id = await upsertByProviderCallId(tenantId, eCallId, { status:'in-progress', direction: direction || 'inbound', phone });
      const role = pick(evt,['role','speaker'],'agent');
      const text = pick(evt,['text','message'],'');
      await insertTurn(id, { ts, role, text });
    } else if(type==='call.ended' || type==='call_ended'){
      const status = pick(evt,['status','result'],'completed');
      const durationSec = pick(evt,['durationSec','duration_sec','duration'],0);
      const recordingUrl = pick(evt,['recordingUrl','recording_url'],null);
      const summary = pick(evt,['summary'],null);
      const disposition = pick(evt,['disposition'],null);
      const costUSD = pick(evt,['costUSD','cost_usd','cost'],null);
      await upsertByProviderCallId(tenantId, eCallId, { status, ended_at: ts, duration_sec: durationSec, recording_url: recordingUrl, summary, phone, disposition, cost_usd: costUSD });
    }
    res.json({ ok:true });
  }catch(e){
    res.status(400).json({ ok:false, error: String(e.message || e) });
  }
}
