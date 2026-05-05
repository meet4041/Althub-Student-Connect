import React, { useEffect, useState, useLayoutEffect, Suspense, lazy } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"; 
import { ToastContainer } from "react-toastify";
import { socket } from "./realtime/socket";

// Components
import Navbar from "./components/Navbar";
import Loader from "./components/Loader"; 
import AuthGuard from "./auth/AuthGuard";

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
const MyPosts = lazy(() => import("./components/MyPosts"));

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const nav = useNavigate(); 

  useLayoutEffect(() => {
    setIsAuthReady(true); 
  }, []);

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
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/forget-password" element={<Navigate to="/forgot-password" replace />} />
          <Route path="/new-password" element={<NewPassword />} />

          <Route element={<AuthGuard />}>
              <Route path="/events" element={<Events />} />
              <Route path="/home" element={<Home socket={socket} />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/view-profile" element={<ViewProfile />} />
              <Route path="/view-search-profile" element={<ViewSearchProfile socket={socket} />} />
              <Route path="/view-search-profile/:id" element={<ViewSearchProfile socket={socket} />} />
              <Route path="/search-profile" element={<SearchProfile socket={socket} />} />
              <Route path="/message" element={<Message socket={socket} />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/my-posts" element={<MyPosts />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
