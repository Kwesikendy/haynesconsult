const fs = require('fs');

// 1. Remove rogue scripts causing duplicate cursors
const htmlFiles = [
  'D:/Haynes/services/web-development.html',
  'D:/Haynes/services/digital-services.html',
  'D:/Haynes/services/digital-marketing.html',
  'D:/Haynes/services/ai-automation.html'
];
htmlFiles.forEach(f => {
  if(fs.existsSync(f)) {
    let cnt = fs.readFileSync(f, 'utf8');
    cnt = cnt.replace(/<script type="module" src="\/src\/service-page\.js"><\/script>/g, '');
    fs.writeFileSync(f, cnt);
  }
});

// 2. Move file
if(fs.existsSync('D:/Haynes/client2.jpeg')) {
  fs.copyFileSync('D:/Haynes/client2.jpeg', 'D:/Haynes/clients/client2.jpeg');
  fs.unlinkSync('D:/Haynes/client2.jpeg');
}

// 3. Add to index.html marquee
let indexHtml = fs.readFileSync('D:/Haynes/index.html', 'utf8');
const toInsert = '\n            <img src="/clients/client2.jpeg" class="clients__logo" alt="Client 18">';
indexHtml = indexHtml.replace(/(<img src="\/clients\/client_17\.jpeg" class="clients__logo" alt="Client 17">)/g, '$1' + toInsert);
fs.writeFileSync('D:/Haynes/index.html', indexHtml);

console.log('Done');
