# Vercel Serverless API (Full) for Bolna Whitelabel

This is a ready-to-deploy **serverless API** for Vercel. It persists data in **Postgres (Neon)** and supports:
- Sign-in (demo, JWT)
- Agents (per tenant)
- Outbound call creation (Bolna `/call`)
- Webhooks from Bolna (transcripts + recordings + linking by `call_id`)
- Conversations list + transcript
- Analytics (summary + timeseries)
- Campaigns (create + list + runs)

## Deploy (quick)
1) Create a free **Neon Postgres** DB → copy the connection string; run `schema.sql` in Neon.
2) Push this folder to a GitHub repo.
3) In **Vercel → New Project**, import the repo.
4) Set Env Vars:
   - `DATABASE_URL` (Neon connection string)
   - `BOLNA_API_KEY`
   - `BOLNA_PROVIDER_AGENT_ID`
   - `BOLNA_BASE_URL=https://api.bolna.ai`
   - `JWT_SECRET` (any long random string)
   - `DEMO_USERS=admin@demo.com:demo123:t_demo,client1@demo.com:client123:t_client1`
   - `DEFAULT_FROM_PHONE` (optional)
5) Deploy. Your API lives at `https://<project>.vercel.app/api/...`
6) In Bolna, set webhook to `https://<project>.vercel.app/api/webhooks/bolna`
