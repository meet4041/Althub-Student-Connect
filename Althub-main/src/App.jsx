import React, { useEffect, useState, useLayoutEffect, Suspense, lazy } from "react";
import { Route, Routes, useNavigate } from "react-router-dom"; 
import { ToastContainer } from "react-toastify";
import { socket } from "./socket";
import axios from "axios"; 
import { WEB_URL } from "./baseURL";

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
    const readCookie = (name) => {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? decodeURIComponent(match[2]) : null;
    };

    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
          const csrfToken = readCookie('csrf_token');
          if (csrfToken) {
              config.headers['X-CSRF-Token'] = csrfToken;
          }
          return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Avoid infinite loops if refreshToken itself fails
            if (originalRequest.url.includes("/api/refreshToken")) {
                handleSecurityLogout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                const res = await axios.post(`${WEB_URL}/api/refreshToken`, {}, { withCredentials: true });
                if (res.data.success) {
                    return axios(originalRequest);
                }
            } catch (refreshErr) {
                console.error("Session refresh failed:", refreshErr.message);
                handleSecurityLogout();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
      }
    );

    // --- CENTRALIZED LOGOUT LOGIC ---
    const handleSecurityLogout = () => {
      console.warn("Security Event: Logging out");
      localStorage.removeItem("Althub_Id");
      if (socket.connected) socket.disconnect();
      
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/forget-password', '/new-password', '/'];
      if (!publicPaths.includes(currentPath)) {
          nav("/login");
      }
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
