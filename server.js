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
app.use(cors({
  origin: ['https://haynesconsult.com', 'https://www.haynesconsult.com', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// 301 Redirects for old/incorrect URLs — keeps SEO equity and fixes broken links
app.get(['/about-us', '/about-us.html'], (req, res) => {
  res.redirect(301, '/about.html');
});

app.get(['/about-us/dr-martin-senyah', '/about-us/dr-martin-senyah.html'], (req, res) => {
  res.redirect(301, '/dr-senyah.html');
});

app.get(['/edify', '/edify.html'], (req, res) => {
  res.redirect(301, '/health-dashboard.html');
});

// Serve built frontend
app.use(express.static(path.join(__dirname, 'dist'), { extensions: ['html'] }));

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


function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  });
}

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + credential);
    const data = await response.json();
    if (data.error) return res.status(401).json({ error: 'Invalid token' });
    
    const allowedAdmins = ["dogbeynathan7@gmail.com", "info@haynesconsult.com", "attaboatengsenyah@gmail.com", "senyahmartin64@gmail.com"];
    if (allowedAdmins.includes(data.email)) {
      const token = jwt.sign({ email: data.email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, role: 'admin', email: data.email });
    }
    
    const token = jwt.sign({ email: data.email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: 'user', email: data.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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

app.post('/api/payments/record', async (req, res) => {
  const { email, courseId, amount, reference, status } = req.body;
  if (!email || !reference) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    const paystackData = await paystackRes.json();
    
    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    if (paystackData.data.amount < amount) {
       return res.status(400).json({ error: 'Payment amount mismatch' });
    }

    const result = db.prepare(
      'INSERT INTO transactions (email, course_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)'
    ).run(email, courseId, amount, reference, 'success');
    res.json({ success: true, message: 'Transaction verified and recorded', transactionId: result.lastInsertRowid });
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

app.post('/api/admin/courses', authenticateAdmin, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdfs', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const { title, category, description, price } = req.body;
    const hasPdfs = req.files['pdfs'] && req.files['pdfs'].length > 0;
    const hasVideos = req.files['videos'] && req.files['videos'].length > 0;

    if (!title || !req.files['cover'] || (!hasPdfs && !hasVideos)) {
      return res.status(400).json({ error: "Missing required files or fields. Please upload at least one PDF or video." });
    }

    const customId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const priceValue = parseInt(price) * 100;

    const coverUpload = await uploadToCloudinary(req.files['cover'][0].buffer, 'haynes/covers');
    const coverUrl = coverUpload.secure_url;

    const courseResult = db.prepare(
      'INSERT INTO academy_items (title, category, description, image_url, price, custom_id, type, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, category, description, coverUrl, priceValue, customId, 'Course', 1);

    const newCourseId = courseResult.lastInsertRowid;
    const insertBook = db.prepare('INSERT INTO academy_books (course_id, name, file_url, cover_url) VALUES (?, ?, ?, ?)');

    // Upload PDFs
    if (hasPdfs) {
      const pdfPromises = req.files['pdfs'].map(async (file) => {
        const pdfUpload = await uploadToCloudinary(file.buffer, 'haynes/pdfs');
        return { name: file.originalname.replace(/\.pdf$/i, ''), url: pdfUpload.secure_url };
      });
      const uploadedPdfs = await Promise.all(pdfPromises);
      uploadedPdfs.forEach(pdf => insertBook.run(newCourseId, pdf.name, pdf.url, null));
    }

    // Upload Videos
    if (hasVideos) {
      const videoPromises = req.files['videos'].map(async (file) => {
        const ext = file.originalname.split('.').pop();
        const videoUpload = await uploadToCloudinary(file.buffer, 'haynes/videos');
        const cleanName = file.originalname.replace(/\.[^.]+$/, '');
        return { name: '🎬 ' + cleanName, url: videoUpload.secure_url };
      });
      const uploadedVideos = await Promise.all(videoPromises);
      uploadedVideos.forEach(video => insertBook.run(newCourseId, video.name, video.url, null));
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Failed to upload to cloud" });
  }
});

app.delete('/api/admin/courses/:id', authenticateAdmin, (req, res) => {
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

app.get('/api/blog/:id', (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/blog', authenticateAdmin, upload.single('cover'), async (req, res) => {
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

app.delete('/api/admin/blog/:id', authenticateAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// --- CASE STUDIES ---
app.get('/api/case-studies', (req, res) => {
  try {
    const caseStudies = db.prepare('SELECT * FROM case_studies ORDER BY created_at ASC').all();
    res.json(caseStudies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/case-studies', authenticateAdmin, upload.single('cover'), async (req, res) => {
  try {
    const { title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label } = req.body;
    if (!title || !category || !req.file) {
      return res.status(400).json({ error: "Missing required fields or cover image." });
    }
    const coverUpload = await uploadToCloudinary(req.file.buffer, 'haynes/cases');
    const result = db.prepare(
      'INSERT INTO case_studies (title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label, coverUpload.secure_url);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("Case study upload error:", err);
    res.status(500).json({ error: "Failed to upload to cloud" });
  }
});

app.put('/api/admin/case-studies/:id', authenticateAdmin, upload.single('cover'), async (req, res) => {
  try {
    const { title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label } = req.body;
    let imageUrl = null;
    if (req.file) {
      const coverUpload = await uploadToCloudinary(req.file.buffer, 'haynes/cases');
      imageUrl = coverUpload.secure_url;
    }
    
    if (imageUrl) {
      db.prepare('UPDATE case_studies SET title=?, category=?, context=?, strategy=?, results=?, metric1_val=?, metric1_label=?, metric2_val=?, metric2_label=?, image_url=? WHERE id=?').run(title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label, imageUrl, req.params.id);
    } else {
      db.prepare('UPDATE case_studies SET title=?, category=?, context=?, strategy=?, results=?, metric1_val=?, metric1_label=?, metric2_val=?, metric2_label=? WHERE id=?').run(title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label, req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Case study update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/case-studies/:id', authenticateAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM case_studies WHERE id = ?').run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- EDIFY SELF-SERVE ONBOARDING & SUBSCRIPTIONS ---
const EDIFY_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Clinic',
    monthly: 600,
    annual: 6000,
    currency: 'GHS',
    badge: 'Solo & Small Practices',
    features: [
      'Up to 3 Staff Accounts & 1 Clinic Branch',
      'Full FHIR R4 Electronic Health Records (EHR)',
      'Digital Patient Queue System (Token A001 + Waiting List)',
      'Automated SMS & Email Appointment Confirmations',
      'Cash, Mobile Money & Card Billing + Instant PDF Receipts'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional Clinic',
    monthly: 1000,
    annual: 8500,
    currency: 'GHS',
    badge: 'Most Popular',
    features: [
      'Up to 15 Staff Accounts & 2 Clinic Branches',
      'AI Clinical Voice Scribe & Smart SOAP Notes',
      '3-Stage Automated Reminders (24h, Morning-Of, 2h Before)',
      'Specialty Modules (32-Tooth FDI Dental Chart, Optical, Vitals)',
      'Live Waiting Room TV Display & Voice Calling',
      'Pharmacy Inventory, E-Prescribing & Lab Worklists'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Hospital',
    monthly: 2200,
    annual: 20000,
    currency: 'GHS',
    badge: 'Multi-Branch & Hospitals',
    features: [
      'Unlimited Staff Accounts & Multi-Branch Isolation',
      'NHIS Claims XML Vetting & Corporate Insurance Billing',
      'Inpatient Ward & Bed Management (ADT) + Shift Handover',
      'Full AI Clinical Copilot, Analytics & Revenue Forecasting',
      'Dedicated Onboarding Engineer & 24/7 Priority SLA'
    ]
  }
};

app.get('/api/edify/plans', (req, res) => {
  res.json({
    currency: 'GHS',
    plans: Object.values(EDIFY_PLANS)
  });
});

app.post('/api/edify/onboard', async (req, res) => {
  try {
    const {
      hospitalName,
      selectedInstitution,
      specialization,
      firstName,
      lastName,
      email,
      phone,
      password,
      branches,
      planId,
      billingCycle,
      reference
    } = req.body || {};

    const cleanClinicName = (hospitalName || selectedInstitution || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFirst = (firstName || '').trim();
    const cleanLast = (lastName || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanSpec = (specialization || 'General Hospital').trim();
    const cleanCycle = (billingCycle || 'monthly').trim().toLowerCase();
    const plan = EDIFY_PLANS[planId];

    if (!cleanClinicName || !cleanFirst || !cleanLast || !cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide clinic name, administrator name, and a valid email address.' });
    }
    if (!password || String(password).length < 12) {
      return res.status(400).json({ error: 'Administrator password must be at least 12 characters long.' });
    }
    if (!plan) {
      return res.status(400).json({ error: 'Invalid subscription package selected.' });
    }
    if (!['monthly', 'annual', 'trial'].includes(cleanCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle. Choose monthly, annual, or trial.' });
    }

    const expectedAmountGhs = cleanCycle === 'trial' ? 0 : (cleanCycle === 'annual' ? plan.annual : plan.monthly);
    const expectedAmountPesewas = expectedAmountGhs * 100;
    const txReference = reference || `EDIFY-${ cleanCycle.toUpperCase() }-${ Date.now() }`;

    // Verify payment if not a free trial
    if (cleanCycle !== 'trial') {
      if (!reference) {
        return res.status(400).json({ error: 'Payment reference is required for paid subscriptions.' });
      }
      const isSimulated = String(reference).startsWith('EDIFY-SIM-') && process.env.ALLOW_SIMULATED_PAYMENTS !== 'false';
      if (!isSimulated) {
        if (!process.env.PAYSTACK_SECRET_KEY) {
          return res.status(400).json({ error: 'Paystack secret key not configured on server.' });
        }
        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        });
        const paystackData = await paystackRes.json();
        if (!paystackData.status || !paystackData.data || paystackData.data.status !== 'success') {
          return res.status(400).json({ error: 'Payment verification failed with Paystack.' });
        }
        if (paystackData.data.amount < expectedAmountPesewas) {
          return res.status(400).json({ error: 'Verified payment amount does not match selected package price.' });
        }
      }
    }

    // Calculate expiry date
    const now = new Date();
    const daysToAdd = cleanCycle === 'trial' ? 14 : (cleanCycle === 'annual' ? 365 : 30);
    const expiresDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const paidAtIso = now.toISOString();
    const expiresAtIso = expiresDate.toISOString();

    // Provision clinic on Edify Backend
    const edifyBaseUrl = (process.env.EDIFY_API_URL || 'https://edify.haynesconsult.com').replace(/\/+$/, '');
    const edifyPortalBase = (process.env.EDIFY_PORTAL_URL || 'https://edify.haynesconsult.com').replace(/\/+$/, '');
    let edifyOrgId = null;
    let provisionedWarning = null;

    const normalizedBranches = Array.isArray(branches) && branches.length > 0
      ? branches
      : [{ name: `${cleanClinicName} (Main Branch)`, address: 'Accra, Ghana', phone: cleanPhone }];

    try {
      const edifyRes = await fetch(`${edifyBaseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: cleanClinicName,
          selectedInstitution: selectedInstitution || 'Custom',
          specialization: cleanSpec,
          firstName: cleanFirst,
          lastName: cleanLast,
          email: cleanEmail,
          phone: cleanPhone,
          password,
          branches: normalizedBranches,
          subscription: {
            planId: plan.id,
            planName: plan.name,
            billingCycle: cleanCycle,
            amount: expectedAmountGhs,
            currency: 'GHS',
            reference: txReference,
            status: cleanCycle === 'trial' ? 'trial' : 'active',
            expiresAt: expiresAtIso
          }
        })
      });
      const edifyData = await edifyRes.json().catch(() => ({}));
      if (edifyRes.ok && edifyData.organizationId) {
        edifyOrgId = edifyData.organizationId;
      } else if (!edifyRes.ok) {
        provisionedWarning = edifyData.error || 'Clinic subscription recorded; complete portal activation via the link below.';
      }
    } catch (err) {
      provisionedWarning = 'Subscription confirmed and saved. Click your portal link below to finish syncing your workspace.';
    }

    const adminFullName = `Dr. ${cleanFirst} ${cleanLast}`.replace(/^Dr\.\s+Dr\.\s+/i, 'Dr. ');
    const subStatus = cleanCycle === 'trial' ? 'trial' : 'active';

    const insertSub = db.prepare(`
      INSERT INTO edify_subscriptions (
        clinic_name, clinic_type, admin_name, email, phone,
        plan_id, plan_name, billing_cycle, amount, currency,
        reference, status, expires_at, edify_org_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'GHS', ?, ?, ?, ?)
    `);
    const subResult = insertSub.run(
      cleanClinicName,
      cleanSpec,
      adminFullName,
      cleanEmail,
      cleanPhone,
      plan.id,
      plan.name,
      cleanCycle,
      expectedAmountGhs,
      txReference,
      subStatus,
      expiresAtIso,
      edifyOrgId
    );

    if (expectedAmountPesewas > 0) {
      db.prepare(
        'INSERT INTO transactions (email, course_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)'
      ).run(cleanEmail, `edify-${plan.id}-${cleanCycle}`, expectedAmountPesewas, txReference, 'success');
    }

    const receiptNo = `EDF-RCP-${String(subResult.lastInsertRowid).padStart(5, '0')}`;
    const receipt = {
      receiptNo,
      reference: txReference,
      clinicName: cleanClinicName,
      clinicType: cleanSpec,
      adminName: adminFullName,
      email: cleanEmail,
      phone: cleanPhone,
      planId: plan.id,
      planName: plan.name,
      billingCycle: cleanCycle,
      amount: expectedAmountGhs,
      currency: 'GHS',
      status: subStatus,
      paidAt: paidAtIso,
      expiresAt: expiresAtIso,
      edifyOrgId
    };

    const queryParams = new URLSearchParams({
      onboarded: '1',
      clinic: cleanClinicName,
      email: cleanEmail,
      plan: plan.id,
      cycle: cleanCycle,
      ref: txReference
    }).toString();

    res.json({
      success: true,
      receipt,
      provisioned: Boolean(edifyOrgId),
      provisionedWarning,
      edifyLoginUrl: `${edifyPortalBase}/login?${queryParams}`,
      edifyRegisterUrl: `${edifyPortalBase}/register?${queryParams}`,
      localEdifyLoginUrl: `http://localhost:5173/login?${queryParams}`
    });
  } catch (err) {
    console.error('Edify onboarding error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete onboarding' });
  }
});

app.get('/api/edify/receipt/:reference', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM edify_subscriptions WHERE reference = ?').get(req.params.reference);
    if (!row) return res.status(404).json({ error: 'Receipt not found' });
    res.json({
      receiptNo: `EDF-RCP-${String(row.id).padStart(5, '0')}`,
      reference: row.reference,
      clinicName: row.clinic_name,
      clinicType: row.clinic_type,
      adminName: row.admin_name,
      email: row.email,
      phone: row.phone,
      planId: row.plan_id,
      planName: row.plan_name,
      billingCycle: row.billing_cycle,
      amount: row.amount,
      currency: row.currency || 'GHS',
      status: row.status,
      paidAt: row.created_at,
      expiresAt: row.expires_at,
      edifyOrgId: row.edify_org_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/edify-subscriptions', authenticateAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM edify_subscriptions ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ANALYSIS ---
app.get('/api/admin/analysis', authenticateAdmin, (req, res) => {
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
