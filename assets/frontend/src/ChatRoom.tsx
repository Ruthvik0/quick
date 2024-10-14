// src/components/ChatRoom.tsx
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast"; // For showing notifications
import ChatMessage from "./components/ChatMessage"; // Import the ChatMessage component
import { useChatContext } from "./context/ChatContext"; // Import the context

const ChatRoom = () => {
  const { loggedInUser, roomID, roomOwner, messages, setMessages } =
    useChatContext(); // Use the context
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to the bottom whenever a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [setMessages]);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await window.GetMessages(loggedInUser);
        console.log(response); // Call the GetMessages function from the server
        setMessages(response); // Set the fetched messages in the context
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [setMessages]);

  // Handle message send
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // Send message to server
      try {
        await window.SendMessage(loggedInUser, newMessage); // Call the SendMessage function
      } catch (er) {
        console.error(er);
      }
      // setMessages((prevMessages) => [
      //   ...prevMessages,
      //   { sender: loggedInUser, content: newMessage },
      // ]);
      setNewMessage(""); // Clear the input field
    }
  };

  // Copy room ID
  const handleCopy = () => {
    navigator.clipboard.writeText(roomID).then(() => {
      toast.success("Room ID copied to clipboard!");
    });
  };

  return (
    <div className="container p-4">
      {/* Top section: Owner's Room and Copy Room ID */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{roomOwner}'s Room</h2>
        <div className="flex items-center space-x-4">
          <div className="stat">
            <div className="stat-title">Users</div>
            <div className="stat-value">4</div>
          </div>
          <button className="btn btn-outline btn-primary" onClick={handleCopy}>
            Copy Room ID
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="mx-auto bg-slate-950 p-4 mb-4 overflow-y-auto"
        style={{ minHeight: "60vh", maxHeight: "60vh", width: "70%" }}
        ref={chatContainerRef}
      >
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              sender={message.sender}
              content={message.content}
              isLoggedInUser={message.sender === loggedInUser}
              isRoomOwner={message.sender === roomOwner}
            />
          ))
        ) : (
          <div className="text-gray-400">No messages yet.</div> // Display a message when there are no messages
        )}
      </div>

      {/* Input box to send a message */}
      <div className="flex space-x-4 mx-auto" style={{ width: "70%" }}>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <button className="btn btn-primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
