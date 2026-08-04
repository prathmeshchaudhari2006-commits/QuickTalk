const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

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
