import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ProtectedImage from "./common/ProtectedImage";
import { Home, FileText, Search, MessageSquare, Bell, MessageCircle, Menu, X, LogOut, User } from "lucide-react";
import "../styles/Navbar.css";
import { useAuth } from "../auth/session";

export default function Navbar({ socket }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);

  const [hasMsg, setHasMsg] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);

  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  useEffect(() => {
    const hiddenRoutes = ["/register", "/login", "/", "/forgot-password", "/forget-password", "/new-password"];
    setShowNavbar(!hiddenRoutes.includes(pathname));

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (socket && user?._id) {

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
  }, [pathname, socket, user?._id, nav]);

  useEffect(() => {
    if (pathname === "/message") setHasMsg(false);
    if (pathname === "/notification") setHasNotif(false);
    setMobileOpen(false);
  }, [pathname]);

  if (!showNavbar) return null;

  const navItems = [
    { text: "Home", icon: <Home size={20} className="nav-icon" />, path: "/home" },
    { text: "My Posts", icon: <FileText size={20} className="nav-icon" />, path: "/my-posts" },
    { text: "Search", icon: <Search size={20} className="nav-icon" />, path: "/search-profile" },
    { text: "Message", icon: <MessageSquare size={20} className="nav-icon" />, path: "/message", badge: hasMsg },
    { text: "Notification", icon: <Bell size={20} className="nav-icon" />, path: "/notification", badge: hasNotif },
    { text: "Feedback", icon: <MessageCircle size={20} className="nav-icon" />, path: "/feedback" }
  ];

  const desktopItems = navItems.slice(0, 5);

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container">

          <div onClick={() => nav("/home")} className="nav-logo">
            <h1 className="nav-logo-text">
              Alt<span className="logo-highlight">Hub</span>
            </h1>
          </div>

          <div className="nav-links">
            {desktopItems.map((item) => (
              <button
                key={item.text}
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

          <div className="nav-actions">

            <div className="profile-btn group" onClick={() => nav("/view-profile")}>
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                <ProtectedImage
                  imgSrc={user?.profilepic}
                  defaultImage="images/profile1.png"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="nav-username">{user?.fname || "User"}</span>
            </div>

            <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

        </div>
      </nav>

      {mobileOpen && (
        <div className="drawer-overlay" onClick={() => setMobileOpen(false)}></div>
      )}

      <div className={`drawer-panel ${mobileOpen ? 'open' : ''}`}>

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
              <p className="font-bold text-slate-800 text-lg leading-tight">{user?.fname || "User"} {user?.lname || ""}</p>
              <p className="text-xs text-slate-500 font-medium">View Profile</p>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

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
