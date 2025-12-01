import React from "react";
import Events from "./components/Events";
import Feedback from "./components/Feedback";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SearchProfile from "./components/SearchProfile";
import Message from "./components/Message";
import { Route, Routes } from "react-router-dom";
import ViewProfile from "./components/ViewProfile";
import Notidfication from "./components/Notidfication";
import Main from "./components/Main";
import ForgetPassword from "./components/ForgetPassword";
import { ToastContainer } from "react-toastify";
import NewPassword from "./components/NewPassword";
import ViewSearchProfile from "./components/ViewSearchProfile";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import Scholarship from "./components/Scholarship";
import { WEB_URL } from "./baseURL"; // Ensure this file exports WEB_URL correctly

function App() {
  // CHANGE MADE HERE: Replaced "http://localhost:5001" with WEB_URL
  const socket = React.useMemo(() => io(WEB_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 3,
    transports: ["websocket", "polling"]
  }), []);
  
  React.useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <>
    <ToastContainer/>
    <Navbar socket={socket}/>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home socket={socket}/>} />
        <Route path="/events" element={<Events />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/view-search-profile" element={<ViewSearchProfile socket={socket}/>} />
        <Route path="/search-profile" element={<SearchProfile />} />
        <Route path="/message" element={<Message socket={socket}/>} />
        <Route path="/notification" element={<Notidfication />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/scholarship" element={<Scholarship />} />
      </Routes>
    </>
  );
}

export default App;