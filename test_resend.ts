import { sendVerificationEmail } from './lib/mailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('--- ENV CHECK ---');
console.log('RESEND_API_KEY available?', !!process.env.RESEND_API_KEY);
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
console.log('-----------------\n');

sendVerificationEmail('test@example.com', '123456')
  .then(res => console.log('Result:', res))
  .catch(err => console.error('Caught Error:', err));
