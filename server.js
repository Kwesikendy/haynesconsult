import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'haynes_super_secret_key_123';

// Initialize DB
initDb();

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hash = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Email likely already exists' });
    const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: this.lastID, name, email } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });
    
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  });
});

app.get('/api/academy/content', (req, res) => {
  // Optional auth
  const authHeader = req.headers['authorization'];
  let userId = null;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch(e) {}
  }

  db.all(`SELECT * FROM academy_items`, [], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (userId) {
      db.all(`SELECT item_id FROM purchases WHERE user_id = ?`, [userId], (err, purchases) => {
        const ownedItems = purchases ? purchases.map(p => p.item_id) : [];
        const itemsWithOwnership = items.map(item => ({
          ...item,
          owned: item.is_premium === 0 || ownedItems.includes(item.id)
        }));
        res.json(itemsWithOwnership);
      });
    } else {
      const itemsWithOwnership = items.map(item => ({
        ...item,
        owned: item.is_premium === 0
      }));
      res.json(itemsWithOwnership);
    }
  });
});

app.post('/api/checkout/simulate', authenticateToken, (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.id;

  if (!itemId) return res.status(400).json({ error: 'Missing itemId' });

  // Simulate payment processing...
  setTimeout(() => {
    db.run(`INSERT INTO purchases (user_id, item_id) VALUES (?, ?)`, [userId, itemId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Payment successful, item unlocked!' });
    });
  }, 1000); // Fake delay
});

app.post('/api/payments/record', (req, res) => {
  const { email, courseId, amount, reference, status } = req.body;
  if (!email || !reference) return res.status(400).json({ error: 'Missing required fields' });
  
  db.run(
    `INSERT INTO transactions (email, course_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)`,
    [email, courseId, amount, reference, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Transaction recorded locally', transactionId: this.lastID });
    }
  );
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
