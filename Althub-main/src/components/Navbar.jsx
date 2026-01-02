import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import ProtectedImage from "../ProtectedImage";
import "../styles/Navbar.css"; // <--- Import CSS

// MUI Components
import {
  AppBar, Toolbar, IconButton, Button, Badge, Avatar, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Container, Typography, Divider
} from "@mui/material";

// Icons
import {
  Home, AccountBox, Search, Message, Notifications, Feedback,
  VolunteerActivism, Menu as MenuIcon, Close, Logout as LogoutIcon
} from "@mui/icons-material";

export default function Navbar({ socket }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({});
  const [showNavbar, setShowNavbar] = useState(true);

  // Notification State
  const [hasMsg, setHasMsg] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // --- Handlers ---
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setMobileOpen(open);
  };

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
  };

  // --- Effects ---
  useEffect(() => {
    getUser();

    // Hide Navbar on auth pages
    const hiddenRoutes = ["/register", "/login", "/", "/forget-password", "/new-password"];
    setShowNavbar(!hiddenRoutes.includes(pathname));

    // Request Notification Permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Socket Listeners
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

  // Reset dots when visiting pages
  useEffect(() => {
    if (pathname === "/message") setHasMsg(false);
    if (pathname === "/notification") setHasNotif(false);
  }, [pathname]);

  if (!showNavbar) return null;

  // --- Navigation Items Configuration ---
  const navItems = [
    { text: "Home", icon: <Home />, path: "/home" },
    { text: "My Posts", icon: <AccountBox />, path: "/my-posts" },
    { text: "Search", icon: <Search />, path: "/search-profile" },
    { text: "Message", icon: <Message />, path: "/message", badge: hasMsg },
    { text: "Notification", icon: <Notifications />, path: "/notification", badge: hasNotif },
    { text: "Scholarship", icon: <VolunteerActivism />, path: "/scholarship" }, // Added to Desktop too? Usually limited space.
    { text: "Feedback", icon: <Feedback />, path: "/feedback" } // Mobile only usually, but added here based on your list
  ];

  // Filter items for Desktop Navbar (keep it clean)
  const desktopNavItems = navItems.filter(item => ["Home", "My Posts", "Search", "Message", "Notification"].includes(item.text));

  const mobileList = (
    <Box sx={{ width: 280 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <div className="mobile-menu-header">
        <Typography variant="h6" className="mobile-menu-title">Menu</Typography>
        <IconButton onClick={toggleDrawer(false)}><Close /></IconButton>
      </div>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding onClick={() => nav(item.path)}>
            <ListItemButton className="mobile-nav-item">
              <ListItemIcon className="mobile-nav-icon">
                {item.badge ? <Badge variant="dot" color="error">{item.icon}</Badge> : item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} className="mobile-nav-text" />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding onClick={handleLogout} className="mobile-logout">
          <ListItemButton className="mobile-nav-item">
            <ListItemIcon className="mobile-nav-icon"><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" className="mobile-nav-text" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" className="navbar-appbar" elevation={0}>
      <Container maxWidth="xl" className="navbar-container">
        <Toolbar className="navbar-toolbar">

          {/* Logo */}
          <Link to="/home" className="navbar-logo">
            <img src="/images/Logo1.jpeg" alt="AltHub" />
          </Link>

          {/* Desktop Navigation */}
          <Box className="nav-links-box">
            {desktopNavItems.map((item) => (
              <Button
                key={item.text}
                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                onClick={() => nav(item.path)}
                startIcon={
                  item.badge ?
                    <Badge variant="dot" className="nav-badge">{item.icon}</Badge> :
                    item.icon
                }
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right Side: Profile & Mobile Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            {/* Desktop Profile Button */}
            <Box className="nav-profile-box">
              <Button className="nav-profile-btn" onClick={() => nav("/view-profile")}>
                <Avatar className="nav-avatar">
                  <ProtectedImage
                    imgSrc={user?.profilepic}
                    defaultImage="images/profile1.png"
                  />
                </Avatar>
                <Typography className="nav-user-name">
                  {user.fname || "User"}
                </Typography>
              </Button>
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              className="nav-mobile-btn"
              onClick={toggleDrawer(true)}
              sx={{ color: '#555', ml: 1 }}
            >
              <MenuIcon />
            </IconButton>

          </Box>

          {/* Mobile Drawer */}
          <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer(false)}>
            {mobileList}
          </Drawer>

        </Toolbar>
      </Container>
    </AppBar>
  );
}