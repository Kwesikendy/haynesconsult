import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbFile = resolve(__dirname, 'database.sqlite');
const db = new Database(dbFile);

export function initDb() {
  // Users table
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  )`);

  // Academy Items
  db.exec(`CREATE TABLE IF NOT EXISTS academy_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    category TEXT,
    description TEXT,
    image_url TEXT,
    price INTEGER DEFAULT 0,
    custom_id TEXT,
    is_premium INTEGER DEFAULT 0
  )`);

  // Academy Books (PDFs linked to courses)
  db.exec(`CREATE TABLE IF NOT EXISTS academy_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    name TEXT,
    file_url TEXT,
    cover_url TEXT
  )`);

  // Purchases
  db.exec(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item_id INTEGER,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transactions
  db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    course_id TEXT,
    amount INTEGER,
    reference TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Blog Posts
  db.exec(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed academy items if empty
  const academyCount = db.prepare('SELECT COUNT(*) as count FROM academy_items').get();
  if (academyCount.count === 0) {
    const insert = db.prepare('INSERT INTO academy_items (title, type, category, description, image_url, is_premium) VALUES (?, ?, ?, ?, ?, ?)');
    insert.run("Digital Transformation Framework", "eBook", "Business Strategy", "Complete guide to modernizing your clinic.", "/logo.jpeg", 0);
    insert.run("AI Integration Masterclass", "Module", "Technology", "Learn how to use AI for daily operations.", "/logo.jpeg", 1);
    insert.run("The Patient Acquisition Playbook", "eBook", "Marketing", "How to grow your patient base.", "/logo.jpeg", 1);
    insert.run("Workflow Automation Cheatsheet", "eBook", "Business Strategy", "Actionable automation templates.", "/logo.jpeg", 0);
  }

  // Seed blog posts if empty
  const blogCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
  if (blogCount.count === 0) {
    db.prepare('INSERT INTO blog_posts (title, category, description, content, image_url) VALUES (?, ?, ?, ?, ?)').run(
      "How AI is Transforming Healthcare Administration",
      "AI & Automation",
      "Discover how clinics are using AI to reduce no-shows, automate patient intake, and streamline billing processes.",
      "<p>Artificial Intelligence is no longer just a buzzword; it is actively transforming how healthcare facilities operate...</p>",
      "/logo.jpeg"
    );
  }
}

export default db;
