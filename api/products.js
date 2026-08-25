import { initDB, getProducts, createProduct, updateProduct, deleteProduct } from '../lib/turso.js';

export default async function handler(req, res) {
  await initDB();
  switch (req.method) {
    case 'GET': {
      const products = await getProducts();
      return res.json(products);
    }
    case 'POST': {
      const p = req.body;
      await createProduct(p);
      return res.json({ success: true });
    }
    case 'PUT': {
      const { id, ...p } = req.body;
      await updateProduct(id, p);
      return res.json({ success: true });
    }
    case 'DELETE': {
      const { id } = req.body;
      await deleteProduct(id);
      return res.json({ success: true });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
