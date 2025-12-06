import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { socket } from "./socket"; // --- IMPORT FROM NEW FILE ---

// Components
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Events from "./components/Events";
import Feedback from "./components/Feedback";
import ViewProfile from "./components/ViewProfile";
import ViewSearchProfile from "./components/ViewSearchProfile";
import SearchProfile from "./components/SearchProfile";
import Message from "./components/Message";
import Notidfication from "./components/Notidfication";
import ForgetPassword from "./components/ForgetPassword";
import NewPassword from "./components/NewPassword";
import Scholarship from "./components/Scholarship";
import MyPosts from "./components/MyPosts";

function App() {
  
  useEffect(() => {
    // Connect when App mounts
    if (!socket.connected) {
      socket.connect();
    }

    // Optional: Debug connection
    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      // Suppress annoying console errors if server is down
      console.warn("Socket Connection Failed (Retrying...):", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      // Keep socket open for navigation speed, or disconnect if strict:
      // socket.disconnect(); 
    };
  }, []);

  return (
    <>
      <ToastContainer />
      <Navbar socket={socket} />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/home" element={<Home socket={socket} />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/view-search-profile" element={<ViewSearchProfile socket={socket} />} />
        <Route path="/search-profile" element={<SearchProfile />} />
        <Route path="/message" element={<Message socket={socket} />} />
        <Route path="/notification" element={<Notidfication />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/scholarship" element={<Scholarship />} />
        <Route path="/my-posts" element={<MyPosts />} />
      </Routes>
    </>
  );
}

export default App;