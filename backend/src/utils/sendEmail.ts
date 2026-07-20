import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// இது பொதுவான ஃபங்ஷன்
export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Purely Ceylon Organic" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// இதை அப்படியே update செய்யவும் (OTP-க்கும் sendEmail-ஐப் பயன்படுத்தலாம்)
export const sendOtpEmail = async (email: string, otp: string) => {
  const html = `
    <h2>Welcome to Purely Ceylon</h2>
    <p>Your OTP:</p>
    <h1>${otp}</h1>
    <p>Expires in 10 minutes.</p>
  `;
  await sendEmail(email, 'Purely Ceylon Verification Code', html);
};

// Password Reset
export const sendResetPasswordEmail = async (
  email: string,
  fullName: string,
  token: string
) => {
  // .env-ல் FRONTEND_URL சரியாக உள்ளதா என உறுதிப்படுத்திக்கொள்ளுங்கள்
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family:Arial; padding:20px; border:1px solid #ddd;">
      <h2>Hello, ${fullName}</h2>
      <p>You have requested to reset your password.</p>
      <a href="${resetUrl}" style="background:#0E4B32; color:white; padding:10px 20px; text-decoration:none;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    </div>
  `;
  await sendEmail(email, 'Password Reset Request', html);
};