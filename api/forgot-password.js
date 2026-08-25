import { initDB, getAdmin, setResetToken } from '../lib/turso.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await initDB();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const admin = await getAdmin();
  if (!admin || admin.email !== email) {
    return res.json({ success: true, message: 'Si cet email correspond au compte admin, un lien de réinitialisation a été généré.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
  await setResetToken(email, token, expiry);

  return res.json({
    success: true,
    message: 'Lien de réinitialisation généré.',
    resetLink: `/reset-password?token=${token}`,
    token
  });
}
