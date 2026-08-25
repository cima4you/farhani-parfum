import { initDB, getOrders, createOrder, updateOrderStatus, deleteOrder } from '../lib/turso.js';

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
      const orderId = typeof id === 'number' ? id.toFixed(1) : String(id);
      await updateOrderStatus(orderId, status);
      return res.json({ success: true });
    }
    case 'DELETE': {
      const { id } = req.body;
      const orderId = typeof id === 'number' ? id.toFixed(1) : String(id);
      await deleteOrder(orderId);
      return res.json({ success: true });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
