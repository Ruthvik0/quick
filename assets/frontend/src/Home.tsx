import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";

const Home = () => {
  return (
    <div className="text-center flex-grow flex items-center justify-center">
      <div className="max-w-md mx-auto w-full p-4">
        <h1 className="text-5xl font-bold mb-6">Welcome to Quick</h1>
        <div role="tablist" className="max-w-full tabs tabs-lg tabs-bordered">
          <input
            type="radio"
            name="roomAction"
            id="createRoom"
            role="tab"
            className="tab tab-bordered"
            aria-label="Create Room"
            defaultChecked
          />
          <CreateRoom />

          <input
            type="radio"
            name="roomAction"
            id="joinRoom"
            role="tab"
            className="tab tab-bordered"
            aria-label="Join Room"
          />
          <JoinRoom />
        </div>
      </div>
    </div>
  );
};

export default Home;
