const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Snake Game" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: "Snake Game OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });

    console.log("📧 OTP email sent to:", to);
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;
