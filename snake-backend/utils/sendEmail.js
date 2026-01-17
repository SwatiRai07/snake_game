const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // 👈 IMPORTANT (SSL)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // 👈 WINDOWS FIX
      },
    });

    await transporter.sendMail({
      from: `"Snake Game" <${process.env.EMAIL_USER}>`,
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
