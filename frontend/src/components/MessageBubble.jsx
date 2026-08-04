import React from "react";

const MessageBubble = ({ message, isSentByMe, senderName }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div
      className={`flex w-full mb-5 ${
        isSentByMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[82%] sm:max-w-[68%] p-3.5 rounded-[2px] ${
          isSentByMe
            ? "bg-[#FFFFFF] border border-[#DEDAD1] border-l-[3px] border-l-[#C1511A]"
            : "bg-[#F0EDE6]"
        }`}
      >
        {/* Sender & Timestamp Header */}
        <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-[#DEDAD1]/50">
          <span className="font-semibold text-xs text-[#1C1B19]">
            {isSentByMe ? "You" : senderName || "Friend"}
          </span>
          <span className="text-[11px] font-mono text-[#6F6B62]">
            {formattedTime}
          </span>
        </div>

        {/* Message Text in UI Font (Inter) */}
        <p className="text-xs text-[#1C1B19] leading-relaxed whitespace-pre-wrap break-words font-sans">
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
