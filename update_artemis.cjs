const fs = require('fs');
const f = 'D:/Haynes/index.html';
let cnt = fs.readFileSync(f, 'utf8');
cnt = cnt.replace(/<img src="\/clients\/client_18\.jpeg" class="clients__logo" alt="Client 18">/g, 
'<img src="/clients/client_18.jpeg" class="clients__logo" alt="Client 18">\n            <img src="/clients/artemis.jpeg" class="clients__logo" alt="Artemis">');
fs.writeFileSync(f, cnt);
console.log('done replacing index.html with artemis');
