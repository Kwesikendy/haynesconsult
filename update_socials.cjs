const fs = require('fs');
const path = require('path');

// The links to inject
const socialLinks = {
  instagram: 'https://www.instagram.com/haynesconsult?igsh=MWN3NWdqNGhtMmlkZw==',
  linkedin: 'https://www.linkedin.com/company/haynes-consult/',
  tiktok: 'https://www.tiktok.com/@haynesconsult?_r=1&_t=ZS-95eUS7TMtOS'
};

const newPhone = '0201985964 / 0249033269';
const drEmail = 'info@haynesconsult.com';

const tiktokSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 006.27 6.28 6.3 6.3 0 006.08-4.66 6.36 6.36 0 00.19-1.57V8.58a8.31 8.31 0 004.83 1.55V6.62a4.41 4.41 0 01-.78.07z"/></svg>';

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.agent') {
        getHtmlFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles('D:/Haynes');

for (const file of htmlFiles) {
  let cnt = fs.readFileSync(file, 'utf8');
  let originalCnt = cnt;

  // 1. Phone number global update
  cnt = cnt.replace(/\+233 (\d{3} \d{3} \d{3}|[0-9 ]+)/g, newPhone);

  // 2. Global footer text links
  cnt = cnt.replace(/href="[^"]*"([^>]*)>\s*LinkedIn\s*<\/a>/g, `href="${socialLinks.linkedin}"$1>LinkedIn</a>`);
  cnt = cnt.replace(/href="[^"]*"([^>]*)>\s*Instagram\s*<\/a>/g, `href="${socialLinks.instagram}"$1>Instagram</a>`);
  // Replace Twitter with TikTok in footer text
  cnt = cnt.replace(/href="[^"]*"([^>]*)>\s*Twitter\s*<\/a>/g, `href="${socialLinks.tiktok}"$1>TikTok</a>`);

  // 3. Social media buttons (icons)
  cnt = cnt.replace(/href="[^"]*"([\s\S]*?aria-label="LinkedIn")/g, `href="${socialLinks.linkedin}"$1`);
  cnt = cnt.replace(/href="[^"]*"([\s\S]*?aria-label="Instagram")/g, `href="${socialLinks.instagram}"$1`);

  // Replace Twitter icon with TikTok icon
  const twitterIconPattern = /<a href="[^"]*"\s*class="contact__social-btn"\s*aria-label="Twitter\/X">[\s\S]*?<\/svg>\s*<\/a>/g;
  cnt = cnt.replace(twitterIconPattern, `<a href="${socialLinks.tiktok}" class="contact__social-btn" aria-label="TikTok">\n                ${tiktokSVG}\n              </a>`);

  // 4. Dr. Senyah's email ONLY on his page
  if (file.includes('dr-senyah')) {
      cnt = cnt.replace(/info@haynesconsult\.com/g, drEmail);
  }

  if (cnt !== originalCnt) {
    fs.writeFileSync(file, cnt);
  }
}

console.log('Successfully updated all socials and contacts!');
