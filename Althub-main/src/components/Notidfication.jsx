import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";
import ProtectedImage from "../ProtectedImage";

// --- INJECTED STYLES FOR CONSISTENT FULL-WIDTH UI ---
const styles = `
  /* --- Page Layout --- */
  .notif-page-wrapper {
    background-color: #f3f2ef; /* Matching Home/Scholarship bg */
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Poppins', sans-serif;
  }

  .notif-container {
    width: 98%;
    max-width: 1920px; /* Consistent max-width with Home */
    margin: 0 auto;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* --- Header Section --- */
  .notif-header-card {
    background: #fff;
    padding: 25px 40px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid #66bd9e; /* Theme Accent */
    border: 1px solid #eee;
  }

  .header-title h2 {
    font-size: 1.6rem;
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
    font-size: 0.9rem;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    vertical-align: middle;
  }

  .back-btn {
    padding: 10px 24px;
    background: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 30px;
    color: #555;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn:hover {
    background: #e9ecef;
    color: #333;
    transform: translateX(-3px);
  }

  /* --- Notification List Container --- */
  .notif-list {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Gap between rows */
  }

  /* --- Notification Bar (Row) --- */
  .notif-row {
    background: #fff;
    border-radius: 12px;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    border: 1px solid #eee;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
    cursor: default;
  }

  .notif-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border-color: #66bd9e;
  }

  /* Image Section */
  .notif-img-wrapper {
    flex-shrink: 0;
    margin-right: 25px;
    cursor: pointer;
  }

  .notif-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
  }

  /* Content */
  .notif-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .notif-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .notif-msg {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.4;
  }

  /* Meta & Actions */
  .notif-meta {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-left: 30px;
  }

  .notif-time {
    font-size: 0.85rem;
    color: #999;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .delete-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #fff0f1;
    color: #ff4757;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
  }

  .delete-btn:hover {
    background: #ff4757;
    color: #fff;
    transform: scale(1.1);
  }

  /* Empty/Loading State */
  .state-msg {
    text-align: center;
    padding: 60px;
    background: #fff;
    border-radius: 12px;
    color: #999;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  }

  .state-msg i {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
    display: block;
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .notif-row { 
      flex-direction: column; 
      align-items: flex-start;
      padding: 20px;
    }
    .notif-img-wrapper { margin-bottom: 15px; }
    .notif-meta { 
      margin-left: 0; 
      margin-top: 15px; 
      width: 100%; 
      justify-content: space-between; 
    }
    .notif-container { width: 100%; padding: 10px; }
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
  }, []);

  return (
    <div className="notif-page-wrapper">
      <div className="notif-container">
        
        {/* --- Header Card --- */}
        <div className="notif-header-card">
          <div className="header-title">
            <h2>
              Notifications
              {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
            </h2>
          </div>
          <button className="back-btn" onClick={() => nav("/home")}>
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </div>

        {/* --- Notification List --- */}
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
                  <ProtectedImage 
                    imgSrc={elem.image} 
                    defaultImage="images/profile1.png" 
                    className="notif-img" 
                    alt="sender"
                  />
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
                <p>You have no new notifications.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}