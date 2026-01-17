const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: null
    },
    username: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },

    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },

    bestScore: {
      type: Number,
      default: 0
    },

    // ✅ ADDED (EXTRA ONLY)
    dob: {
      type: Date,
      default: null
    },
    avatar: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
