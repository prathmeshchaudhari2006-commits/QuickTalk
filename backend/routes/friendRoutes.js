const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, friendController.addFriend);
router.post("/respond", authMiddleware, friendController.respondRequest);
router.get("/", authMiddleware, friendController.getFriends);

module.exports = router;
