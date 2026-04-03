import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"MyApp" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `<p>Click the link below to verify your email:</p>
           <a href="${url}">${url}</a>
           <p>This link expires in 24 hours.</p>`,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const url = `${process.env.BASE_URL}/api/users/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"MyApp" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `<p>Click the link below to reset your password:</p>
           <a href="${url}">${url}</a>
           <p>This link expires in 1 hour.</p>`,
  });
};
