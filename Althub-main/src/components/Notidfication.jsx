import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";

// --- INJECTED STYLES FOR FULL-WIDTH GRID UI ---
const styles = `
  /* --- Layout & Container --- */
  .home-container {
    display: flex;
    gap: 15px; /* Reduced gap between sidebar and main content */
    align-items: flex-start;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .notification-main {
    flex: 1;
    width: 100%; /* Forces it to take remaining width */
    min-width: 0; /* Prevents flex overflow */
  }

  /* --- Header Section --- */
  .notif-page-header {
    background: #fff;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #eaeaea;
  }

  .notif-page-header h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #333;
    font-weight: 600;
  }

  .notif-badge {
    background: #66bd9e;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  /* --- GRID LAYOUT FOR CARDS --- */
  .notification-box {
    display: grid;
    /* This creates columns that fill the space. Adjust 350px if you want smaller/larger cards */
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 15px; /* Space between cards */
    width: 100%;
  }

  /* --- Individual Card Styling --- */
  .notification-card {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #f0f0f0;
    height: 100%; /* Ensures all cards in a row are same height */
    box-sizing: border-box;
  }

  .notification-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    border-color: #66bd9e;
  }

  /* --- Image Section --- */
  .notif-img-wrapper {
    margin-right: 15px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .notif-img-wrapper img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f5f5f5;
  }

  /* --- Content Section --- */
  .notif-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden; /* Prevents text spill */
  }

  .notif-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notif-desc {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Limits text to 2 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .notif-time {
    font-size: 0.75rem;
    color: #aaa;
    font-weight: 500;
  }

  /* --- Delete Button --- */
  .notif-delete-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #e0e0e0;
    cursor: pointer;
    background: transparent;
    margin-left: 10px;
    flex-shrink: 0;
  }

  .notif-delete-btn:hover {
    background: #ffe5e5;
    color: #ff4d4d;
  }

  /* --- Empty/Loading State --- */
  .state-msg {
    text-align: center;
    padding: 40px;
    color: #888;
    background: #fff;
    border-radius: 12px;
    width: 100%;
    border: 1px solid #eee;
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .home-container {
      flex-direction: column;
      padding: 10px;
    }
    .profile-card-main {
      width: 100%;
      margin-bottom: 20px;
    }
    .notification-box {
      grid-template-columns: 1fr; /* Stack vertically on mobile */
    }
  }
`;

export default function Notidfication() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const userid = localStorage.getItem("Althub_Id");

  // --- Inject Styles ---
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const getUser = () => {
    axios({
      method: "get",
      url: `${WEB_URL}/api/searchUserById/${userid}`,
    })
      .then((Response) => {
        setUser(Response.data.data[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getNotifications = () => {
    axios({
      url: `${WEB_URL}/api/getnotifications`,
      method: "post",
      data: {
        userid: userid,
      },
    })
      .then((Response) => {
        if (Response.data && Response.data.data) {
          const allowedTypes = ["New Follower", "New Like", "New Event", "New Message"];
          const filteredData = Response.data.data.filter((item) => 
            allowedTypes.includes(item.title)
          );
          setNotifications(filteredData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleProfileRedirect = (e, senderId) => {
    e.stopPropagation();
    if (senderId) {
      nav(`/view-profile/${senderId}`);
    } else {
      console.log("No User ID found for this notification");
    }
  };

  const handleDelete = (id) => {
    if(!window.confirm("Are you sure you want to delete this notification?")) return;

    axios({
      url: `${WEB_URL}/api/deleteNotification`,
      method: "post",
      data: {
        notificationId: id,
      },
    })
      .then((response) => {
        if (response.data.success) {
          const updatedList = notifications.filter((item) => item._id !== id);
          setNotifications(updatedList);
        }
      })
      .catch((error) => {
        console.log("Error deleting notification:", error);
      });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const messageTime = new Date(timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now - messageTime);
    const minutesDiff = Math.floor(timeDiff / 60000);
    if (minutesDiff < 1) {
      return "Just now";
    } else if (minutesDiff < 60) {
      return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
    } else if (messageTime.toDateString() === now.toDateString()) {
      const options = { hour: "numeric", minute: "numeric" };
      return `Today at ${messageTime.toLocaleTimeString("en-US", options)}`;
    } else {
      const options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return messageTime.toLocaleString("en-US", options);
    }
  };

  const Logout = () => {
    localStorage.clear();
    nav("/");
  };

  useEffect(() => {
    getUser();
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="home-container">
        {/* --- LEFT SIDEBAR (Unchanged Logic) --- */}
        <div className="profile-card-main">
          <div className="profile-card">
            <div className="profile-card-imgbox">
              {user?.profilepic ? (
                <img
                  src={`${WEB_URL}${user.profilepic}`}
                  alt=""
                  className="profile-card-img"
                />
              ) : (
                <img
                  src="images/profile1.png"
                  className="profile-card-img"
                  alt="#"
                ></img>
              )}
            </div>

            <div className="profile-card-info">
              <span className="profile-card-name">
                {user?.fname} {user?.lname}
              </span>
            </div>
          </div>

          <div className="menu-container">
            <div 
              className="menu" 
              onClick={() => {
                nav("/view-profile");
                window.scrollTo(0, 0);
              }}
            >
              <i className="fa-solid fa-user"></i>Go to Profile
            </div>

            <div className="menu" onClick={() => nav("/events")}>
              <i className="fa-solid fa-calendar"></i>Events
            </div>
            <div className="menu" onClick={() => nav("/scholarship")}>
              <i className="fa-solid fa-handshake-angle"></i>Scholarship
            </div>
            <div className="menu" onClick={() => nav("/feedback")}>
              <i className="fa-solid fa-star"></i>FeedBack & Rating
            </div>
            <hr className="hr-line" />
            <div className="menu" onClick={Logout}>
              <i className="fa-solid fa-right-from-bracket"></i>Logout
            </div>
          </div>
        </div>
        
        {/* --- RIGHT SIDE: NOTIFICATIONS (Full Width Grid) --- */}
        <div className="notification-main">
          
          <div className="notif-page-header">
            <h2>Notifications</h2>
            {notifications.length > 0 && <span className="notif-badge">{notifications.length} New</span>}
          </div>

          {loading ? (
             <div className="state-msg">
                <i className="fa-solid fa-spinner fa-spin" style={{marginRight: '10px'}}></i> Loading...
             </div>
          ) : notifications.length > 0 ? (
            <div className="notification-box">
              {notifications.map((elem) => (
                <div 
                  className="notification-card" 
                  key={elem._id || Math.random()} 
                >
                  <div 
                    className="notif-img-wrapper"
                    onClick={(e) => handleProfileRedirect(e, elem.senderId)}
                    title="View Profile"
                  >
                    {elem.image ? (
                        <img src={`${WEB_URL}${elem.image}`} alt="" />
                    ) : (
                        <img src="images/profile1.png" alt="" />
                    )}
                  </div>
                  
                  <div className="notif-content">
                    <div className="notif-title">
                      {elem.title}
                    </div>
                    <div className="notif-desc">
                      {elem.msg}
                    </div>
                    <div className="notif-time">
                      <i className="fa-regular fa-clock" style={{fontSize: '0.8em', marginRight:'4px'}}></i> {formatTime(elem.date)}
                    </div>
                  </div>

                  <div 
                    className="notif-delete-btn" 
                    onClick={() => handleDelete(elem._id)}
                    title="Delete Notification"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="state-msg">
                <img src="images/search-bro.png" alt="No Data" style={{width: '120px', marginBottom: '15px', opacity: 0.6}} />
                <p>No new notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}