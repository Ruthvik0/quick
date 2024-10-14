import ChatRoom from "./ChatRoom";
import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";
import Home from "./Home";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatRoom" element={<ChatRoom />} />
      </Routes>
    </div>
  );
}

export default App;
