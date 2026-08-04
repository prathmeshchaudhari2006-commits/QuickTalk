const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:friendId", authMiddleware, messageController.getChatHistory);

module.exports = router;
