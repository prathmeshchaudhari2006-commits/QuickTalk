import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { initSocket, disconnectSocket, getSocket } from "../socket/socketClient";
import FriendList from "../components/FriendList";
import ChatWindow from "../components/ChatWindow";

const ChatDashboard = ({ currentUser, token, onLogout }) => {
  const [friends, setFriends] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [pendingOutgoing, setPendingOutgoing] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);

  const [messages, setMessages] = useState([]);
  const [lastMessagesMap, setLastMessagesMap] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch Friends and Requests from REST API
  const fetchFriends = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/friends");
      setFriends(response.data.friends || []);
      setPendingIncoming(response.data.pendingIncoming || []);
      setPendingOutgoing(response.data.pendingOutgoing || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }, []);

  // Fetch Message History with Active Friend from REST API
  const fetchMessageHistory = useCallback(async (friendId) => {
    if (!friendId) return;
    setLoadingHistory(true);
    try {
      const response = await axiosInstance.get(`/api/messages/${friendId}`);
      const history = response.data.messages || [];
      setMessages(history);

      if (history.length > 0) {
        setLastMessagesMap((prev) => ({
          ...prev,
          [friendId]: history[history.length - 1]
        }));
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Initialize Socket.io Connection & Socket Listeners
  useEffect(() => {
    fetchFriends();
    const socket = initSocket(token);

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("getOnlineUsers");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("onlineUsersList", (userIds) => {
      setOnlineUserIds(userIds);
    });

    socket.on("userOnline", ({ userId }) => {
      setOnlineUserIds((prev) => Array.from(new Set([...prev, userId])));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    });

    // Handle Incoming Live Socket Messages
    socket.on("receiveMsg", (newMsg) => {
      const senderId = newMsg.senderId?._id || newMsg.senderId;
      const receiverId = newMsg.receiverId?._id || newMsg.receiverId;

      // Update Last Message Preview Map
      const otherPersonId = senderId === currentUser.id ? receiverId : senderId;
      setLastMessagesMap((prev) => ({
        ...prev,
        [otherPersonId]: newMsg
      }));

      // Append to active chat if current chat is with either sender or receiver
      setActiveFriend((currFriend) => {
        if (
          currFriend &&
          (currFriend._id === senderId || currFriend._id === receiverId)
        ) {
          setMessages((prevMsgs) => {
            if (prevMsgs.some((m) => m._id === newMsg._id)) return prevMsgs;
            return [...prevMsgs, newMsg];
          });
        }
        return currFriend;
      });
    });

    // Handle Typing status
    socket.on("userTyping", ({ senderId, isTyping }) => {
      setActiveFriend((currFriend) => {
        if (currFriend && currFriend._id === senderId) {
          setIsFriendTyping(isTyping);
        }
        return currFriend;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("onlineUsersList");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("receiveMsg");
      socket.off("userTyping");
      disconnectSocket();
    };
  }, [token, currentUser.id, fetchFriends]);

  const handleSelectFriend = (friend) => {
    setActiveFriend(friend);
    setIsFriendTyping(false);
    fetchMessageHistory(friend._id);
  };

  const handleSendMessage = (text) => {
    if (!activeFriend) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      alert("Socket connection disconnected. Reconnecting...");
      return;
    }

    socket.emit("sendMsg", { receiverId: activeFriend._id, text }, (ack) => {
      if (ack && ack.error) {
        console.error("Message send error:", ack.error);
      }
    });
  };

  const handleTyping = (isTyping) => {
    if (!activeFriend) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("typing", { receiverId: activeFriend._id, isTyping });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F5F3EE] text-[#1C1B19] overflow-hidden font-sans">
      
      {/* Editorial Navbar Header */}
      <header className="px-6 py-3.5 border-b border-[#DEDAD1] bg-[#FFFFFF] flex items-center justify-between shrink-0 font-sans">
        
        {/* Brand Title */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#C1511A] rounded-[2px]" />
          <span className="font-semibold text-sm tracking-tight text-[#1C1B19]">
            Signal
          </span>
        </div>

        {/* User Status & Controls */}
        <div className="flex items-center gap-5">
          
          {/* Status Indicator (plain 6px dot + text, no background fill, no glow) */}
          <div className="flex items-center gap-1.5 text-xs text-[#6F6B62]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                socketConnected ? "bg-[#4C7A54]" : "bg-[#A39C8F]"
              }`}
            />
            <span>{socketConnected ? "Connected" : "Disconnected"}</span>
          </div>

          {/* User Email */}
          <div className="hidden md:flex items-center text-xs text-[#6F6B62]">
            <span className="font-medium text-[#1C1B19] mr-1.5">{currentUser.name}</span>
            <span className="text-[#A39C8F]">({currentUser.email})</span>
          </div>

          {/* Logout Link */}
          <button
            onClick={onLogout}
            className="text-xs text-[#6F6B62] hover:text-[#1C1B19] font-medium transition-colors cursor-pointer"
          >
            Sign out
          </button>

        </div>

      </header>

      {/* Main Two-Pane Dashboard Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (280px) */}
        <FriendList
          friends={friends}
          pendingIncoming={pendingIncoming}
          pendingOutgoing={pendingOutgoing}
          activeFriend={activeFriend}
          onSelectFriend={handleSelectFriend}
          onlineUserIds={onlineUserIds}
          onRefreshFriends={fetchFriends}
          lastMessagesMap={lastMessagesMap}
        />

        {/* Main Chat Pane (Fluid) */}
        <ChatWindow
          currentUser={currentUser}
          activeFriend={activeFriend}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          isFriendOnline={activeFriend ? onlineUserIds.includes(activeFriend._id) : false}
          isFriendTyping={isFriendTyping}
          loadingHistory={loadingHistory}
        />

      </div>

    </div>
  );
};

export default ChatDashboard;
