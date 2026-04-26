import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbFile = resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

export function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )`);

    // Academy Items (eBooks, Modules)
    db.run(`CREATE TABLE IF NOT EXISTS academy_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      type TEXT,
      category TEXT,
      description TEXT,
      image_url TEXT,
      is_premium INTEGER
    )`, () => {
      // Seed some items if they don't exist
      db.get('SELECT COUNT(*) as count FROM academy_items', (err, row) => {
        if (row && row.count === 0) {
          const stmt = db.prepare('INSERT INTO academy_items (title, type, category, description, image_url, is_premium) VALUES (?, ?, ?, ?, ?, ?)');
          stmt.run("Digital Transformation Framework", "eBook", "Business Strategy", "Complete guide to modernizing your clinic.", "/logo.jpeg", 0);
          stmt.run("AI Integration Masterclass", "Module", "Technology", "Learn how to use AI for daily operations.", "/logo.jpeg", 1);
          stmt.run("The Patient Acquisition Playbook", "eBook", "Marketing", "How to grow your patient base.", "/logo.jpeg", 1);
          stmt.run("Workflow Automation Cheatsheet", "eBook", "Business Strategy", "Actionable automation templates.", "/logo.jpeg", 0);
          stmt.finalize();
        }
      });
    });

    // Purchases
    db.run(`CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      item_id INTEGER,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Transactions (Paystack Guest Checkouts)
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      course_id TEXT,
      amount INTEGER,
      reference TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Blog Posts
    db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      description TEXT,
      content TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      db.get('SELECT COUNT(*) as count FROM blog_posts', (err, row) => {
        if (row && row.count === 0) {
          const stmt = db.prepare('INSERT INTO blog_posts (title, category, description, content, image_url) VALUES (?, ?, ?, ?, ?)');
          stmt.run(
            "How AI is Transforming Healthcare Administration", 
            "AI & Automation", 
            "Discover how clinics are using AI to reduce no-shows, automate patient intake, and streamline billing processes.", 
            "<p>Artificial Intelligence is no longer just a buzzword; it is actively transforming how healthcare facilities operate...</p>", 
            "/logo.jpeg"
          );
          stmt.finalize();
        }
      });
    });
  });
}

export default db;
