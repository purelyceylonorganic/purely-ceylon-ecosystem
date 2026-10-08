import nodemailer from "nodemailer";
import dns from "node:dns";

// Force Node.js DNS resolution to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// =====================================================
// GENERIC EMAIL
// =====================================================

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from: `"Purely Ceylon Organic" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// =====================================================
// EMAIL OTP
// =====================================================

export const sendOtpEmail = async (
  email: string,
  otp: string
) => {
  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
      "
    >
      <h2 style="color:#0E4B32;">
        Welcome to Purely Ceylon
      </h2>

      <p>
        Your verification code is:
      </p>

      <div
        style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#D4AF37;
          margin:20px 0;
        "
      >
        ${otp}
      </div>

      <p>
        This OTP will expire in
        <strong>10 minutes</strong>.
      </p>

      <p>
        If you did not create this account,
        please ignore this email.
      </p>

      <hr />

      <p style="font-size:12px;color:#777;">
        Purely Ceylon Organic (Pvt) Ltd
      </p>
    </div>
  `;

  await sendEmail(
    email,
    "Purely Ceylon Verification Code",
    html
  );
};

// =====================================================
// PASSWORD RESET EMAIL
// =====================================================

export const sendResetPasswordEmail = async (
  email: string,
  fullName: string,
  token: string
) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "https://purely-ceylon-organic.vercel.app";

  const resetUrl =
    `${frontendUrl}/reset-password/${token}`;

  const html = `
    <div
      style="
        font-family:Arial,sans-serif;
        max-width:600px;
        margin:auto;
        padding:30px;
        border:1px solid #ddd;
        border-radius:10px;
      "
    >
      <h2 style="color:#0E4B32;">
        Hello, ${fullName}
      </h2>

      <p>
        You have requested to reset your
        Purely Ceylon account password.
      </p>

      <p>
        Click the button below to reset your password:
      </p>

      <p style="margin:30px 0;">
        <a
          href="${resetUrl}"
          style="
            background:#0E4B32;
            color:white;
            padding:12px 24px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>
      </p>

      <p>
        This link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p>
        If you did not request this,
        please ignore this email.
      </p>

      <hr />

      <p style="font-size:12px;color:#777;">
        Purely Ceylon Organic (Pvt) Ltd
      </p>
    </div>
  `;

  await sendEmail(
    email,
    "Purely Ceylon Password Reset",
    html
  );
};