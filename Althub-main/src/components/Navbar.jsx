import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
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

export default function Navbar({ socket }) {
  const [state, setState] = React.useState({
    right: false,
  });
  const [user, setUser] = useState({});
  const [navbar, setNavbar] = useState(true);
  
  // Use useLocation hook to track route changes correctly
  const location = useLocation(); 
  const pathname = location.pathname;

  const [mesDot, setMesDot] = useState(false);
  const [notDot, setNotDot] = useState(false);
  const nav = useNavigate();

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  // Wrap getUser in useCallback to prevent dependency warnings
  const getUser = useCallback(() => {
    const userID = localStorage.getItem("Althub_Id");
    if (!userID) {
      setUser({}); // Clear user if logged out
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
      .catch((error) => {
        console.error("Navbar Error:", error);
      });
  }, []);

  const Logout = () => {
    localStorage.clear();
    setUser({}); // Clear local state immediately
    nav("/");
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
      style={{ color: "#7e7f81" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          alignItems: "center",
          fontSize: "30px",
          color: "black",
        }}
      >
        <i className="fa-solid fa-xmark"></i>
        <h4>Menubar</h4>
      </div>
      <Divider />
      <List>
        <ListItem
          key={"home"}
          disablePadding
          onClick={() => {
            nav("/home");
          }}
        >
          <ListItemButton>
            <i className="fa-solid fa-house" style={{ padding: "10px 15px" }}></i>
            <ListItemText primary={"Home"} />
          </ListItemButton>
        </ListItem>
        
        {/* --- ADDED MY POSTS TO DRAWER --- */}
        <ListItem
          key={"myposts"}
          disablePadding
          onClick={() => {
            nav("/my-posts");
          }}
        >
          <ListItemButton>
            <i className="fa-solid fa-address-card" style={{ padding: "10px 15px" }}></i>
            <ListItemText primary={"My Posts"} />
          </ListItemButton>
        </ListItem>
        {/* -------------------------------- */}

        <ListItem
          key={"search"}
          disablePadding
          onClick={() => {
            nav("/search-profile");
          }}
        >
          <ListItemButton>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ padding: "10px 15px" }}
            ></i>
            <ListItemText primary={"search"} />
          </ListItemButton>
        </ListItem>
        <ListItem
          key={"message"}
          disablePadding
          onClick={() => {
            nav("/message");
          }}
        >
          <ListItemButton>
            <i className="fa-solid fa-message" style={{ padding: "10px 15px" }}></i>
            <ListItemText primary={"Message"} />
          </ListItemButton>
        </ListItem>
        <ListItem
          key={"scholarship"}
          disablePadding
          onClick={() => {
            nav("/scholarship");
          }}
        >
          <ListItemButton>
            <i className="fa-solid fa-handshake-angle" style={{ padding: "10px 15px" }}></i>
            <ListItemText primary={"Scholarship"} />
          </ListItemButton>
        </ListItem>
        <ListItem
          key={"notification"}
          disablePadding
          onClick={() => {
            nav("/notification");
          }}
        >
          <ListItemButton>
            <i className="fa-solid fa-bell" style={{ padding: "10px 15px" }}></i>
            <ListItemText primary={"Notification"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          key={"feedback"}
          disablePadding
          onClick={() => {
            nav("/feedback");
          }}
        >
          <ListItemButton>
            <i
              className="fa-solid fa-star"
              style={{ padding: "10px 15px" }}
            ></i>
            <ListItemText primary={"Feedback"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"logout"} onClick={Logout} disablePadding>
          <ListItemButton>
            <i
              className="fa-solid fa-right-from-bracket"
              style={{ padding: "10px 15px" }}
            ></i>
            <ListItemText primary={"Logout"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // --- Combined Effect: Handles Route Changes & Socket ---
  useEffect(() => {
    // 1. Fetch user data whenever pathname changes (Fixes your bug)
    getUser();

    // 2. Handle Navbar visibility based on route
    if (
      pathname === "/register" ||
      pathname === "/login" ||
      pathname === "/" ||
      pathname === "/forget-password" ||
      pathname === "/new-password"
    ) {
      setNavbar(false);
    } else {
      setNavbar(true);
    }

    // 3. Socket Logic
    if (!socket) return;
    
    socket.emit("addUser", localStorage.getItem("Althub_Id"));
    
    const handleMessage = (data) => {
      setMesDot(true);
      if (pathname === "/message") {
        setMesDot(false);
      }
    };

    const handleNotification = (data) => {
      setNotDot(true);
      
      // Elite pop-up notification
      if(data && data.msg) {
          toast.info(data.msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
      }
      
      if (pathname === "/notification") {
        setNotDot(false);
      }
    };

    socket.on("getMessage", handleMessage);
    socket.on("getNotification", handleNotification);

    return () => {
        socket.off("getMessage", handleMessage);
        socket.off("getNotification", handleNotification);
    }
  }, [pathname, socket, getUser]); 
  // ^ Added 'pathname' and 'getUser' to dependencies so it re-runs on navigation

  return (
    <>
      <nav className="navbar" style={{ display: navbar ? "flex" : "none" }}>
        <div className="navbar-left">
          <Link to="/home" className="logo">
            <img src="/images/Logo1.jpeg" alt="#" />
          </Link>
        </div>
        <div className="navbar-center">
          <ul>
            <Link to="/home">
              <li>
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </li>
            </Link>

            {/* --- ADDED MY POSTS LINK --- */}
            <Link to="/my-posts">
              <li>
                <i className="fa-solid fa-address-card"></i>
                <span>My Posts</span>
              </li>
            </Link>
            {/* --------------------------- */}

            <Link to="/search-profile">
              <li>
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Search</span>
              </li>
            </Link>
            <Link to="/message">
              <li onClick={() => { setMesDot(false) }}>
                {mesDot ? <i
                  className="fa-solid fa-circle"
                  style={{
                    color: "#ff0000",
                    fontSize: "6px",
                    position: "absolute",
                    marginLeft: "20px",
                  }}
                ></i> : null}
                <i className="fa-solid fa-message"></i>
                <span>Message</span>
              </li>
            </Link>
            <Link to="/notification">
              <li onClick={() => { setNotDot(false) }}>
                {notDot ? <i
                  className="fa-solid fa-circle"
                  style={{
                    color: "#ff0000",
                    fontSize: "6px",
                    position: "absolute",
                    marginLeft: "16px",
                  }}
                ></i> : null}
                <i className="fa-solid fa-bell"></i>
                <span>Notification</span>
              </li>
            </Link>
          </ul>
        </div>
        <div className="navbar-right">
          <div
            className="nav-profile"
            onClick={() => {
              nav("/view-profile");
            }}
          >
            {user && user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" ? (
              <img
                src={`${WEB_URL}${user.profilepic}`}
                alt=""
                className="nav-profile-img"
              />
            ) : (
              <img src="images/profile1.png" className="nav-profile-img" alt="#" />
            )}
            <div className="user-profile">
              {user && user.fname ? (
                <span>
                  {user.fname} {user.lname}
                </span>
              ) : (
                <span>USER</span>
              )}
            </div>
          </div>

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
          <div></div>
        </div>
      </nav>
    </>
  );
}