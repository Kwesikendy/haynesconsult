const fs = require('fs');
const path = require('path');

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

const hashes = ['#contact', '#about', '#services', '#process', '#industries', '#team'];

for (const file of htmlFiles) {
  // we do not touch index.html because we want smooth scrolling without refresh
  if (file.endsWith('index.html')) continue;

  let cnt = fs.readFileSync(file, 'utf8');
  let originalCnt = cnt;

  for (const hash of hashes) {
    // we match href="#contact" exactly
    const regex = new RegExp(`href="${hash}"`, 'g');
    cnt = cnt.replace(regex, `href="/${hash}"`);
  }

  if (cnt !== originalCnt) {
    fs.writeFileSync(file, cnt);
  }
}

console.log('Successfully fixed subpage nav hashes!');
