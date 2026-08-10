const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Attempt MongoDB connection if MONGODB_URI is provided
if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 }).catch((err) => {
    console.error("[Vercel MongoDB Error]:", err.message);
  });
}

const authRoutes = require("../backend/routes/authRoutes");
const friendRoutes = require("../backend/routes/friendRoutes");
const messageRoutes = require("../backend/routes/messageRoutes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "vercel-serverless", timestamp: new Date() });
});

module.exports = app;
