const bcrypt = require("bcryptjs");

// In-memory data structures for offline DB fallback
const memoryUsers = [];
const memoryFriends = [];
const memoryMessages = [];

const generateId = () => {
  return "mem_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
};

// Seed Alice and Bob
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("password123", salt);

  const aliceId = "alice_id_1001";
  const bobId = "bob_id_1002";

  memoryUsers.push(
    { _id: aliceId, name: "Alice", email: "alice@signal.net", password: hash, createdAt: new Date() },
    { _id: bobId, name: "Bob", email: "bob@signal.net", password: hash, createdAt: new Date() }
  );

  memoryFriends.push({
    _id: "friend_1001",
    userId: aliceId,
    friendId: bobId,
    status: "accepted",
    createdAt: new Date()
  });

  memoryMessages.push({
    _id: "msg_1001",
    senderId: aliceId,
    receiverId: bobId,
    text: "Welcome to Terminal Signal! Real-time messaging is online.",
    timestamp: new Date()
  });
})();

module.exports = {
  memoryUsers,
  memoryFriends,
  memoryMessages,
  generateId
};
