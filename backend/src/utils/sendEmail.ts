import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  "Purely Ceylon <onboarding@resend.dev>";

// =====================================================
// GENERIC EMAIL
// =====================================================

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const { data, error } =
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

  if (error) {
    console.error("RESEND EMAIL ERROR:", error);
    throw new Error(
      error.message || "Failed to send email"
    );
  }

  return data;
};

// =====================================================
// EMAIL OTP
// =====================================================

export const sendOtpEmail = async (
  email: string,
  otp: string
) => {
  const html = `
    <div style="
      font-family:Arial,sans-serif;
      max-width:600px;
      margin:auto;
      padding:30px;
      border:1px solid #ddd;
      border-radius:10px;
    ">
      <h2 style="color:#0E4B32;">
        Welcome to Purely Ceylon
      </h2>

      <p>Your verification code is:</p>

      <div style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:8px;
        color:#D4AF37;
        margin:20px 0;
      ">
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

  return sendEmail(
    email,
    "Purely Ceylon Verification Code",
    html
  );
};

// =====================================================
// PASSWORD RESET
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
    <div style="
      font-family:Arial,sans-serif;
      max-width:600px;
      margin:auto;
      padding:30px;
      border:1px solid #ddd;
      border-radius:10px;
    ">
      <h2 style="color:#0E4B32;">
        Hello, ${fullName}
      </h2>

      <p>
        You requested to reset your
        Purely Ceylon account password.
      </p>

      <p>
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

  return sendEmail(
    email,
    "Purely Ceylon Password Reset",
    html
  );
};