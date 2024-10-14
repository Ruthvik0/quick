// src/context/ChatContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatMessageType {
  sender: string;
  content: string;
}

interface ChatContextType {
  roomOwner: string;
  roomID: string;
  loggedInUser: string;
  messages: ChatMessageType[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  setRoomOwner: React.Dispatch<React.SetStateAction<string>>;
  setRoomID: React.Dispatch<React.SetStateAction<string>>;
  setLoggedInUser: React.Dispatch<React.SetStateAction<string>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [roomOwner, setRoomOwner] = useState("");
  const [roomID, setRoomID] = useState("");
  const [loggedInUser, setLoggedInUser] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  return (
    <ChatContext.Provider
      value={{
        roomOwner,
        roomID,
        loggedInUser,
        messages,
        setMessages,
        setRoomOwner,
        setRoomID,
        setLoggedInUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
