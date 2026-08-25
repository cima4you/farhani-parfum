import { initDB, getOrders, createOrder } from '../lib/turso.js';
import client from '../lib/turso.js';

export default async function handler(req, res) {
  await initDB();
  switch (req.method) {
    case 'GET': {
      const orders = await getOrders();
      return res.json(orders);
    }
    case 'POST': {
      const order = req.body;
      await createOrder(order);
      return res.json({ success: true });
    }
    case 'PATCH': {
      const { id, status } = req.body;
      const sid = String(id).replace(/\.0$/, '');
      const rows = await client.execute('SELECT id FROM orders');
      const match = rows.rows.find(r => String(r.id).replace(/\.0$/, '') === sid);
      if (match) {
        await client.execute('UPDATE orders SET status = ? WHERE id = ?', [status, match.id]);
      }
      return res.json({ success: true });
    }
    case 'PUT': {
      const { id, items, total } = req.body;
      const sid = String(id).replace(/\.0$/, '');
      const rows = await client.execute('SELECT id FROM orders');
      const match = rows.rows.find(r => String(r.id).replace(/\.0$/, '') === sid);
      if (match) {
        await client.execute('UPDATE orders SET items = ?, total = ? WHERE id = ?', [JSON.stringify(items), total, match.id]);
      }
      return res.json({ success: true });
    }
    case 'DELETE': {
      const { id } = req.body;
      const sid = String(id).replace(/\.0$/, '');
      const rows = await client.execute('SELECT id FROM orders');
      const match = rows.rows.find(r => String(r.id).replace(/\.0$/, '') === sid);
      if (match) {
        await client.execute('DELETE FROM orders WHERE id = ?', [match.id]);
      }
      return res.json({ success: true });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
