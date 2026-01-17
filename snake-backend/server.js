// -----------------------------
// Snake Game Backend - Render Ready
// -----------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// 🔍 DEBUG - check env variables
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);

// -----------------------------
// MIDDLEWARES
// -----------------------------
app.use(cors());

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

// -----------------------------
// FRONTEND SERVE (React build)
// Only serve if build folder exists (prevents Render crash)
// -----------------------------
const __dirnameResolved = path.resolve();
const buildPath = path.join(__dirnameResolved, "build");

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // Serve React for all non-api routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.log("⚠️ React build folder not found. Skipping frontend serving.");
}

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
