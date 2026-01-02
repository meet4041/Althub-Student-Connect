import React, { useEffect, useState, useLayoutEffect, Suspense, lazy } from "react";
import { Route, Routes, useNavigate } from "react-router-dom"; 
import { ToastContainer } from "react-toastify";
import { socket } from "./socket";
import axios from "axios"; 

// Components
import Navbar from "./components/Navbar";
import Loader from "./components/Loader"; 
import AuthGuard from "./components/AuthGuard";

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
const Notification = lazy(() => import("./components/Notification"));
const ForgetPassword = lazy(() => import("./components/ForgetPassword"));
const NewPassword = lazy(() => import("./components/NewPassword"));
const Scholarship = lazy(() => import("./components/Scholarship"));
const MyPosts = lazy(() => import("./components/MyPosts"));

axios.defaults.withCredentials = true;

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const nav = useNavigate(); 

  useLayoutEffect(() => {
    setIsAuthReady(true); 
  }, []);

  useEffect(() => {
    // --- AXIOS INTERCEPTORS ---
    const reqInterceptor = axios.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/refreshToken`, {}, { withCredentials: true });
                return axios(originalRequest);
            } catch (refreshErr) {
                handleSecurityLogout();
                return Promise.reject(refreshErr);
            }
        }

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            handleSecurityLogout();
        }
        return Promise.reject(error);
      }
    );

    // --- CENTRALIZED LOGOUT LOGIC ---
    const handleSecurityLogout = () => {
      console.warn("Security Event: Logging out");
      // Token is stored as HttpOnly cookie; do not keep a client-side copy
      localStorage.removeItem("Althub_Id");
      if (socket.connected) socket.disconnect();
      nav("/login");
    };

    // --- SOCKET CONNECTION & SECURITY LISTENERS ---
    const userId = localStorage.getItem("Althub_Id");

    if (userId && !socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      if(userId) socket.emit("addUser", userId);
    };

    // SECURITY: Listen for a forced logout from the server
    const onForceLogout = () => {
      handleSecurityLogout();
    };

    socket.on("connect", onConnect);
    socket.on("forceLogout", onForceLogout); // Point 3 implementation

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      socket.off("connect", onConnect);
      socket.off("forceLogout", onForceLogout);
    };
  }, [nav]);

  if (!isAuthReady) return null; 

  return (
    <>
      <ToastContainer />
      <Navbar socket={socket} />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />

          <Route element={<AuthGuard />}>
              <Route path="/events" element={<Events />} />
              <Route path="/home" element={<Home socket={socket} />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/view-profile" element={<ViewProfile />} />
              <Route path="/view-search-profile" element={<ViewSearchProfile socket={socket} />} />
              <Route path="/search-profile" element={<SearchProfile />} />
              <Route path="/message" element={<Message socket={socket} />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/scholarship" element={<Scholarship />} />
              <Route path="/my-posts" element={<MyPosts />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;