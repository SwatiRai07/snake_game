require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔍 ENV CHECK (DEBUG)
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);

// MIDDLEWARES
app.use(cors());

// Body size limits (for avatar / base64 images etc.)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ROUTES
app.use("/api/auth", require("./routes/auth"));

// HEALTH / TEST ROUTE
app.get("/api/health", (req, res) => {
  res.send("🐍 Snake Backend Running");
});

// -----------------------------
// FRONTEND ATTACH (PRODUCTION)
// Express v5 + Node 24 SAFE
// -----------------------------
const __dirnameResolved = path.resolve();

// Serve React build
app.use(express.static(path.join(__dirnameResolved, "../build")));

// Wildcard using REGEX (this fixes your crash)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirnameResolved, "../build", "index.html"));
});

// DB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo error", err));

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
