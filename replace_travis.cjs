const fs = require('fs');
const files = [
  'travis-pay-accounts/app/layout.tsx',
  'travis-pay-accounts/components/account-marketplace.tsx',
  'travis-pay-accounts/components/site-header.tsx',
  'travis-pay-accounts/lib/accounts.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/telegram/g, 'tiktok').replace(/Telegram/g, 'TikTok');
    fs.writeFileSync(f, content);
  }
});
console.log('Replaced successfully in travis-pay-accounts');
