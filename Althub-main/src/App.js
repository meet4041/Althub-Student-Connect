import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom"; 
import { ToastContainer } from "react-toastify";
import { socket } from "./socket";
import axios from "axios"; 

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
import Loader from "./components/Loader"; 

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate(); 

  useEffect(() => {
    // --- AXIOS INTERCEPTORS ---
    let requestCount = 0;

    const showLoader = () => {
      requestCount++;
      setIsLoading(true);
    };

    const hideLoader = () => {
      requestCount--;
      if (requestCount <= 0) {
        requestCount = 0;
        setIsLoading(false);
      }
    };

    // 1. REQUEST INTERCEPTOR (Attaches Token + Shows Loader)
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        showLoader();
        
        // --- AUTHENTICATION FIX ---
        // We get the token from LocalStorage and attach it to the header
        const token = localStorage.getItem("Althub_Token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        hideLoader();
        return Promise.reject(error);
      }
    );

    // 2. RESPONSE INTERCEPTOR (Handles Errors + Hides Loader)
    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        hideLoader();
        return response;
      },
      (error) => {
        hideLoader();
        
        //Auto-logout on 401 error
        if (error.response && error.response.status === 401) {
            console.warn("Session Expired or Unauthorized");
            localStorage.clear(); 
            nav("/login");
        }
        
        return Promise.reject(error);
      }
    );

    // --- SOCKET CONNECTION ---
    const token = localStorage.getItem("Althub_Token");
    if (token && !socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
      const userId = localStorage.getItem("Althub_Id");
      if(userId) socket.emit("addUser", userId);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Failed:", err.message);
    });

    // Cleanup
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [nav]);

  return (
    <>
      <ToastContainer />
      
      {/* Global Loader */}
      {isLoading && <Loader />}

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