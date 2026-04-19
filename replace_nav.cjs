const fs = require('fs');
const indexContent = fs.readFileSync('D:/Haynes/index.html', 'utf8');
const navRegex = /<nav class="nav" id="nav">[\s\S]*?<\/nav>/;
let match = indexContent.match(navRegex);
if (!match) {
  console.log('Nav not found in index.html');
  process.exit(1);
}
let navHtml = match[0];
navHtml = navHtml.replace(/href="#home"/g, 'href="/"');

const files = [
  'D:/Haynes/about.html',
  'D:/Haynes/academy.html',
  'D:/Haynes/case-studies.html',
  'D:/Haynes/dr-senyah.html',
  'D:/Haynes/index.html',
  'D:/Haynes/services/ai-automation.html',
  'D:/Haynes/services/dental-aesthetic.html',
  'D:/Haynes/services/digital-marketing.html',
  'D:/Haynes/services/digital-services.html',
  'D:/Haynes/services/web-development.html'
];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (file.includes('index.html')) {
        content = content.replace(/href="#home"/g, 'href="/"');
    } else {
        content = content.replace(/<nav class="nav.*?" id="nav">[\s\S]*?<\/nav>/, navHtml);
    }
    fs.writeFileSync(file, content);
    console.log('Updated nav in ' + file);
  }
});
