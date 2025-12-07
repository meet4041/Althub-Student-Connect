import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as React from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

// --- INJECTED STYLES FOR MODERN FULL-WIDTH NAVBAR ---
const styles = `
  /* Navbar Container */
  .navbar {
    width: 100%;
    height: 80px;
    background: #ffffff;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  }

  .navbar-content {
    width: 100%;
    max-width: 1400px; /* Matches Home/Events width */
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }

  /* Left: Logo */
  .navbar-left .logo img {
    height: auto;
    width: 140px;
    object-fit: contain;
    display: block;
  }

  /* Center: Navigation Links */
  .navbar-center {
    height: 100%;
  }

  .navbar-center ul {
    display: flex;
    gap: -10px;
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
  }

  .nav-link-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    height: 100%;
    padding: 0 5px;
    position: relative;
    gap: 4px;
  }

  .nav-item i {
    font-size: 1.3rem;
    color: #b2bec3;
    transition: color 0.2s ease;
  }

  /* Hover & Active States */
  .nav-item:hover {
    color: #66bd9e;
  }
  
  .nav-item:hover i {
    color: #66bd9e;
  }

  .nav-item.active {
    color: #66bd9e;
  }

  .nav-item.active i {
    color: #66bd9e;
  }

  /* Active Bottom Border Indicator */
  .nav-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    transform: scaleX(0);
    transition: transform 0.3s ease;
    border-radius: 3px 3px 0 0;
  }

  .nav-item.active::after {
    transform: scaleX(1);
  }

  /* Notification Dot */
  .notif-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .notif-dot {
    position: absolute;
    top: -2px;
    right: -3px;
    width: 9px;
    height: 9px;
    background-color: #ff4757;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  /* Right Side: Profile */
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .nav-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 50px;
    transition: background 0.2s;
    border: 1px solid transparent;
  }

  .nav-profile:hover {
    background-color: #f8f9fa;
    border-color: #eee;
  }

  .nav-profile-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .user-profile {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .user-profile span {
    margin-left:-7px;
    font-weight: 600;
    color: #2d3436;
    font-size: 0.9rem;
  }
  
  .user-role {
    font-size: 0.75rem;
    color: #999;
  }

  /* Mobile Menu Button */
  .nav-search-bar button {
    color: #666;
    min-width: 40px;
  }
  .nav-search-bar i {
    font-size: 1.5rem;
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .navbar-center { display: none; }
    .nav-profile { display: none; }
    .nav-search-bar { display: block; }
    .navbar-content { padding: 0 20px; }
  }
  @media (min-width: 1101px) {
    .nav-search-bar { display: none; }
  }
`;

export default function Navbar({ socket }) {
  const [state, setState] = React.useState({ right: false });
  const [user, setUser] = useState({});
  const [navbar, setNavbar] = useState(true);
  
  const location = useLocation(); 
  const pathname = location.pathname;

  const [mesDot, setMesDot] = useState(false);
  const [notDot, setNotDot] = useState(false);
  const nav = useNavigate();

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const getUser = useCallback(() => {
    const userID = localStorage.getItem("Althub_Id");
    if (!userID) {
      setUser({});
      return;
    }
    axios({
      method: "get",
      url: `${WEB_URL}/api/searchUserById/${userID}`,
    })
      .then((Response) => {
        if (Response.data && Response.data.data && Response.data.data[0]) {
          setUser(Response.data.data[0]);
        }
      })
      .catch((error) => console.error("Navbar Error:", error));
  }, []);

  const Logout = () => {
    localStorage.clear();
    setUser({});
    nav("/");
  };

  // --- Mobile Drawer Content ---
  const list = (anchor) => (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee" }}>
        <h3 style={{ margin: 0, color: "#2d3436", fontWeight: "600" }}>Menu</h3>
        <i className="fa-solid fa-xmark" style={{ fontSize: "1.2rem", cursor: "pointer", color: "#888" }}></i>
      </div>
      
      <List>
        {[
          { text: "Home", icon: "fa-house", path: "/home" },
          { text: "My Posts", icon: "fa-address-card", path: "/my-posts" },
          { text: "Search", icon: "fa-magnifying-glass", path: "/search-profile" },
          { text: "Message", icon: "fa-message", path: "/message" },
          { text: "Scholarship", icon: "fa-handshake-angle", path: "/scholarship" },
          { text: "Notification", icon: "fa-bell", path: "/notification" },
          { text: "Feedback", icon: "fa-star", path: "/feedback" },
        ].map((item) => (
          <ListItem key={item.text} disablePadding onClick={() => nav(item.path)}>
            <ListItemButton>
              <i className={`fa-solid ${item.icon}`} style={{ width: "35px", color: "#66bd9e", fontSize: "1.1rem" }}></i>
              <ListItemText primary={item.text} primaryTypographyProps={{fontSize: '0.95rem', fontWeight: '500', color: '#444'}} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding onClick={Logout}>
          <ListItemButton>
            <i className="fa-solid fa-right-from-bracket" style={{ width: "35px", color: "#ff4757", fontSize: "1.1rem" }}></i>
            <ListItemText primary="Logout" sx={{ color: "#ff4757" }} primaryTypographyProps={{fontSize: '0.95rem', fontWeight: '600'}} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  useEffect(() => {
    getUser();

    if (["/register", "/login", "/", "/forget-password", "/new-password"].includes(pathname)) {
      setNavbar(false);
    } else {
      setNavbar(true);
    }

    // --- NEW: Request Notification Permission ---
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (!socket) return;
    socket.emit("addUser", localStorage.getItem("Althub_Id"));
    
    const handleMessage = () => { if (pathname !== "/message") setMesDot(true); };
    
    // --- UPDATED: Notification Handler ---
    const handleNotification = (data) => {
      if (pathname !== "/notification") setNotDot(true);
      if(data && data.msg) {
          // 1. Show In-App Toast
          toast.info(data.msg, { position: "top-right", theme: "light" });

          // 2. Show System Pop-up Notification
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification(data.title || "New Notification", {
              body: data.msg,
              icon: "/images/Logo1.jpeg", // Using your logo as icon
              // silent: false
            });
            
            // Optional: Click to focus window
            notification.onclick = () => {
              window.focus();
              nav("/notification");
            };
          }
      }
    };

    socket.on("getMessage", handleMessage);
    socket.on("getNotification", handleNotification);

    return () => {
        socket.off("getMessage", handleMessage);
        socket.off("getNotification", handleNotification);
    }
  }, [pathname, socket, getUser, nav]);

  useEffect(() => {
    if (pathname === "/message") setMesDot(false);
    if (pathname === "/notification") setNotDot(false);
  }, [pathname]);

  if (!navbar) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        
        {/* Left: Logo */}
        <div className="navbar-left">
          <Link to="/home" className="logo">
            <img src="/images/Logo1.jpeg" alt="AltHub" />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="navbar-center">
          <ul>
            <li className="nav-link-wrapper">
              <Link to="/home" className={`nav-item ${pathname === '/home' ? 'active' : ''}`}>
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </Link>
            </li>

            <li className="nav-link-wrapper">
              <Link to="/my-posts" className={`nav-item ${pathname === '/my-posts' ? 'active' : ''}`}>
                <i className="fa-solid fa-address-card"></i>
                <span>My Posts</span>
              </Link>
            </li>

            <li className="nav-link-wrapper">
              <Link to="/search-profile" className={`nav-item ${pathname === '/search-profile' ? 'active' : ''}`}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Search</span>
              </Link>
            </li>

            <li className="nav-link-wrapper">
              <Link to="/message" className={`nav-item ${pathname === '/message' ? 'active' : ''}`}>
                <div className="notif-wrapper">
                  <i className="fa-solid fa-message"></i>
                  {mesDot && <div className="notif-dot"></div>}
                </div>
                <span>Message</span>
              </Link>
            </li>

            <li className="nav-link-wrapper">
              <Link to="/notification" className={`nav-item ${pathname === '/notification' ? 'active' : ''}`}>
                <div className="notif-wrapper">
                  <i className="fa-solid fa-bell"></i>
                  {notDot && <div className="notif-dot"></div>}
                </div>
                <span>Notification</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: Profile */}
        <div className="navbar-right">
          <div className="nav-profile" onClick={() => nav("/view-profile")}>
            <img
              src={user?.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"}
              alt="User"
              className="nav-profile-img"
            />
            <div className="user-profile">
              <span>{user.fname || "User"}</span>
              <span></span>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="nav-search-bar">
            <React.Fragment>
              <Button onClick={toggleDrawer("right", true)}>
                <i className="fa-solid fa-bars"></i>
              </Button>
              <SwipeableDrawer
                anchor="right"
                open={state["right"]}
                onClose={toggleDrawer("right", false)}
                onOpen={toggleDrawer("right", true)}
              >
                {list("right")}
              </SwipeableDrawer>
            </React.Fragment>
          </div>
        </div>

      </div>
    </nav>
  );
}