const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const setupSocket = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});
setupSocket(io);

// Database Connection & Server Listen
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/realtime_chat";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("[MongoDB] Connected successfully to:", MONGODB_URI);
    server.listen(PORT, () => {
      console.log(`[Server] Terminal Signal Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[MongoDB] Connection error:", err.message);
    console.log("[Server] Starting HTTP server anyway (will retry DB on request)...");
    server.listen(PORT, () => {
      console.log(`[Server] Terminal Signal Backend running on port ${PORT} (DB offline)`);
    });
  });
