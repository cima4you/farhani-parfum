import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL DEFAULT 'admin',
      password TEXT NOT NULL DEFAULT 'farhani123',
      email TEXT DEFAULT '',
      reset_token TEXT DEFAULT NULL,
      reset_token_expiry TEXT DEFAULT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      address TEXT NOT NULL,
      notes TEXT DEFAULT '',
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending'
    )
  `);
  const row = await client.execute('SELECT id FROM admin WHERE id = 1');
  if (row.rows.length === 0) {
    await client.execute("INSERT INTO admin (id, username, password, email) VALUES (1, 'admin', 'farhani123', '')");
  }
}

export async function getAdmin() {
  const row = await client.execute('SELECT * FROM admin WHERE id = 1');
  return row.rows[0] || null;
}

export async function getPassword() {
  const row = await client.execute('SELECT password FROM admin WHERE id = 1');
  return row.rows[0]?.password || 'farhani123';
}

export async function setPassword(newPwd) {
  await client.execute('UPDATE admin SET password = ? WHERE id = 1', [newPwd]);
}

export async function updateAdmin(data) {
  const { username, email } = data;
  if (username !== undefined) {
    await client.execute('UPDATE admin SET username = ? WHERE id = 1', [username]);
  }
  if (email !== undefined) {
    await client.execute('UPDATE admin SET email = ? WHERE id = 1', [email]);
  }
}

export async function setResetToken(email, token, expiry) {
  await client.execute(
    'UPDATE admin SET reset_token = ?, reset_token_expiry = ? WHERE id = 1 AND email = ?',
    [token, expiry, email]
  );
}

export async function getAdminByResetToken(token) {
  const row = await client.execute(
    'SELECT * FROM admin WHERE reset_token = ? AND reset_token_expiry > datetime("now")',
    [token]
  );
  return row.rows[0] || null;
}

export async function clearResetToken() {
  await client.execute('UPDATE admin SET reset_token = NULL, reset_token_expiry = NULL WHERE id = 1');
}

export async function getOrders() {
  const rows = await client.execute('SELECT * FROM orders ORDER BY date DESC');
  return rows.rows.map(r => ({...r, id: String(r.id).replace(/\.0$/, ''), items: JSON.parse(r.items)}));
}

export async function createOrder(order) {
  await client.execute(
    'INSERT INTO orders (id, date, name, phone, email, address, notes, items, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [order.id, order.date, order.name, order.phone, order.email, order.address, order.notes, JSON.stringify(order.items), order.total, order.status]
  );
}

export async function updateOrderStatus(id, status) {
  await client.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}

export async function deleteOrder(id) {
  await client.execute('DELETE FROM orders WHERE id = ?', [id]);
}

export default client;
