// api/debug/health.js
export const config = { runtime: 'nodejs' };

import { query } from '../../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const dbOk = await query('select 1 as ok').then(()=>true).catch(e => e.message);
    res.status(200).json({
      ok: true,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        BOLNA_API_KEY: !!process.env.BOLNA_API_KEY,
        BOLNA_AGENT_ID: !!process.env.BOLNA_AGENT_ID,
        OUTBOUND_CALLER_ID: !!process.env.OUTBOUND_CALLER_ID,
        JWT_SECRET: !!process.env.JWT_SECRET,
      },
      db: dbOk === true ? 'connected' : `db-error: ${dbOk}`
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
