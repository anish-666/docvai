export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
if (req.method === 'OPTIONS') { res.status(200).end(); return false; } return false;
  res.json({ ok: true, ts: new Date().toISOString() });
}
