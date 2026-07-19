import { Resend } from 'resend';

export async function sendVerificationEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing in .env. Logging verification code to console instead of sending email.');
    console.log(`\n=========================================\nMock Email to: ${to}\nVerification Code: ${code}\n=========================================\n`);
    return true;
  }

  const resend = new Resend(apiKey);
  
  // Update this to your verified domain on Resend
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log(`Attempting to send email via Resend as ${fromEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: `"Travis Pay" <${fromEmail}>`,
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
    });

    if (error) {
      console.error('Resend API Error:', error);
      return false;
    }

    console.log('Verification email sent successfully to', to);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing in .env. Logging reset link to console instead of sending email.');
    console.log(`\n=========================================\nMock Password Reset Email to: ${to}\nReset Link: ${resetLink}\n=========================================\n`);
    return true;
  }

  const resend = new Resend(apiKey);
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log(`Attempting to send password reset email via Resend as ${fromEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: `"Travis Pay" <${fromEmail}>`,
      to,
      subject: 'Reset your Travis Pay password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff; border-radius: 8px;">
          <h1 style="color: #fff; text-align: center;">Travis Pay</h1>
          <div style="background-color: #111; padding: 20px; border-radius: 8px; border: 1px solid #333; text-align: center;">
            <p style="color: #ccc; margin-bottom: 20px;">You requested a password reset. Click the button below to choose a new password.</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error (Password Reset):', error);
      return false;
    }

    console.log('Password reset email sent successfully to', to);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
