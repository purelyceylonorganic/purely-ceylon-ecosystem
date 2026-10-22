
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailFrom =
  process.env.EMAIL_FROM ||
  "PCO Production <noreply@purelyceylonorganic.com>";

// Check API key and Resend connectivity
export const verifyEmailConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing in environment variables");
    }

    const { error } = await resend.domains.list();

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Resend Email Service Connected");
  } catch (error) {
    console.error("❌ Resend Email Connection Failed:", error);
  }
};

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("❌ Email Sending Failed:", error);
    throw new Error(error.message);
  }

  console.log("✅ Email Sent Successfully:", data?.id);

  return data;
};
