const fs = require('fs');
const f = 'D:/Haynes/index.html';
let cnt = fs.readFileSync(f, 'utf8');

// Replace the client_18 img tag with empty string
cnt = cnt.replace(/\n\s*<img src="\/clients\/client_18\.jpeg" class="clients__logo" alt="Client 18">/g, '');

fs.writeFileSync(f, cnt);
console.log('done removing client_18.jpeg from index.html');
