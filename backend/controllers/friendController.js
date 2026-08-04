const mongoose = require("mongoose");
const Friend = require("../models/Friend");
const User = require("../models/User");
const { memoryUsers, memoryFriends, generateId } = require("../config/inMemoryStore");

exports.addFriend = async (req, res) => {
  try {
    const { email, friendId } = req.body;
    const currentUserId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      let targetUser;
      if (friendId) {
        targetUser = await User.findById(friendId);
      } else if (email) {
        targetUser = await User.findOne({ email: email.toLowerCase().trim() });
      }

      if (!targetUser) {
        return res.status(404).json({ message: "User not found with provided email or ID" });
      }

      if (targetUser._id.toString() === currentUserId) {
        return res.status(400).json({ message: "You cannot add yourself as a friend" });
      }

      const existing = await Friend.findOne({
        $or: [
          { userId: currentUserId, friendId: targetUser._id },
          { userId: targetUser._id, friendId: currentUserId }
        ]
      });

      if (existing) {
        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already friends with this user" });
        }
        if (existing.status === "pending") {
          return res.status(400).json({ message: "A friend request is already pending between you two" });
        }
        existing.userId = currentUserId;
        existing.friendId = targetUser._id;
        existing.status = "pending";
        await existing.save();
        return res.status(200).json({ message: "Friend request sent", friend: existing });
      }

      const friendship = await Friend.create({
        userId: currentUserId,
        friendId: targetUser._id,
        status: "pending"
      });

      return res.status(201).json({ message: "Friend request sent successfully", friend: friendship });
    } else {
      // In-Memory Fallback
      let targetUser;
      if (friendId) {
        targetUser = memoryUsers.find((u) => String(u._id) === String(friendId));
      } else if (email) {
        targetUser = memoryUsers.find((u) => u.email === email.toLowerCase().trim());
      }

      if (!targetUser) {
        return res.status(404).json({ message: "User not found with provided email or ID" });
      }

      if (String(targetUser._id) === String(currentUserId)) {
        return res.status(400).json({ message: "You cannot add yourself as a friend" });
      }

      const existing = memoryFriends.find(
        (f) =>
          (String(f.userId) === String(currentUserId) && String(f.friendId) === String(targetUser._id)) ||
          (String(f.userId) === String(targetUser._id) && String(f.friendId) === String(currentUserId))
      );

      if (existing) {
        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already friends with this user" });
        }
        if (existing.status === "pending") {
          return res.status(400).json({ message: "A friend request is already pending between you two" });
        }
        existing.userId = currentUserId;
        existing.friendId = targetUser._id;
        existing.status = "pending";
        return res.status(200).json({ message: "Friend request sent", friend: existing });
      }

      const friendship = {
        _id: generateId(),
        userId: currentUserId,
        friendId: targetUser._id,
        status: "pending",
        createdAt: new Date()
      };
      memoryFriends.push(friendship);

      return res.status(201).json({ message: "Friend request sent successfully", friend: friendship });
    }
  } catch (error) {
    console.error("Add Friend Error:", error);
    res.status(500).json({ message: "Server error while adding friend" });
  }
};

exports.respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'accepted' or 'rejected'" });
    }

    if (mongoose.connection.readyState === 1) {
      const friendship = await Friend.findById(requestId);
      if (!friendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      if (friendship.friendId.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to respond to this request" });
      }

      friendship.status = action;
      await friendship.save();

      return res.json({ message: `Friend request ${action}`, friendship });
    } else {
      // In-Memory Fallback
      const friendship = memoryFriends.find((f) => String(f._id) === String(requestId));
      if (!friendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      if (String(friendship.friendId) !== String(req.user.id)) {
        return res.status(403).json({ message: "You are not authorized to respond to this request" });
      }

      friendship.status = action;
      return res.json({ message: `Friend request ${action}`, friendship });
    }
  } catch (error) {
    console.error("Respond Request Error:", error);
    res.status(500).json({ message: "Server error responding to friend request" });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);

    if (mongoose.connection.readyState === 1) {
      const friendships = await Friend.find({
        $or: [{ userId: currentUserId }, { friendId: currentUserId }]
      }).populate("userId", "name email").populate("friendId", "name email");

      const acceptedFriends = [];
      const pendingIncoming = [];
      const pendingOutgoing = [];

      friendships.forEach((f) => {
        if (f.status === "accepted") {
          const friendUser = f.userId._id.toString() === currentUserId ? f.friendId : f.userId;
          acceptedFriends.push({
            friendshipId: f._id,
            _id: friendUser._id,
            name: friendUser.name,
            email: friendUser.email
          });
        } else if (f.status === "pending") {
          if (f.friendId._id.toString() === currentUserId) {
            pendingIncoming.push({
              requestId: f._id,
              from: { _id: f.userId._id, name: f.userId.name, email: f.userId.email }
            });
          } else {
            pendingOutgoing.push({
              requestId: f._id,
              to: { _id: f.friendId._id, name: f.friendId.name, email: f.friendId.email }
            });
          }
        }
      });

      return res.json({
        friends: acceptedFriends,
        pendingIncoming,
        pendingOutgoing
      });
    } else {
      // In-Memory Fallback
      const friendships = memoryFriends.filter(
        (f) => String(f.userId) === currentUserId || String(f.friendId) === currentUserId
      );

      const acceptedFriends = [];
      const pendingIncoming = [];
      const pendingOutgoing = [];

      friendships.forEach((f) => {
        const uUser = memoryUsers.find((u) => String(u._id) === String(f.userId));
        const fUser = memoryUsers.find((u) => String(u._id) === String(f.friendId));

        if (f.status === "accepted") {
          const friendUser = String(f.userId) === currentUserId ? fUser : uUser;
          if (friendUser) {
            acceptedFriends.push({
              friendshipId: f._id,
              _id: friendUser._id,
              name: friendUser.name,
              email: friendUser.email
            });
          }
        } else if (f.status === "pending") {
          if (String(f.friendId) === currentUserId) {
            if (uUser) {
              pendingIncoming.push({
                requestId: f._id,
                from: { _id: uUser._id, name: uUser.name, email: uUser.email }
              });
            }
          } else {
            if (fUser) {
              pendingOutgoing.push({
                requestId: f._id,
                to: { _id: fUser._id, name: fUser.name, email: fUser.email }
              });
            }
          }
        }
      });

      return res.json({
        friends: acceptedFriends,
        pendingIncoming,
        pendingOutgoing
      });
    }
  } catch (error) {
    console.error("Get Friends Error:", error);
    res.status(500).json({ message: "Server error fetching friends" });
  }
};
