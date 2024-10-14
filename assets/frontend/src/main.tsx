import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./index.css";
import { ChatProvider } from "./context/ChatContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChatProvider>
  </StrictMode>
);
