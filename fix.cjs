const fs = require('fs');
let content = fs.readFileSync('D:/Haynes/services/digital-services.html', 'utf8');

content = content.replace(
  "background-image: linear-gradient(150deg, rgba(13,43,126,0.9) 0%, rgba(5,15,50,0.85) 100%), url('/hero2.jpeg'); background-size: cover; background-position: center; background-repeat: no-repeat;",
  "background: linear-gradient(150deg, #ffffff 0%, #eaf4fb 40%, #d6ecfb 70%, #f0f8ff 100%);"
);

content = content.replace(
  "color: #a4cefc; margin-bottom: 28px; transition: gap 0.2s;",
  "color: var(--royal); margin-bottom: 28px; transition: gap 0.2s;"
);

content = content.replace(
  "color: #a4cefc; font-size: 12px; font-weight: 700;",
  "color: var(--royal); font-size: 12px; font-weight: 700;"
);

content = content.replace(
  "font-weight: 900; color: #ffffff; line-height: 1.08; margin-bottom: 20px;",
  "font-weight: 900; color: var(--navy); line-height: 1.08; margin-bottom: 20px;"
);

content = content.replace(
  "font-weight: 800; color: #ffffff; margin-bottom: 12px;",
  "font-weight: 800; color: var(--navy); margin-bottom: 12px;"
);

content = content.replace(
  "margin-bottom: 20px; color: #a4cefc;",
  "margin-bottom: 20px; color: var(--royal);"
);

content = content.replace(
  /font-weight: 800;\s*color: #ffffff; margin-bottom: 10px;/g,
  "font-weight: 800; color: var(--navy); margin-bottom: 10px;"
);

content = content.replace(
  /color: #a4cefc; margin-top: 24px;/g,
  "color: var(--royal); margin-top: 24px;"
);

content = content.replace(
  /color: #a4cefc; background: rgba\(21,101,192,0\.07\);/g,
  "color: var(--royal); background: rgba(21,101,192,0.07);"
);

content = content.replace(
  /font-weight: 700; color: #ffffff; margin-bottom: 8px;/g,
  "font-weight: 700; color: var(--navy); margin-bottom: 8px;"
);

fs.writeFileSync('D:/Haynes/services/digital-services.html', content);
