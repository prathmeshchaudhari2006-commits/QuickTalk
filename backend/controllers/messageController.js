const mongoose = require("mongoose");
const Message = require("../models/Message");
const { memoryMessages } = require("../config/inMemoryStore");

exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);
    const friendId = String(req.params.friendId);

    if (!friendId) {
      return res.status(400).json({ message: "friendId is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId, receiverId: friendId },
          { senderId: friendId, receiverId: currentUserId }
        ]
      }).sort({ timestamp: 1 });

      return res.json({ messages });
    } else {
      // In-Memory Fallback
      const messages = memoryMessages
        .filter(
          (m) =>
            (String(m.senderId) === currentUserId && String(m.receiverId) === friendId) ||
            (String(m.senderId) === friendId && String(m.receiverId) === currentUserId)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return res.json({ messages });
    }
  } catch (error) {
    console.error("Get Chat History Error:", error);
    res.status(500).json({ message: "Server error fetching chat history" });
  }
};
