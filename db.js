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

  // Case Studies
  db.exec(`CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    context TEXT,
    strategy TEXT,
    results TEXT,
    metric1_val TEXT,
    metric1_label TEXT,
    metric2_val TEXT,
    metric2_label TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed case studies if empty
  const csCount = db.prepare('SELECT COUNT(*) as count FROM case_studies').get();
  if (csCount.count === 0) {
    const insertCS = db.prepare('INSERT INTO case_studies (title, category, context, strategy, results, metric1_val, metric1_label, metric2_val, metric2_label, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    insertCS.run(
      "From Blueprint to Breakthrough: Mid City Dental Clinic",
      "Dental Practice Growth",
      "<p>Mid City Dental Clinic came to Haynes Consult before their practice had even opened its doors. They had the clinical vision but needed a clear strategy to launch, attract patients, and generate revenue from day one.</p>",
      "<p>We engaged the team at the pre-launch stage, conducting a full strategic assessment and developing a phased growth plan tailored to their market. A key pillar of that plan was building structured pathways to attract funded and insured patients, creating a reliable, reimbursement-backed patient flow from the very beginning.</p><p style=\"margin-top: 12px;\">Within three months of opening, Mid City Dental Clinic had welcomed over 400 patients and was generating an average of GHS 100,000 every month. The results spoke for themselves, the clinic was so encouraged by the pace of growth that they returned to Haynes Consult for further implementation and expanded strategic support.</p>",
      "<li style=\"margin-bottom: 8px;\">Engaged pre-launch, full strategic plan developed before opening</li><li style=\"margin-bottom: 8px;\">Funded patient pipeline established within the first quarter</li><li style=\"margin-bottom: 8px;\">400+ patients acquired within 3 months of opening</li><li style=\"margin-bottom: 8px;\">Average monthly revenue of GHS 100,000 achieved within 3 months</li><li style=\"margin-bottom: 8px;\">Client returned for continued strategic partnership</li>",
      "400+", "New Patients", "100k+", "Avg. Monthly Rev (GHS)",
      "/clients/client_01.jpeg"
    );

    insertCS.run(
      "Building a Digital Voice: Ghana Dental Association (GDA)",
      "Digital Transformation",
      "<p>When Haynes Consult partnered with the Ghana Dental Association, the organisation had no functional digital presence. They had no structured website, no content strategy, and no system for communicating with members or the wider public. For the body representing dental professionals across Ghana, that gap needed to close.</p>",
      "<p>We came in and built everything from the ground up. We rebuilt the GDA’s website into a credible, professional platform and went a step further by integrating the World Oral Health Day website directly into the GDA’s main site, expanding its reach and relevance. We also developed a comprehensive national database of all dentists in Ghana, a resource warmly received across the profession and one that significantly boosted the GDA’s utility to its members.</p><p style=\"margin-top: 12px;\">On social media, we structured the GDA’s entire content strategy by establishing a consistent voice, an editorial content calendar, and a posting cadence that gave the association a visible, active presence online. The results were immediate and measurable: the GDA’s WhatsApp channel grew by 93%, their LinkedIn page saw a 95% increase in following, and engagement on Instagram rose significantly.</p><p style=\"margin-top: 12px;\">Campaigns like the 16-day #RealDentistGhana anti-quackery drive, anchored around World Oral Health Day 2026, put the GDA firmly in the national conversation. People started asking the right questions. The association became more active, more visible, and more authoritative.</p><p style=\"margin-top: 12px;\">The impact didn’t go unnoticed. The Ghana Dental Association went on to win the Best Media Award at the FDI World Dental Congress. This was a global recognition of the digital transformation that Haynes Consult helped make possible.</p>",
      "<li style=\"margin-bottom: 8px;\">Full website rebuild, including integration of the World Oral Health Day platform</li><li style=\"margin-bottom: 8px;\">Comprehensive national database of dentists in Ghana created and launched</li><li style=\"margin-bottom: 8px;\">WhatsApp channel following grew by 93%</li><li style=\"margin-bottom: 8px;\">LinkedIn page following grew by 95%</li><li style=\"margin-bottom: 8px;\">Increased engagement across Instagram</li><li style=\"margin-bottom: 8px;\">Structured content calendar and social media strategy implemented</li><li style=\"margin-bottom: 8px;\">GDA awarded Best Media Award at the FDI World Dental Congress</li>",
      "95%", "LinkedIn Growth", "Winner", "FDI Best Media Award",
      "/clients/client_09.jpeg"
    );

    insertCS.run(
      "From Hidden Gem to the Go-to Choice: Standard Practice Eye & Dental",
      "Practice Growth & SEO",
      "<p>Standard Practice Eye &amp; Dental had the clinical expertise, but the community didn’t know they existed. Without a digital footprint, no optimised online presence, and no website to direct potential patients, they were missing the visibility that modern healthcare seekers expect before booking an appointment.</p>",
      "<p>Haynes Consult stepped in to change that. We started by building and optimising their Google Business Profile to ensure the practice showed up when people in their area were searching for dental and eye care services. We then developed a professional website that clearly communicated their services, built trust, and made it easy for new patients to find and contact them. Alongside this, we put the right digital structures in place to support consistent growth and maintain that momentum.</p><p style=\"margin-top: 12px;\">The impact was significant. Within eight months, Standard Practice Eye &amp; Dental had seen 708 new patients. This was a direct result of increased visibility, a credible online presence, and the strategic groundwork Haynes Consult laid from day one. The practice had gone from largely unknown to a recognised name in their local market, with a strong foundation for continued growth.</p>",
      "<li style=\"margin-bottom: 8px;\">Google Business Profile built and fully optimised</li><li style=\"margin-bottom: 8px;\">Professional website developed and launched</li><li style=\"margin-bottom: 8px;\">Right digital systems and structures put in place for sustainable growth</li><li style=\"margin-bottom: 8px;\">708 new patients acquired within 8 months</li><li style=\"margin-bottom: 8px;\">Significant increase in local visibility and community recognition</li>",
      "708", "Patients Acquired", "8 mo", "Timeframe to Scale",
      "/clients/standard_practice.png"
    );
  }
}

export default db;
