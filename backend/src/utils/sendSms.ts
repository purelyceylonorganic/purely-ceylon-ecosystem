import axios from "axios";

export const sendSms = async (
  phone: string,
  message: string
) => {
  try {
    const response = await axios.post(
      "https://app.text.lk/api/v3/sms/send",
      {
        recipient: phone,
        sender_id: process.env.TEXTLK_SENDER_ID,
        type: "plain",
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("SMS SENT:", response.data);

    return response.data;
  } catch (error: any) {
    console.error(
      "TEXT.LK SMS ERROR:",
      error.response?.data || error.message
    );

    throw new Error("Failed to send SMS");
  }
};