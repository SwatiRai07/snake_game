const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateOTP } = require("../utils/OTP");
const sendEmail = require("../utils/sendEmail");

// EMAIL VALIDATOR
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// =======================
// 📩 SEND OTP
// =======================
router.post("/send-otp", async (req, res) => {
  try {
    console.log("🔥 SEND OTP HIT");
    console.log("BODY:", req.body);

    const { value } = req.body;

    if (!value || !isValidEmail(value)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const otp = generateOTP();
    console.log("✅ OTP for", value, "is:", otp);

    let user = await User.findOne({ email: value });
    if (!user) user = new User({ email: value });

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    let emailSent = true;

    try {
      await sendEmail(value, otp);
      console.log("📧 EMAIL SENT SUCCESSFULLY");
    } catch (emailErr) {
      emailSent = false;
      console.log("⚠️ EMAIL FAILED BUT OTP SAVED");
      console.log("EMAIL ERROR:", emailErr.message);
    }

    // ✅ IMPORTANT: OTP response for demo when email fails
    return res.json({
      message: emailSent ? "OTP sent to email" : "Email blocked, OTP shown for demo",
      otp: emailSent ? null : otp,
      emailSent,
    });

  } catch (err) {
    console.log("❌ OTP SEND ERROR:", err);
    res.status(500).json({ message: "OTP send failed" });
  }
});

// =======================
// ✅ VERIFY OTP
// =======================
router.post("/verify-otp", async (req, res) => {
  const { value, otp } = req.body;

  const user = await User.findOne({ email: value });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({
    message: "OTP verified",
    hasProfile: !!user.username,
  });
});

// =======================
// 👤 CREATE / EDIT PROFILE
// =======================
router.post("/profile", async (req, res) => {
  try {
    const { email, username, dob, avatar } = req.body;

    if (!email || !username || !dob) {
      return res.status(400).json({ message: "All fields required" });
    }

    const birthDate = new Date(dob);
    const age = new Date(Date.now() - birthDate).getUTCFullYear() - 1970;

    if (age < 10 || age > 100) {
      return res
        .status(400)
        .json({ message: "Age must be between 10 and 100" });
    }

    const duplicate = await User.findOne({
      username,
      email: { $ne: email },
    });
    if (duplicate) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.dob = birthDate;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile save failed" });
  }
});

// =======================
// 📥 GET PROFILE
// =======================
router.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      avatar: user.avatar,
      bestScore: user.bestScore,
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

module.exports = router;
