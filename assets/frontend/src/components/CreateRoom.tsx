// src/components/CreateRoom.tsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { fetchIpAddress } from "../utils";
import { useChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const { setLoggedInUser, setRoomOwner, setRoomID } = useChatContext(); // Destructure the context
  const [username, setUsername] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getIpAddress = async () => {
      const { ip, error } = await fetchIpAddress();
      if (ip) {
        setIpAddress(ip);
      } else {
        toast.error(error || "Failed to retrieve IP address");
      }
    };

    getIpAddress();
  }, []);

  const handleCreateRoom = async () => {
    if (!username) {
      toast.error("Username is required");
      return;
    }

    setLoading(true);

    try {
      const { success, roomID, error } = await window.CreateRoom(
        ipAddress,
        username
      );
      if (success) {
        setLoggedInUser(username); // Set loggedInUser in context
        setRoomOwner(username); // Set roomOwner in context
        setRoomID(roomID); // Set roomID in context
        toast.success("Room created successfully!");
        navigate("/chatRoom"); // Navigate to the chat room page
      } else {
        toast.error(error);
      }
    } catch (err) {
      toast.error("An error occurred while creating the room");
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

      <button
        className="btn btn-outline btn-primary w-full"
        onClick={handleCreateRoom}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span> Creating...
          </>
        ) : (
          "Create Room"
        )}
      </button>
    </div>
  );
};

export default CreateRoom;
