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
  });
}

export default db;
