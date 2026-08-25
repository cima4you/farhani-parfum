import { initDB, updateAdmin } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await initDB();
  const { username, email } = req.body;
  const data = {};
  if (username !== undefined && username.trim()) data.username = username.trim();
  if (email !== undefined) data.email = email.trim();
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  await updateAdmin(data);
  return res.json({ success: true });
}
