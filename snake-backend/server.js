require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔍 ENV CHECK
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API ROUTES
app.use("/api/auth", require("./routes/auth"));

// 👉 FRONTEND BUILD
app.use(express.static(path.join(__dirname, "../build")));

// TEST ROUTE
app.get("/api/test", (req, res) => {
  res.send("API Working ✅");
});

// ✅ EXPRESS 5 SAFE FALLBACK (NO WILDCARD)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo error", err));

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
