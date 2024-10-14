import React from "react";

interface ChatMessageProps {
  sender: string;
  content: string;
  isLoggedInUser: boolean;
  isRoomOwner: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  content,
  isLoggedInUser,
  isRoomOwner,
}) => {
  const chatBubbleClass = isLoggedInUser
    ? "chat-bubble chat-bubble-info" // Logged-in user message
    : isRoomOwner
    ? "chat-bubble chat-bubble-primary" // Owner message
    : "chat-bubble chat-bubble-secondary"; // Other user message

  return (
    <div className={`chat ${isLoggedInUser ? "chat-end" : "chat-start"}`}>
      {!isLoggedInUser && (
        <div
          className={`chat-header ${
            isRoomOwner ? "text-secondary" : "text-primary"
          }`}
        >
          {sender}
        </div>
      )}
      <div className={chatBubbleClass}>{content}</div>
    </div>
  );
};

export default ChatMessage;
