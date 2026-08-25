import { initDB, getAdmin } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await initDB();
  const { username, password } = req.body;
  const admin = await getAdmin();
  if (!admin) return res.status(401).json({ error: 'Erreur de configuration' });
  if (username === admin.username && password === admin.password) return res.json({ success: true });
  return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
}
