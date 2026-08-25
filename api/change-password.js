import { initDB, setPassword } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await initDB();
  const { password } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ error: 'Minimum 4 caractères' });
  await setPassword(password);
  return res.json({ success: true });
}
