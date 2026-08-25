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
      postal TEXT DEFAULT '',
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending'
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price INTEGER NOT NULL,
      desc TEXT DEFAULT '',
      cat TEXT DEFAULT 'Femme',
      img TEXT DEFAULT '🌹'
    )
  `);
  const row = await client.execute('SELECT id FROM admin WHERE id = 1');
  if (row.rows.length === 0) {
    await client.execute("INSERT INTO admin (id, username, password, email) VALUES (1, 'admin', 'farhani123', '')");
  }
  const prodCount = await client.execute('SELECT COUNT(*) as c FROM products');
  if (prodCount.rows[0].c === 0) {
    const defaults = [
      ['Libre Le Parfum','Yves Saint Laurent',1692,'Parfum floral ambré, intense et sophistiqué','Femme','🌹'],
      ['Libre EDP Intense 50ml','Yves Saint Laurent',1207,'Intensité florale avec lavande et vanille','Femme','🌺'],
      ['Paradoxe Radical Essence 50ml','Prada',1250,'Un paradoxe floral audacieux et captivant','Femme','🌸'],
      ['Bad Boy Cobalt Elixir 50ml','Carolina Herrera',888,'Elixir boisé épicé pour homme moderne','Homme','🪵'],
      ['Si Passione 50ml','Giorgio Armani',1071,'Rose et poire, une passion intense','Femme','🌹'],
      ['La Petite Robe Noire 30ml','Guerlain',972,'Le charme noir revisité, gourmand et floral','Femme','🖤'],
      ['This Is Really Her 100ml','Zadig & Voltaire',1367,'Vanille boisée, féminine et moderne','Femme','✨'],
      ['Bright Crystal 90ml','Versace',1153,'Frais et floral, un éclat de cristal','Femme','💎'],
      ['Her Parfum 100ml','Burberry',1475,'Un parfum moderne, féminin et audacieux','Femme','🍓'],
      ['Hypnotic Poison 50ml','Dior',1392,'Le poison envoûtant à l\'amande et à la vanille','Femme','💫'],
      ['Sauvage EDP 60ml','Dior',1250,'Fraîcheur radicale, ambre boisé puissant','Homme','🌵'],
      ['Bleu de Chanel EDP 50ml','Chanel',1180,'Parfum boisé aromatique intemporel','Homme','💙'],
      ['Acqua di Gio Profondo 75ml','Giorgio Armani',1090,'Fraîcheur marine profonde et minérale','Homme','🌊'],
      ['1 Million 100ml','Paco Rabanne',950,'Cuir épicé, audacieux et irrésistible','Homme','🥇'],
      ['Invictus 100ml','Paco Rabanne',920,'Fraîcheur marine et ambre gris victorieux','Homme','🏆'],
      ['Good Girl 50ml','Carolina Herrera',1100,'Parfum floral ambré en talon aiguille','Femme','👠'],
      ['La Nuit Trésor 50ml','Lancôme',1050,'Rose et vanille, un trésor de volupté','Femme','🌙'],
      ['Black Opium 50ml','Yves Saint Laurent',1150,'Café et vanille, addiction florale','Femme','☕'],
      ['L\'Homme Ideal 100ml','Guerlain',890,'Amande et cuir, l\'homme idéal revisité','Homme','👔'],
      ['Stronger With You 100ml','Emporio Armani',960,'Châtaigne et vanille, parfum de couple','Homme','❤️'],
      ['J\'adore 50ml','Dior',1280,'Bouquet floral emblématique de féminité','Femme','🌼'],
      ['Angel 50ml','Mugler',1050,'Patchouli et praline, légendaire et gourmand','Femme','👼'],
      ['Aventus 100ml','Creed',2800,'Ananas et bouleau, mythe masculin','Homme','🍍'],
      ['Terre d\'Hermès 50ml','Hermès',980,'Minéral et boisé, la terre en parfum','Homme','🌍'],
      ['Flower by Kenzo 50ml','Kenzo',820,'Coquelicot et poudre, féminin poétique','Femme','🌷'],
      ['Light Blue 50ml','Dolce & Gabbana',890,'Sicile ensoleillée, citron et pomme','Femme','🍋'],
      ['Le Male Le Parfum 75ml','Jean Paul Gaultier',1050,'Vanille et cardamome, masculin intense','Homme','💪'],
      ['L\'Interdit 50ml','Givenchy',1120,'Tubéreuse et vanille, l\'interdit sensuel','Femme','🚫'],
      ['Pasha Parfum 100ml','Cartier',1600,'Bois précieux, élégance suprême','Homme','👑'],
      ['Alien 60ml','Mugler',1150,'Ambrette et bois, féminin mystérieux','Femme','👽'],
    ];
    for (const p of defaults) {
      await client.execute('INSERT INTO products (name, brand, price, `desc`, cat, img) VALUES (?, ?, ?, ?, ?, ?)', p);
    }
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

export async function getProducts() {
  const rows = await client.execute('SELECT * FROM products ORDER BY id ASC');
  return rows.rows;
}

export async function createProduct(p) {
  await client.execute('INSERT INTO products (name, brand, price, `desc`, cat, img) VALUES (?, ?, ?, ?, ?, ?)', [p.name, p.brand, p.price, p.desc, p.cat, p.img]);
}

export async function updateProduct(id, p) {
  await client.execute('UPDATE products SET name = ?, brand = ?, price = ?, `desc` = ?, cat = ?, img = ? WHERE id = ?', [p.name, p.brand, p.price, p.desc, p.cat, p.img, id]);
}

export async function deleteProduct(id) {
  await client.execute('DELETE FROM products WHERE id = ?', [id]);
}

export default client;
