import React, { useEffect, useState, useLayoutEffect, Suspense, lazy } from "react";
import { Route, Routes, useNavigate } from "react-router-dom"; 
import { ToastContainer } from "react-toastify";
import { socket } from "./socket";
import axios from "axios"; 

// Components
import Navbar from "./components/Navbar";
import Loader from "./components/Loader"; 
import AuthGuard from "./components/AuthGuard";

// --- LAZY LOAD PAGES (Code Splitting) ---
// This prevents downloading the entire app just to see the Main page
const Main = lazy(() => import("./components/Main"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Home = lazy(() => import("./components/Home"));
const Events = lazy(() => import("./components/Events"));
const Feedback = lazy(() => import("./components/Feedback"));
const ViewProfile = lazy(() => import("./components/ViewProfile"));
const ViewSearchProfile = lazy(() => import("./components/ViewSearchProfile"));
const SearchProfile = lazy(() => import("./components/SearchProfile"));
const Message = lazy(() => import("./components/Message"));
const Notidfication = lazy(() => import("./components/Notidfication"));
const ForgetPassword = lazy(() => import("./components/ForgetPassword"));
const NewPassword = lazy(() => import("./components/NewPassword"));
const Scholarship = lazy(() => import("./components/Scholarship"));
const MyPosts = lazy(() => import("./components/MyPosts"));

function App() {
  // Removed global isLoading to stop blocking the UI on every request
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
    // --- OPTIMIZED AXIOS INTERCEPTORS ---
    // Removed the global showLoader/hideLoader logic. 
    // This allows the app to remain interactive while fetching data.

    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("Althub_Token");
        if (token) {
           config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
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
      
      {/* Navbar is always present but handles its own visibility */}
      <Navbar socket={socket} />
      
      {/* Suspense shows the Loader only while the specific page code is downloading */}
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />

          {/* --- PROTECTED ROUTES --- */}
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
      </Suspense>
    </>
  );
}

export default App;