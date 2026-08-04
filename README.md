# TERMINAL SIGNAL // Real-Time Chat App

A full-stack, real-time 1-on-1 messaging web application built with **Node.js**, **Express**, **Socket.io**, **MongoDB**, and **React (Vite)**. Designed with a custom utilitarian **"Terminal Signal"** theme.

---

## ⚡ Features

1. **Authentication (JWT)**: Secure user registration and login issuing JWT tokens usable for both REST endpoints and Socket.io handshake authentication.
2. **Terminal Signal Aesthetics**: Warm off-white background (`#F7F4EC`), near-black ink text (`#1A1A17`), burnt amber accent (`#D9720C`), JetBrains Mono typography, sharp rectangular blocks (no rounded bubbles/cards).
3. **Friend Management**: Add friends by email, send/accept/reject friend requests, and view online status indicators.
4. **Live 1-on-1 Socket Messaging**: Targeted Socket.io private message delivery (`io.to(receiverSocketId).emit(...)`) rather than public broadcast.
5. **Persistent History**: All chat messages stored in MongoDB and reloaded automatically upon login/refresh.
6. **Live Indicators**: Live typing indicator and online/offline user status synchronization.
7. **One-Click Demo Test Accounts**: Quick login buttons for `Alice` and `Bob` for instant multi-tab testing.

---

## 📁 Folder Structure

```
realtime-chat-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Friend.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── friendRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── friendController.js
│   │   └── messageController.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js
    │   ├── socket/
    │   │   └── socketClient.js
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── FriendList.jsx
    │   │   ├── ChatWindow.jsx
    │   │   ├── MessageBubble.jsx
    │   │   └── MessageInput.jsx
    │   ├── pages/
    │   │   └── ChatDashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Testing Multi-User Messaging

1. Open `http://localhost:5173` in **Browser Window 1** and click **`> ALICE (Tab 1)`**.
2. Open `http://localhost:5173` in an **Incognito / Browser Window 2** and click **`> BOB (Tab 2)`**.
3. Alice and Bob will automatically be created/logged in as friends.
4. Select the friend from the left sidebar and start messaging in real-time!
