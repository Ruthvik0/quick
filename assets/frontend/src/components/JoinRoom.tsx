import { useState } from "react";
import { toast } from "react-hot-toast";
import { useChatContext } from "../context/ChatContext"; // Import the chat context
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const { setLoggedInUser, setRoomOwner, setRoomID } = useChatContext(); // Destructure the context
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!username || !roomId) {
      toast.error("Both Username and Room ID are required");
      return;
    }

    setLoading(true);

    try {
      const { success, ownerName, error } = await window.JoinRoom(
        roomId,
        username
      );

      if (success) {
        setLoggedInUser(username); // Set loggedInUser in context
        setRoomOwner(ownerName); // Set roomOwner in context (assuming ownerID is provided by the server)
        setRoomID(roomId); // Set roomID in context

        toast.success("Successfully joined the room!");
        navigate("/chatRoom"); // Navigate to the chat room page
      } else {
        toast.error(error || "Failed to join room");
      }
    } catch (error) {
      toast.error("An error occurred while joining the room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="tabpanel" className="tab-content p-10">
      <label className="form-control w-full mb-3">
        <div className="label">
          <span className="label-text">Username</span>
        </div>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="form-control w-full mb-3">
        <div className="label">
          <span className="label-text">Room Id</span>
        </div>
        <input
          type="text"
          placeholder="Room Id"
          className="input input-bordered w-full"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </label>

      <button
        className="btn btn-outline btn-primary w-full"
        onClick={handleJoinRoom}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span> Joining...
          </>
        ) : (
          "Join Room"
        )}
      </button>
    </div>
  );
};

export default JoinRoom;
