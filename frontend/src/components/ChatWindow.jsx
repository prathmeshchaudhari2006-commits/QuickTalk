import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MessageSquare } from "lucide-react";

const ChatWindow = ({
  currentUser,
  activeFriend,
  messages,
  onSendMessage,
  onTyping,
  isFriendOnline,
  isFriendTyping,
  loadingHistory
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isFriendTyping]);

  if (!activeFriend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F5F3EE] text-center font-sans">
        <div className="w-12 h-12 rounded-[4px] bg-[#FFFFFF] border border-[#DEDAD1] flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-[#6F6B62]" />
        </div>
        <h2 className="font-semibold text-sm text-[#1C1B19] mb-1">
          No Conversation Selected
        </h2>
        <p className="text-xs text-[#6F6B62] max-w-xs leading-relaxed">
          Select a friend from the sidebar or send a friend request to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F3EE] h-full overflow-hidden font-sans">
      
      {/* Editorial Header */}
      <div className="p-3.5 px-6 border-b border-[#DEDAD1] bg-[#FFFFFF] flex items-center justify-between shrink-0">
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#F0EDE6] border border-[#DEDAD1] text-[#1C1B19] font-bold text-xs flex items-center justify-center">
            {activeFriend.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="font-semibold text-xs text-[#1C1B19]">
              {activeFriend.name}
            </div>
            <div className="text-[11px] text-[#6F6B62]">
              {activeFriend.email}
            </div>
          </div>
        </div>

        {/* Plain status indicator (no background fill, no glow) */}
        <div className="flex items-center gap-1.5 text-xs text-[#6F6B62]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isFriendOnline ? "bg-[#4C7A54]" : "bg-[#A39C8F]"
            }`}
          />
          <span>{isFriendOnline ? "Online" : "Offline"}</span>
        </div>

      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F3EE]">
        {loadingHistory ? (
          <div className="p-6 text-center font-mono text-xs text-[#6F6B62]">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6F6B62] bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] max-w-sm mx-auto my-8">
            <div className="font-semibold text-[#1C1B19] mb-1">No messages yet</div>
            <p className="text-[11px]">Send a message below to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByMe = (msg.senderId?._id || msg.senderId) === currentUser.id;
            return (
              <MessageBubble
                key={msg._id || idx}
                message={msg}
                isSentByMe={isSentByMe}
                senderName={isSentByMe ? currentUser.name : activeFriend.name}
              />
            );
          })
        )}

        {/* Live Typing Indicator */}
        {isFriendTyping && (
          <div className="text-xs text-[#C1511A] font-sans py-1 font-medium italic">
            {activeFriend.name} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />

    </div>
  );
};

export default ChatWindow;
