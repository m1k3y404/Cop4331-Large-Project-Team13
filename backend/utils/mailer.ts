import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
  await resend.emails.send({
    from: 'Blog App <noreply@13.projectucf.software>',
    to,
    subject: 'Verify your email',
    html: `<p>Click the link below to verify your email:</p>
           <a href="${url}">${url}</a>
           <p>This link expires in 24 hours.</p>`,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const url = `${process.env.BASE_URL}/api/users/reset-password?token=${token}`;
  await resend.emails.send({
    from: 'Blog App <noreply@13.projectucf.software>',
    to,
    subject: 'Reset your password',
    html: `<p>Click the link below to reset your password:</p>
           <a href="${url}">${url}</a>
           <p>This link expires in 1 hour.</p>`,
  });
};
