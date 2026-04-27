import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#15161F",
                color: "#F0F0FF",
                border: "1px solid rgba(35, 37, 58, 0.6)",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              },
              success: {
                iconTheme: {
                  primary: "#818CF8",
                  secondary: "#15161F",
                },
              },
              error: {
                iconTheme: {
                  primary: "#F87171",
                  secondary: "#15161F",
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
