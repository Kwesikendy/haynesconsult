import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import db, { initDb } from './db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
const app = express();
app.use(cors());
app.use(express.json());

// Serve built frontend
app.use(express.static(path.join(__dirname, 'dist')));

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

// --- AUTH ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hash);
    const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (err) {
    res.status(400).json({ error: 'Email likely already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ACADEMY ---
app.get('/api/academy/content', (req, res) => {
  const authHeader = req.headers['authorization'];
  let userId = null;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try { const decoded = jwt.verify(token, JWT_SECRET); userId = decoded.id; } catch(e) {}
  }

  try {
    const items = db.prepare('SELECT * FROM academy_items').all();
    if (userId) {
      const purchases = db.prepare('SELECT item_id FROM purchases WHERE user_id = ?').all(userId);
      const ownedItems = purchases.map(p => p.item_id);
      const itemsWithOwnership = items.map(item => ({
        ...item,
        owned: item.is_premium === 0 || ownedItems.includes(item.id)
      }));
      res.json(itemsWithOwnership);
    } else {
      res.json(items.map(item => ({ ...item, owned: item.is_premium === 0 })));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout/simulate', authenticateToken, (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.id;
  if (!itemId) return res.status(400).json({ error: 'Missing itemId' });
  try {
    db.prepare('INSERT INTO purchases (user_id, item_id) VALUES (?, ?)').run(userId, itemId);
    res.json({ success: true, message: 'Payment successful, item unlocked!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/record', (req, res) => {
  const { email, courseId, amount, reference, status } = req.body;
  if (!email || !reference) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const result = db.prepare(
      'INSERT INTO transactions (email, course_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)'
    ).run(email, courseId, amount, reference, status);
    res.json({ success: true, message: 'Transaction recorded locally', transactionId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN COURSE UPLOAD ---
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

app.post('/api/admin/courses', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdfs', maxCount: 10 }]), async (req, res) => {
  try {
    const { title, category, description, price } = req.body;
    if (!title || !req.files['cover'] || !req.files['pdfs']) {
      return res.status(400).json({ error: "Missing required files or fields." });
    }

    const customId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const priceValue = parseInt(price) * 100;

    const coverUpload = await uploadToCloudinary(req.files['cover'][0].buffer, 'haynes/covers');
    const coverUrl = coverUpload.secure_url;

    const courseResult = db.prepare(
      'INSERT INTO academy_items (title, category, description, image_url, price, custom_id, type, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, category, description, coverUrl, priceValue, customId, 'Course', 1);

    const newCourseId = courseResult.lastInsertRowid;

    const uploadPromises = req.files['pdfs'].map(async (file) => {
      const pdfUpload = await uploadToCloudinary(file.buffer, 'haynes/pdfs');
      return { name: file.originalname.replace('.pdf', ''), url: pdfUpload.secure_url };
    });

    const uploadedPdfs = await Promise.all(uploadPromises);
    const insertBook = db.prepare('INSERT INTO academy_books (course_id, name, file_url, cover_url) VALUES (?, ?, ?, ?)');
    uploadedPdfs.forEach(pdf => insertBook.run(newCourseId, pdf.name, pdf.url, null));

    res.json({ success: true });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Failed to upload to cloud" });
  }
});

app.delete('/api/admin/courses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM academy_books WHERE course_id = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM academy_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses', (req, res) => {
  try {
    const courses = db.prepare("SELECT * FROM academy_items WHERE custom_id IS NOT NULL AND custom_id != ''").all();
    const books = db.prepare('SELECT * FROM academy_books').all();
    const resCourses = courses.map(c => ({
      ...c,
      books: books.filter(b => b.course_id === c.id).map(b => ({ name: b.name, file: b.file_url, cover: b.cover_url }))
    }));
    res.json(resCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BLOG ---
app.get('/api/blog', (req, res) => {
  try {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/blog', upload.single('cover'), async (req, res) => {
  try {
    const { title, category, description, content } = req.body;
    if (!title || !category || !description || !content || !req.file) {
      return res.status(400).json({ error: "Missing required fields or cover image." });
    }
    const coverUpload = await uploadToCloudinary(req.file.buffer, 'haynes/blogs');
    const result = db.prepare(
      'INSERT INTO blog_posts (title, category, description, content, image_url) VALUES (?, ?, ?, ?, ?)'
    ).run(title, category, description, content, coverUpload.secure_url);
    res.json({ success: true, postId: result.lastInsertRowid });
  } catch (err) {
    console.error("Blog upload error:", err);
    res.status(500).json({ error: "Failed to upload to cloud" });
  }
});

app.delete('/api/admin/blog/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ANALYSIS ---
app.get('/api/admin/analysis', (req, res) => {
  try {
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const transRow = db.prepare("SELECT SUM(amount) as totalRevenue, COUNT(*) as totalSales FROM transactions WHERE status='success' OR status='completed'").get();
    const courses = db.prepare('SELECT COUNT(*) as count FROM academy_items').get().count;
    const blogs = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get().count;
    const recentTransactions = db.prepare('SELECT email, amount, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 5').all();

    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
      FROM transactions
      WHERE (status='success' OR status='completed') AND created_at >= date('now', '-6 months')
      GROUP BY month ORDER BY month ASC
    `).all();

    const monthlyActivity = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM transactions
      WHERE created_at >= date('now', '-6 months')
      GROUP BY month ORDER BY month ASC
    `).all();

    const salesByCourse = db.prepare(`
      SELECT course_id, COUNT(*) as sales, SUM(amount) as revenue
      FROM transactions
      WHERE (status='success' OR status='completed') AND course_id IS NOT NULL AND course_id != ''
      GROUP BY course_id ORDER BY sales DESC LIMIT 8
    `).all();

    res.json({
      users,
      revenue: transRow.totalRevenue ? (transRow.totalRevenue / 100) : 0,
      sales: transRow.totalSales || 0,
      courses,
      blogs,
      recentTransactions,
      charts: {
        monthlyRevenue: monthlyRevenue.map(r => ({ month: r.month, total: r.total / 100 })),
        monthlyActivity,
        salesByCourse: salesByCourse.map(r => ({ course: r.course_id, sales: r.sales, revenue: r.revenue / 100 }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
