import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, code: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If SMTP config is missing, just log the code for local dev
  if (!user || !pass) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS is missing in .env. Logging verification code to console instead of sending email.');
    console.log(`\n=========================================\nMock Email to: ${to}\nVerification Code: ${code}\n=========================================\n`);
    return true;
  }

  console.log(`Attempting to send email via ${process.env.SMTP_HOST || 'smtp.gmail.com'} as ${user}`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"Travis Pay" <${user}>`,
    to,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
        <h1 style="color: #fff; text-align: center;">Travis Pay</h1>
        <div style="background-color: #111; padding: 20px; border-radius: 8px; border: 1px solid #333; text-align: center;">
          <p style="color: #ccc; margin-bottom: 20px;">Enter the 6-digit code below to verify your email address and confirm your account.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #9333ea; margin: 20px 0;">${code}</div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to', to);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}
