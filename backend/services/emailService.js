const createTransporter = require('../config/email');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { messageId: 'mock-email-id' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
  return info;
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Campus Placement',
    html: `<h2>Welcome ${user.name}!</h2><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">Verify Email</a><p>Or use this token: <strong>${token}</strong></p>`,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset - Campus Placement',
    html: `<h2>Password Reset</h2><p>Click the link to reset your password:</p><a href="${resetUrl}">Reset Password</a><p>Or use this token: <strong>${token}</strong></p><p>Expires in 10 minutes.</p>`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
