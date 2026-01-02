import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";
import ProtectedImage from "../ProtectedImage";
import { toast } from "react-toastify";
import "../styles/Notification.css"; // <--- Import CSS

// MUI Imports
import {
  Container, Box, Typography, Button, IconButton, 
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Avatar, CircularProgress, Paper, Divider
} from "@mui/material";

import {
  ArrowBack, AccessTime, DeleteOutline, NotificationsOff, NotificationsActive
} from "@mui/icons-material";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = (id) => {
    if(!window.confirm("Delete this notification?")) return;
    axios.post(`${WEB_URL}/api/deleteNotification`, { notificationId: id })
      .then((res) => {
        if (res.data.success) {
          setNotifications(prev => prev.filter(item => item._id !== id));
          toast.success("Removed");
        }
      });
  };

  const handleProfileRedirect = (id) => {
    if (id) nav(`/view-profile/${id}`); // Assuming you have dynamic routing or handle state
    // Note: Your original code passed state via nav, update this if needed based on your routing logic
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor(Math.abs(now - date) / 60000); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (date.toDateString() === now.toDateString()) return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    return date.toLocaleDateString();
  };

  useEffect(() => { getNotifications(); }, []);

  return (
    <div className="notif-wrapper">
      <Container maxWidth="md" className="notif-container">
        
        {/* Header */}
        <Box className="notif-header-card">
          <div className="notif-title-group">
            <Typography className="notif-page-title">Notifications</Typography>
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </div>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => nav("/home")}
            className="notif-back-btn"
            variant="outlined"
          >
            Back to Home
          </Button>
        </Box>

        {/* Content */}
        <Paper className="notif-card">
          {loading ? (
            <div className="state-box">
                <CircularProgress size={40} sx={{ color: '#66bd9e', mb: 2 }} />
                <Typography>Loading updates...</Typography>
            </div>
          ) : notifications.length > 0 ? (
            <List disablePadding>
              {notifications.map((elem, index) => (
                <React.Fragment key={elem._id || index}>
                  <ListItem className="notif-list-item" alignItems="flex-start">
                    <ListItemAvatar onClick={() => handleProfileRedirect(elem.senderId)} sx={{ cursor: 'pointer' }}>
                      <Avatar className="notif-avatar">
                        <ProtectedImage imgSrc={elem.image} defaultImage="images/profile1.png" style={{width:'100%', height:'100%'}} />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText 
                      primary={<Typography className="notif-primary-text">{elem.title}</Typography>}
                      secondary={<Typography className="notif-secondary-text">{elem.msg}</Typography>}
                    />

                    <Box className="notif-meta-group">
                        <div className="notif-time">
                            <AccessTime fontSize="small" /> {formatTime(elem.date)}
                        </div>
                        <IconButton 
                            onClick={() => handleDelete(elem._id)} 
                            className="notif-delete-btn"
                            size="small"
                        >
                            <DeleteOutline />
                        </IconButton>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <div className="state-box">
                <NotificationsOff className="state-icon" />
                <Typography variant="h6" color="textSecondary">No new notifications</Typography>
                <Typography variant="body2" color="textSecondary">We'll let you know when something happens.</Typography>
            </div>
          )}
        </Paper>

      </Container>
    </div>
  );
}