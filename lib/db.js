import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function query(q, params){ const { rows } = await pool.query(q, params); return rows; }

export async function ensureTenantAgent(tenantId){
  const agent = await query('SELECT * FROM agents WHERE tenant_id=$1 LIMIT 1', [tenantId]);
  if(agent.length) return agent[0];
  const id = 'agt_1';
  await query(`INSERT INTO agents(id,tenant_id,name,platform,provider_agent_id,voice,model,active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
    [id, tenantId, 'Client Sales Qualifier', 'bolna', process.env.BOLNA_PROVIDER_AGENT_ID, 'alloy', 'gpt-4o-mini', true]);
  return (await query('SELECT * FROM agents WHERE id=$1 AND tenant_id=$2',[id,tenantId]))[0];
}

export async function createCall({ tenantId, agentId, providerAgentId, direction, phone }){
  const id = 'call_' + randomUUID();
  await query(`INSERT INTO calls(id, tenant_id, agent_id, provider_agent_id, direction, phone, status, started_at)
               VALUES ($1,$2,$3,$4,$5,$6,'queued', NOW())`,
               [id, tenantId, agentId, providerAgentId, direction, phone]);
  return id;
}

export async function updateCallProviderId(localId, providerCallId){
  await query('UPDATE calls SET provider_call_id=$2 WHERE id=$1', [localId, providerCallId]);
}

export async function upsertByProviderCallId(tenantId, providerCallId, fields){
  const rows = await query('SELECT * FROM calls WHERE provider_call_id=$1 LIMIT 1', [providerCallId]);
  if(rows.length){
    const set = []; const vals = []; let i=1;
    for(const [k,v] of Object.entries(fields)){ set.push(`${k}=$${++i}`); vals.push(v); }
    vals.unshift(rows[0].id);
    await query(`UPDATE calls SET ${set.join(', ')} WHERE id=$1`, vals);
    return rows[0].id;
  } else {
    const id = 'call_' + randomUUID();
    const cols = Object.keys(fields);
    const vals = Object.values(fields);
    await query(`INSERT INTO calls(id,tenant_id,provider_call_id,status,started_at,${cols.join(',')})
                 VALUES ($1,$2,$3,'in-progress',NOW(),${cols.map((_,i)=>'$'+(i+4)).join(',')})`,
                 [id, tenantId, providerCallId, *vals]);
    return id;
  }
}

export async function insertTurn(callId, turn){
  await query(`INSERT INTO turns(id,call_id,ts,role,text,tokens,latency_ms)
               VALUES ($1,$2,$3,$4,$5,$6,$7)`,
               ['turn_'+randomUUID(), callId, turn.ts, turn.role, turn.text, turn.tokens||null, turn.latencyMs||null]);
}
