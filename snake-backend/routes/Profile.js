const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Save profile
router.post("/save", async (req, res) => {
  try {
    const { email, username, dob, avatar } = req.body;

    if (!username || !dob) {
      return res.status(400).json({ message: "Username and Date of Birth are required" });
    }

    // Check age >= 10 years
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 10) {
      return res.status(400).json({ message: "You must be at least 10 years old" });
    }

    // Check unique username
    const existing = await User.findOne({ username, email: { $ne: email } });
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.dob = birthDate;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile save failed" });
  }
});

// ✅ Get profile
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      dob: user.dob,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
