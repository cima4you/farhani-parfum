import { initDB, getAdminByResetToken, setPassword, clearResetToken } from '../lib/turso.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await initDB();
  const { token, password } = req.body;
  if (!token) return res.status(400).json({ error: 'Token requis' });
  if (!password || password.length < 4) return res.status(400).json({ error: 'Minimum 4 caractères' });

  const admin = await getAdminByResetToken(token);
  if (!admin) return res.status(400).json({ error: 'Token invalide ou expiré' });

  await setPassword(password);
  await clearResetToken();
  return res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
}
