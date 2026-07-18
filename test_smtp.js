import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'travispay4@gmail.com',
    pass: 'ejwvytlkuqmzmexu',
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: '"Test" <travispay4@gmail.com>',
      to: 'travispay4@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email to verify credentials.',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

main();
