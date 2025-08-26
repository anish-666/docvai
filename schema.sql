CREATE TABLE IF NOT EXISTS tenants(
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS agents(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'bolna',
  provider_agent_id TEXT NOT NULL,
  voice TEXT,
  model TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS calls(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  agent_id TEXT,
  provider_agent_id TEXT,
  provider_call_id TEXT,
  direction TEXT CHECK (direction IN ('inbound','outbound')),
  phone TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_sec INTEGER,
  recording_url TEXT,
  summary TEXT,
  disposition TEXT,
  cost_usd NUMERIC
);
CREATE INDEX IF NOT EXISTS idx_calls_provider_call_id ON calls(provider_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_started ON calls(tenant_id, started_at DESC);

CREATE TABLE IF NOT EXISTS turns(
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL,
  role TEXT,
  text TEXT,
  tokens INTEGER,
  latency_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_turns_call_ts ON turns(call_id, ts);

CREATE TABLE IF NOT EXISTS campaigns(
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT,
  agent_id TEXT,
  concurrency INTEGER DEFAULT 5,
  record BOOLEAN DEFAULT TRUE,
  respect_dnc BOOLEAN DEFAULT TRUE,
  prompt TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  from_phone TEXT
);

CREATE TABLE IF NOT EXISTS campaign_runs(
  run_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  lead_meta JSONB,
  state TEXT,
  error TEXT,
  ended_at TIMESTAMPTZ
);
