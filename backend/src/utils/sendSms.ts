import axios from "axios";
import { logger } from "../config/logger";

export const sendSms = async (phone: string, message: string) => {
  const token = process.env.TEXTLK_API_TOKEN;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!token || !senderId) {
    logger.error("Text.lk config missing (TEXTLK_API_TOKEN / TEXTLK_SENDER_ID)");
    throw new Error("SMS service is not configured");
  }

  try {
    const response = await axios.post(
      "https://app.text.lk/api/v3/sms/send",
      {
        recipient: phone,
        sender_id: senderId,
        type: "plain",
        message,
      },
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    logger.info("SMS request accepted by Text.lk");
    return response.data;
  } catch (error: any) {
    logger.error(
      `Text.lk SMS error: ${JSON.stringify(error.response?.data) || error.message}`
    );
    throw new Error("Failed to send SMS");
  }
};