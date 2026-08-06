const fs = require('fs');
const files = [
  'app/admin/page.tsx',
  'components/account-marketplace.tsx',
  'components/site-header.tsx',
  'database.js',
  'lib/accounts.ts'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/telegram/g, 'tiktok').replace(/Telegram/g, 'TikTok');
  fs.writeFileSync(f, content);
});
console.log('Replaced successfully');
