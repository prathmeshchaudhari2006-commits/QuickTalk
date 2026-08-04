import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (onTyping) {
      onTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onTyping) onTyping(false);

    onSendMessage(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-[#FFFFFF] border-t border-[#DEDAD1] flex items-center gap-2 font-sans"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a message... (Press Enter to send)"
        className="flex-1 bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] px-3 py-2 text-xs text-[#1C1B19] placeholder-[#6F6B62] focus:outline-none focus:border-[#C1511A] transition-colors font-sans"
      />

      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-[#C1511A] hover:bg-[#A84313] disabled:opacity-40 text-white font-medium text-xs px-4 py-2 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
      >
        <span>Send</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};

export default MessageInput;
