import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOtpEmail = async (
  email: string,
  otp: string
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Purely Ceylon Verification Code',
    html: `
      <h2>Welcome to Purely Ceylon</h2>
      <p>Your OTP:</p>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes.</p>
    `
  });
};