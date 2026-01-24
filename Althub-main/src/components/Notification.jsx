import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";
import ProtectedImage from "../ProtectedImage";
import { toast } from "react-toastify";
import { 
  ArrowLeft, Clock, Trash2, Bell, BellOff, Loader2, 
  Heart, UserPlus, Calendar, MessageSquare, AlertTriangle 
} from "lucide-react"; 
import "../styles/Notification.css"; 

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null); // Tracks which ID to delete
  const nav = useNavigate();
  const userid = localStorage.getItem("Althub_Id");

  const getNotifications = () => {
    axios.post(`${WEB_URL}/api/getnotifications`, { userid })
      .then((res) => {
        if (res.data?.data) {
          const allowed = ["New Follower", "New Like", "New Event", "New Message"];
          setNotifications(res.data.data.filter(item => allowed.includes(item.title)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // 1. Opens the modal
  const promptDelete = (id) => {
    setDeleteId(id);
  };

  // 2. Cancels the action
  const cancelDelete = () => {
    setDeleteId(null);
  };

  // 3. Performs the actual delete
  const confirmDelete = () => {
    if (!deleteId) return;
    
    axios.post(`${WEB_URL}/api/deleteNotification`, { notificationId: deleteId })
      .then((res) => {
        if (res.data.success) {
          setNotifications(prev => prev.filter(item => item._id !== deleteId));
          toast.success("Notification removed");
          setDeleteId(null); // Close modal
        }
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const handleProfileRedirect = (id) => {
    if (id) nav(`/view-profile/${id}`); 
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor(Math.abs(now - date) / 60000); 

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (title) => {
    switch(title) {
      case "New Like": return <div className="notif-type-icon bg-pink-500"><Heart size={12} fill="white" /></div>;
      case "New Follower": return <div className="notif-type-icon bg-brand-500"><UserPlus size={12} /></div>;
      case "New Event": return <div className="notif-type-icon bg-orange-500"><Calendar size={12} /></div>;
      case "New Message": return <div className="notif-type-icon bg-indigo-500"><MessageSquare size={12} /></div>;
      default: return <div className="notif-type-icon bg-slate-500"><Bell size={12} /></div>;
    }
  };

  useEffect(() => { getNotifications(); }, []);

  return (
    <div className="notif-wrapper">
      <div className="notif-container">
        
        {/* Header */}
        <div className="notif-header">
          <div className="notif-title-group">
            <h1 className="notif-title">Notifications</h1>
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </div>
          <button onClick={() => nav("/home")} className="back-btn">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>

        {/* Content Card */}
        <div className="notif-card">
          {loading ? (
            <div className="empty-state">
                <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-6" />
                <p>Loading your updates...</p>
            </div>
          ) : notifications.length > 0 ? (
            <ul>
              {notifications.map((elem, index) => (
                <li key={elem._id || index} className="notif-item group">
                  
                  {/* Avatar */}
                  <div className="notif-avatar-box" onClick={() => handleProfileRedirect(elem.senderId)}>
                    <div className="notif-avatar overflow-hidden">
                       <ProtectedImage 
                         imgSrc={elem.image} 
                         defaultImage="images/profile1.png" 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                       />
                    </div>
                    {getNotificationIcon(elem.title)}
                  </div>
                  
                  {/* Content */}
                  <div className="notif-content">
                    <p className="notif-main-text">{elem.title}</p>
                    <p className="notif-sub-text">{elem.msg}</p>
                  </div>

                  {/* Meta */}
                  <div className="notif-meta">
                    <span className="notif-time">
                      <Clock size={14} /> {formatTime(elem.date)}
                    </span>
                    <button 
                        onClick={() => promptDelete(elem._id)} // CHANGED: Calls promptDelete
                        className="delete-btn"
                        title="Delete"
                    >
                        <Trash2 size={20} />
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
                <div className="empty-icon-box">
                    <BellOff className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No new notifications</h3>
                <p className="text-base text-slate-500 max-w-sm">
                  You're all caught up! Check back later for updates on likes, followers, and events.
                </p>
            </div>
          )}
        </div>

      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box animate-fade-in-up">
            <div className="modal-icon-box">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="modal-title">Delete Notification?</h3>
            <p className="modal-text">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-confirm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}