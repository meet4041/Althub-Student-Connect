import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import ProtectedImage from "../ProtectedImage";
import {
  Home, FileText, Search, MessageSquare, Bell, Gift, MessageCircle, Menu, X, LogOut, User
} from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar({ socket }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({});
  const [showNavbar, setShowNavbar] = useState(true);

  // Notification State
  const [hasMsg, setHasMsg] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);

  const nav = useNavigate();
  const { pathname } = useLocation();

  const getUser = useCallback(() => {
    const id = localStorage.getItem("Althub_Id");
    if (!id) { setUser({}); return; }
    axios.get(`${WEB_URL}/api/searchUserById/${id}`).then((res) => {
      if (res.data?.data) setUser(res.data.data[0]);
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser({});
    nav("/");
    setMobileOpen(false);
  };

  useEffect(() => {
    getUser();

    const hiddenRoutes = ["/register", "/login", "/", "/forget-password", "/new-password"];
    setShowNavbar(!hiddenRoutes.includes(pathname));

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (socket) {
      socket.emit("addUser", localStorage.getItem("Althub_Id"));

      const handleMessage = () => { if (pathname !== "/message") setHasMsg(true); };

      const handleNotification = (data) => {
        if (pathname !== "/notification") setHasNotif(true);
        if (data?.msg) {
          toast.info(data.msg);
          if ("Notification" in window && Notification.permission === "granted") {
            const sysNotif = new Notification(data.title || "New Notification", {
              body: data.msg, icon: "/images/Logo1.jpeg"
            });
            sysNotif.onclick = () => { window.focus(); nav("/notification"); };
          }
        }
      };

      socket.on("getMessage", handleMessage);
      socket.on("getNotification", handleNotification);

      return () => {
        socket.off("getMessage", handleMessage);
        socket.off("getNotification", handleNotification);
      };
    }
  }, [pathname, socket, getUser, nav]);

  useEffect(() => {
    if (pathname === "/message") setHasMsg(false);
    if (pathname === "/notification") setHasNotif(false);
    setMobileOpen(false);
  }, [pathname]);

  if (!showNavbar) return null;

  // Navigation Items
  const navItems = [
    { text: "Home", icon: <Home size={20} className="nav-icon" />, path: "/home" },
    { text: "My Posts", icon: <FileText size={20} className="nav-icon" />, path: "/my-posts" },
    { text: "Search", icon: <Search size={20} className="nav-icon" />, path: "/search-profile" },
    { text: "Message", icon: <MessageSquare size={20} className="nav-icon" />, path: "/message", badge: hasMsg },
    { text: "Notification", icon: <Bell size={20} className="nav-icon" />, path: "/notification", badge: hasNotif },
    { text: "Feedback", icon: <MessageCircle size={20} className="nav-icon" />, path: "/feedback" }
  ];

  // Desktop only shows first 5 items
  const desktopItems = navItems.slice(0, 5);

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container">

          {/* Logo */}
          <div onClick={() => nav("/home")} className="nav-logo">
            {/* <img src="/images/Logo1.jpeg" alt="AltHub" /> */}
            <h1 className="nav-logo-text">
              Alt<span className="logo-highlight">Hub</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {desktopItems.map((item) => (
              <button
                key={item.text}
                // Added 'group' here manually to enable group-hover on child icons
                className={`nav-item group ${pathname === item.path ? 'active' : ''}`}
                onClick={() => nav(item.path)}
              >
                <div className="relative flex items-center justify-center">
                  {item.icon}
                  {item.badge && <span className="nav-badge-dot"></span>}
                </div>
                <span>{item.text}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-actions">

            {/* Desktop Profile Button - Added 'group' here */}
            <div className="profile-btn group" onClick={() => nav("/view-profile")}>
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                <ProtectedImage
                  imgSrc={user?.profilepic}
                  defaultImage="images/profile1.png"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="nav-username">{user.fname || "User"}</span>
            </div>

            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

        </div>
      </nav>

      {/* --- Mobile Drawer --- */}

      {mobileOpen && (
        <div className="drawer-overlay" onClick={() => setMobileOpen(false)}></div>
      )}

      <div className={`drawer-panel ${mobileOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-sm">
              <ProtectedImage
                imgSrc={user?.profilepic}
                defaultImage="images/profile1.png"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg leading-tight">{user.fname} {user.lname}</p>
              <p className="text-xs text-slate-500 font-medium">View Profile</p>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="drawer-menu">
          {navItems.map((item) => (
            <button
              key={item.text}
              className={`drawer-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => nav(item.path)}
            >
              <div className="relative">
                {item.icon}
                {item.badge && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </div>
              <span>{item.text}</span>
            </button>
          ))}

          <button
            className={`drawer-item ${pathname === "/view-profile" ? 'active' : ''}`}
            onClick={() => nav("/view-profile")}
          >
            <User size={20} />
            <span>My Profile</span>
          </button>
        </div>

        {/* Footer */}
        <div className="drawer-logout">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>

      </div>
    </>
  );
}