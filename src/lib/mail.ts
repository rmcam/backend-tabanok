import { Resend } from 'resend';

const resend = new Resend(process.env.NEXTAUTH_SECRET);

export const sendEmailVerification = async (email: string, token: string) => {
  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    throw new Error(
      'Environment variables NEXTAUTH_SECRET or NEXTAUTH_URL are not defined.',
    );
  }

  if (!email || !token) {
    throw new Error('Email and token are required for verification.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format.');
  }

  try {
    await resend.emails.send({
      from: 'Your App Name <no-reply@yourdomain.com>',
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}">Verify email</a>
      `,
    });

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (error: any) {
    console.error('Error sending verification email:', error.message);
    return { error: true, message: error.message };
  }
};
