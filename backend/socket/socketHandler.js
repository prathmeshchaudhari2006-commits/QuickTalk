const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const { memoryMessages, generateId } = require("../config/inMemoryStore");

// In-memory mapping: userId -> socketId
const userSocketMap = new Map();

const setupSocket = (io) => {
  // Socket Middleware: JWT Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const tokenString = token.startsWith("Bearer ") ? token.slice(7) : token;
    try {
      const decoded = jwt.verify(
        tokenString,
        process.env.JWT_SECRET || "super_secret_terminal_signal_jwt_key_2026"
      );
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user.id);
    userSocketMap.set(userId, socket.id);
    console.log(`[Socket Connected] User: ${socket.user.name} (${userId}) -> Socket: ${socket.id}`);

    // Broadcast user online status & send list of currently online user IDs
    const onlineUserIds = Array.from(userSocketMap.keys());
    io.emit("onlineUsersList", onlineUserIds);
    io.emit("userOnline", { userId });

    // Event: Private 1-on-1 Message
    socket.on("sendMsg", async (data, callback) => {
      try {
        const { receiverId, text } = data;
        if (!receiverId || !text || !text.trim()) {
          if (callback) callback({ error: "Invalid receiver or message content" });
          return;
        }

        let formattedMsg;

        if (mongoose.connection.readyState === 1) {
          // 1. Persist message to DB
          const newMessage = await Message.create({
            senderId: userId,
            receiverId,
            text: text.trim(),
            timestamp: new Date()
          });

          formattedMsg = {
            _id: newMessage._id,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            text: newMessage.text,
            timestamp: newMessage.timestamp
          };
        } else {
          // In-Memory Fallback
          formattedMsg = {
            _id: generateId(),
            senderId: userId,
            receiverId: String(receiverId),
            text: text.trim(),
            timestamp: new Date()
          };
          memoryMessages.push(formattedMsg);
        }

        // 2. Deliver message directly to receiver if online
        const receiverSocketId = userSocketMap.get(String(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMsg", formattedMsg);
        }

        // 3. Deliver message back to sender (or call ack)
        socket.emit("receiveMsg", formattedMsg);
        if (callback) callback({ success: true, message: formattedMsg });
      } catch (error) {
        console.error("Socket sendMsg error:", error);
        if (callback) callback({ error: "Failed to send message" });
      }
    });

    // Event: Typing status indicator
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = userSocketMap.get(String(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId: userId, isTyping });
      }
    });

    // Event: Request current online list
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsersList", Array.from(userSocketMap.keys()));
    });

    // Event: Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket Disconnected] User: ${socket.user.name} (${userId})`);
      userSocketMap.delete(userId);
      const onlineUserIds = Array.from(userSocketMap.keys());
      io.emit("onlineUsersList", onlineUserIds);
      io.emit("userOffline", { userId });
    });
  });
};

module.exports = setupSocket;
