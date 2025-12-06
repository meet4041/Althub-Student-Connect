import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";

// --- INJECTED STYLES FOR FULL-SCREEN BAR LAYOUT ---
const styles = `
  /* --- Page Layout --- */
  .notif-page-wrapper {
    background-color: #ffffff;
    min-height: 100vh;
    font-family: 'Poppins', sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* --- Sticky Header --- */
  .notif-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.98);
    border-bottom: 1px solid #eaeaea;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(5px);
  }

  .header-left h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3436;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .notif-badge {
    background: #ff4757;
    color: white;
    font-size: 0.85rem;
    padding: 4px 12px;
    border-radius: 50px;
    font-weight: 600;
    vertical-align: middle;
  }

  .back-btn {
    padding: 10px 24px;
    border: 1px solid #e0e0e0;
    background: transparent;
    border-radius: 30px;
    color: #555;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn:hover {
    border-color: #333;
    color: #333;
    background: #f9f9f9;
  }

  /* --- Notification List Container --- */
  .notif-list {
    flex: 1;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* --- Notification Bar (Row) --- */
  .notif-row {
    display: flex;
    align-items: center;
    padding: 25px 40px;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s ease;
    width: 100%;
    box-sizing: border-box;
    cursor: default;
  }

  .notif-row:hover {
    background-color: #fcfcfc;
  }

  /* Highlight Unread Items */
  .notif-row.new-item {
    background-color: #f0f9f6; /* Subtle Green Tint */
  }
  
  .notif-row.new-item:hover {
    background-color: #e8f5f1;
  }

  /* Image Section */
  .notif-img-wrapper {
    flex-shrink: 0;
    margin-right: 30px;
    cursor: pointer;
  }

  .notif-img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
    transition: transform 0.2s;
  }

  .notif-img:hover {
    transform: scale(1.05);
    border-color: #66bd9e;
  }

  /* Text Content */
  .notif-content {
    flex: 1; /* Takes all remaining space */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .notif-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
  }

  .notif-msg {
    font-size: 1rem;
    color: #666;
    line-height: 1.5;
  }

  /* Meta & Actions (Right Side) */
  .notif-meta {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-left: 30px;
  }

  .notif-time {
    font-size: 0.9rem;
    color: #999;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .delete-btn {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.1rem;
  }

  .delete-btn:hover {
    background: #fff0f1;
    color: #ff4757;
  }

  /* Empty/Loading State */
  .state-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #b2bec3;
  }

  .state-msg i {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .notif-header { padding: 15px 20px; }
    .notif-row { 
      padding: 20px; 
      flex-direction: column; 
      align-items: flex-start;
    }
    .notif-img-wrapper { margin-bottom: 15px; }
    .notif-meta { 
      margin-left: 0; 
      margin-top: 15px; 
      width: 100%; 
      justify-content: space-between; 
    }
  }
`;

export default function Notidfication() {
  const [notifications, setNotifications] = useState([]);
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
      return `${minutesDiff} min ago`;
    } else if (messageTime.toDateString() === now.toDateString()) {
      const options = { hour: "numeric", minute: "numeric" };
      return `Today, ${messageTime.toLocaleTimeString("en-US", options)}`;
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

  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="notif-page-wrapper">
      
      {/* --- Sticky Header --- */}
      <div className="notif-header">
        <div className="header-left">
          <h1>
            Notifications
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </h1>
        </div>
        <button className="back-btn" onClick={() => nav("/home")}>
          <i className="fa-solid fa-arrow-left"></i> Back to Home
        </button>
      </div>

      {/* --- Full Width List --- */}
      <div className="notif-list">
        {loading ? (
           <div className="state-msg">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Loading updates...</p>
           </div>
        ) : notifications.length > 0 ? (
          notifications.map((elem) => (
            <div 
              className="notif-row" 
              key={elem._id || Math.random()} 
            >
              {/* Image */}
              <div 
                className="notif-img-wrapper"
                onClick={(e) => handleProfileRedirect(e, elem.senderId)}
                title="View Profile"
              >
                {elem.image ? (
                    <img src={`${WEB_URL}${elem.image}`} alt="" className="notif-img" />
                ) : (
                    <img src="images/profile1.png" alt="" className="notif-img" />
                )}
              </div>
              
              {/* Content */}
              <div className="notif-content">
                <div className="notif-title">{elem.title}</div>
                <div className="notif-msg">{elem.msg}</div>
              </div>

              {/* Meta & Actions */}
              <div className="notif-meta">
                <div className="notif-time">
                  <i className="fa-regular fa-clock"></i> {formatTime(elem.date)}
                </div>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(elem._id)}
                  title="Remove"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="state-msg">
              <i className="fa-regular fa-bell-slash"></i>
              <p>You're all caught up! No new notifications.</p>
          </div>
        )}
      </div>

    </div>
  );
}