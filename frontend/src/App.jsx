import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import ChatDashboard from "./pages/ChatDashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState("login"); // "login" | "register" | "dashboard"

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        setView("dashboard");
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setToken(token);
    setView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setToken(null);
    setView("login");
  };

  if (view === "dashboard" && currentUser && token) {
    return (
      <ChatDashboard
        currentUser={currentUser}
        token={token}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "register") {
    return (
      <Register
        onRegisterSuccess={handleLoginSuccess}
        switchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      switchToRegister={() => setView("register")}
    />
  );
}

export default App;
