const axios = require("axios");

const sendEmail = async (to, otp) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY missing in environment variables");
    }

    const fromEmail = process.env.EMAIL_FROM || "snakegameotp@gmail.com";

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: fromEmail, name: "Snake Game" },
        to: [{ email: to }],
        subject: "Snake Game OTP",
        textContent: `Your OTP is ${otp}. Valid for 5 minutes.`,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("📧 OTP email sent to:", to);
  } catch (error) {
    console.error(
      "❌ Email Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendEmail;
