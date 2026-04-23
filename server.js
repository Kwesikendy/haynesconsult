import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import db, { initDb } from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

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
    if(!title || !req.files['cover'] || !req.files['pdfs']) {
      return res.status(400).json({error: "Missing required files or fields."});
    }

    const customId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const priceValue = parseInt(price) * 100; // stored in pesewas for Paystack

    // Upload cover image
    const coverUpload = await uploadToCloudinary(req.files['cover'][0].buffer, 'haynes/covers');
    const coverUrl = coverUpload.secure_url;

    db.run(
      `INSERT INTO academy_items (title, category, description, image_url, price, custom_id, type, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, description, coverUrl, priceValue, customId, 'Course', 1],
      async function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const newCourseId = this.lastID;
        
        try {
          // Upload PDFs in parallel
          const uploadPromises = req.files['pdfs'].map(async (file) => {
            const pdfUpload = await uploadToCloudinary(file.buffer, 'haynes/pdfs');
            return { name: file.originalname.replace('.pdf', ''), url: pdfUpload.secure_url };
          });

          const uploadedPdfs = await Promise.all(uploadPromises);

          const statement = db.prepare(`INSERT INTO academy_books (course_id, name, file_url, cover_url) VALUES (?, ?, ?, ?)`);
          uploadedPdfs.forEach(pdf => {
            statement.run([newCourseId, pdf.name, pdf.url, null]);
          });
          statement.finalize();
          
          res.json({ success: true });
        } catch(pdfErr) {
          console.error("Cloudinary PDF upload error:", pdfErr);
          res.status(500).json({ error: "Cloudinary upload failed for PDFs (files might be too large)" });
        }
      }
    );
  } catch(err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Failed to upload to cloud" });
  }
});

app.delete('/api/admin/courses/:id', (req, res) => {
  const courseId = req.params.id;
  db.run(`DELETE FROM academy_books WHERE course_id = ?`, [courseId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`DELETE FROM academy_items WHERE id = ?`, [courseId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, deleted: this.changes });
    });
  });
});

app.put('/api/admin/courses/:id', (req, res) => {
  const courseId = req.params.id;
  const { title, category, description, price } = req.body;
  if(!title || !category || !description) return res.status(400).json({error: "Missing fields"});
  
  const priceValue = parseInt(price) * 100;
  
  db.run(
    `UPDATE academy_items SET title = ?, category = ?, description = ?, price = ? WHERE id = ?`,
    [title, category, description, priceValue, courseId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, updated: this.changes });
    }
  );
});

app.get('/api/courses', (req, res) => {
  db.all(`SELECT * FROM academy_items WHERE custom_id IS NOT NULL AND custom_id != ''`, [], (err, courses) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT * FROM academy_books`, [], (err, books) => {
       if (err) return res.status(500).json({ error: err.message });
       const resCourses = courses.map(c => ({
         ...c,
         books: books.filter(b => b.course_id === c.id).map(b => ({ name: b.name, file: b.file_url, cover: b.cover_url }))
       }));
       res.json(resCourses);
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
