import React, { useEffect, useState, useLayoutEffect } from "react";
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
import AuthGuard from "./components/AuthGuard";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const nav = useNavigate(); 

  // --- 1. IMMEDIATE TOKEN RESTORATION ---
  useLayoutEffect(() => {
    const token = localStorage.getItem("Althub_Token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setIsAuthReady(true); 
  }, []);

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

    // REQUEST INTERCEPTOR
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        showLoader();
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

    // RESPONSE INTERCEPTOR
    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        hideLoader();
        return response;
      },
      (error) => {
        hideLoader();
        
        // Auto-logout on 401 error
        if (error.response && error.response.status === 401) {
            console.warn("Session Expired or Unauthorized - Logging out");
            
            localStorage.removeItem("Althub_Token");
            localStorage.removeItem("Althub_Id");
            delete axios.defaults.headers.common["Authorization"];
            
            nav("/login");
        }
        
        return Promise.reject(error);
      }
    );

    // --- SOCKET CONNECTION ---
    const token = localStorage.getItem("Althub_Token");
    const userId = localStorage.getItem("Althub_Id");

    if (token && userId && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    const onConnect = () => {
      console.log("Socket Connected:", socket.id);
      if(userId) socket.emit("addUser", userId);
    };

    const onConnectError = (err) => {
      console.warn("Socket Connection Failed:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    };
  }, [nav]);

  if (!isAuthReady) {
      return null; 
  }

  return (
    <>
      <ToastContainer />
      
      {isLoading && <Loader />}

      <Navbar socket={socket} />
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* These can be accessed without logging in */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        {/* Assuming NewPassword is the reset page from email link, so it's public */}
        <Route path="/new-password" element={<NewPassword />} />

        {/* --- PROTECTED ROUTES --- */}
        {/* The AuthGuard checks for the token once. 
            If valid, it renders the components below. 
            If not, it redirects to /login. */}
        <Route element={<AuthGuard />}>
            <Route path="/events" element={<Events />} />
            <Route path="/home" element={<Home socket={socket} />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/view-profile" element={<ViewProfile />} />
            <Route path="/view-search-profile" element={<ViewSearchProfile socket={socket} />} />
            <Route path="/search-profile" element={<SearchProfile />} />
            <Route path="/message" element={<Message socket={socket} />} />
            <Route path="/notification" element={<Notidfication />} />
            <Route path="/scholarship" element={<Scholarship />} />
            <Route path="/my-posts" element={<MyPosts />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;