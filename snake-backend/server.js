require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // ✅ ADD

const app = express();

// 🔍 ENV CHECK (DEBUG)
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS LENGTH:", process.env.EMAIL_PASS?.length);

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// ✅ EXTRA ADD — Avatar / Base64 image ke liye size limit badha diya
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ROUTES
app.use("/api/auth", require("./routes/auth"));

// 🔥 FRONTEND SERVE (ADDED ONLY)
app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
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
