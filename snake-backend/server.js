// -----------------------------
// Snake Game Backend - Render Ready
// -----------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 🔍 DEBUG - check env variables
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);

// -----------------------------
// MIDDLEWARES
// -----------------------------
app.use(
  cors({
    origin: "https://snake-game4.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parser - increase size for images / avatars
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -----------------------------
// ROUTES
// -----------------------------
app.use("/api/auth", require("./routes/auth"));

// Health check route
app.get("/api/health", (req, res) => {
  res.send("🐍 Snake Backend Running");
});

// Basic root route (so Render doesn't look for build/index.html)
app.get("/", (req, res) => {
  res.send("✅ Snake Backend is running");
});

// -----------------------------
// DATABASE (MongoDB Atlas)
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo error", err));

// -----------------------------
// SERVER START
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
