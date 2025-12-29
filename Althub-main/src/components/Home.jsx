import React, { useEffect, useState, useCallback, useMemo } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import EditEducationModal from "./EditEducationModal";
import ProtectedImage from "../ProtectedImage";
import "../styles/Home.css"; // <--- Import CSS

// MUI Imports
import {
  Grid, Box, Card, Typography, Avatar, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Button, TextField, IconButton, Container,
  LinearProgress, Alert, AlertTitle
} from "@mui/material";

// Icons
import {
  Person, Event, VolunteerActivism, Feedback as FeedbackIcon, 
  Logout as LogoutIcon, Image as ImageIcon, Favorite, FavoriteBorder,
  CalendarMonth, MonetizationOn, School
} from "@mui/icons-material";

export default function Home({ socket }) {
  const settings = { dots: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false, lazyLoad: 'ondemand' };
  const nav = useNavigate();
  
  // State
  const [user, setUser] = useState({});
  const [post, setPost] = useState([]);
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState([]);
  const [aids, setAids] = useState([]);
  const [fileList, setFileList] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hasEducation, setHasEducation] = useState(true);
  const [showEduModal, setShowEduModal] = useState(false);
  
  const userid = localStorage.getItem("Althub_Id");
  const token = localStorage.getItem("Althub_Token");
  const emptyEducationList = useMemo(() => [], []);

  // Image Compression & Helpers
  const compressImage = async (file) => {
    if (file.type.startsWith('video')) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const scaleSize = MAX_WIDTH / img.width;
          if (scaleSize < 1) { canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; }
          else { canvas.width = img.width; canvas.height = img.height; }
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.canvas.toBlob((blob) => {
            const newFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(newFile);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const isVideo = (urlOrFile) => {
    if (urlOrFile instanceof File) return urlOrFile.type.startsWith("video/");
    if (typeof urlOrFile === "string") {
      const lowerUrl = urlOrFile.toLowerCase();
      if (lowerUrl.includes("mime=video")) return true;
      const videoExts = [".mp4", ".webm", ".ogg", ".mov", ".mkv"];
      return videoExts.some((ext) => lowerUrl.endsWith(ext));
    }
    return false;
  };

  // Data Fetching
  const getUser = useCallback(() => {
    if (userid) axios.get(`${WEB_URL}/api/searchUserById/${userid}`).then((res) => { if (res.data?.data) setUser(res.data.data[0]); });
  }, [userid]);

  const checkEducation = useCallback(() => {
    if (userid) axios.post(`${WEB_URL}/api/getEducation`, { userid }).then((res) => setHasEducation(res.data.data?.length > 0));
  }, [userid]);

  useEffect(() => { 
    getUser(); 
    checkEducation();
    axios.get(`${WEB_URL}/api/getPost`).then((res) => setPost(res.data.data));
    axios.get(`${WEB_URL}/api/getEvents`).then((res) => setEvents(res.data.data));
    axios.get(`${WEB_URL}/api/getFinancialAid`).then((res) => setAids(res.data.data));
  }, [getUser, checkEducation]);

  // Handlers
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].size > 20 * 1024 * 1024) { toast.error("File too large"); return; }
      setFileList(files);
    }
  };

  const addPost = async () => {
    if ((!description.trim()) && (!fileList)) { toast.error("Empty post!"); return; }
    setUploading(true);
    var body = new FormData();
    body.append("userid", userid);
    body.append("description", description);
    body.append("date", new Date().toISOString());
    body.append("fname", user.fname);
    body.append("lname", user.lname);
    body.append("profilepic", user.profilepic || "");
    if (fileList) {
      const compressedFiles = await Promise.all(Array.from(fileList).map(f => compressImage(f)));
      compressedFiles.forEach(f => body.append(`photos`, f, f.name));
    }
    axios.post(`${WEB_URL}/api/addPost`, body, { headers: { "Content-type": "multipart/form-data" } }).then(() => {
      toast.success("Posted!"); setFileList(null); setDescription(""); setUploading(false);
      axios.get(`${WEB_URL}/api/getPost`).then((res) => setPost(res.data.data));
    }).catch(() => { toast.error("Failed"); setUploading(false); });
  };

  const handleLike = (elem) => {
    axios.put(`${WEB_URL}/api/like/${elem._id}`, { userId: userid }).then((res) => {
      if (userid !== elem.userid && res.data.msg === "Like") socket.emit("sendNotification", { receiverid: elem.userid, title: "New Like", msg: `${user.fname} Liked Your Post` });
      axios.get(`${WEB_URL}/api/getPost`).then((r) => setPost(r.data.data));
    });
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) > now).slice(0, 3);

  return (
    <div className="home-wrapper">
      <Container maxWidth="xl" className="home-container">
        <Grid container spacing={3} justifyContent="center">
          
          {/* --- LEFT SIDEBAR --- */}
          <Grid item md={3} lg={2.5} className="sidebar-left">
            <div className="profile-mini-card">
              <div className="profile-bg"></div>
              <div className="profile-avatar-wrapper">
                <Avatar src={user.profilepic ? `${WEB_URL}${user.profilepic}` : ""} className="profile-avatar" />
              </div>
              <div className="profile-info">
                <Typography variant="h6" className="profile-name">{user.fname} {user.lname}</Typography>
                <Typography variant="body2" className="profile-role">{user.designation || "Student"}</Typography>
              </div>
            </div>

            <div className="menu-box">
              <List disablePadding>
                <ListItem button onClick={() => nav("/view-profile")} className="menu-list-item">
                  <ListItemIcon><Person /></ListItemIcon> <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={() => nav("/events")} className="menu-list-item">
                  <ListItemIcon><Event /></ListItemIcon> <ListItemText primary="Events" />
                </ListItem>
                <ListItem button onClick={() => nav("/scholarship")} className="menu-list-item">
                  <ListItemIcon><VolunteerActivism /></ListItemIcon> <ListItemText primary="Scholarship" />
                </ListItem>
                <ListItem button onClick={() => nav("/feedback")} className="menu-list-item">
                  <ListItemIcon><FeedbackIcon /></ListItemIcon> <ListItemText primary="Feedback" />
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem button onClick={() => { localStorage.clear(); nav("/"); }} className="menu-list-item menu-list-item-logout">
                  <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon> <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </div>
          </Grid>

          {/* --- CENTER FEED --- */}
          <Grid item xs={12} md={6} lg={6}>
            {!hasEducation && (
              <Alert severity="warning" className="education-alert"
                action={<Button color="inherit" size="small" onClick={() => setShowEduModal(true)}>ADD</Button>}
              >
                <AlertTitle>Complete Profile</AlertTitle>
                Add education details to connect better.
              </Alert>
            )}

            {/* Create Post */}
            <div className="create-post-card">
              <div className="cp-input-area">
                <Avatar src={user.profilepic ? `${WEB_URL}${user.profilepic}` : ""} />
                <TextField 
                  fullWidth 
                  placeholder={`What's on your mind, ${user.fname}?`} 
                  variant="outlined" 
                  size="small" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="cp-textfield"
                />
              </div>
              
              {fileList && (
                <div className="preview-grid">
                  {Array.from(fileList).map((file, i) => (
                    isVideo(file) 
                      ? <video key={i} src={URL.createObjectURL(file)} className="preview-media" muted />
                      : <img key={i} src={URL.createObjectURL(file)} alt="" className="preview-media" />
                  ))}
                </div>
              )}

              <div className="cp-actions">
                <Button component="label" startIcon={<ImageIcon sx={{ color: '#66bd9e' }} />} sx={{ color: '#555', textTransform: 'none' }}>
                  Media <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
                </Button>
                <Button variant="contained" color="primary" onClick={addPost} disabled={uploading}>
                  {uploading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>

            {/* Posts Feed */}
            {post.map((elem) => (
              <div key={elem._id} className="post-card">
                <div className="post-header">
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Avatar 
                        src={elem.profilepic ? `${WEB_URL}${elem.profilepic}` : ""} 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => nav(elem.userid === userid ? "/view-profile" : "/view-search-profile", { state: { id: elem.userid } })}
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontWeight="700">{elem.fname} {elem.lname}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(elem.date).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </div>

                <div className="post-content">{elem.description}</div>

                {elem.photos.length > 0 && (
                  <div className="post-media-container">
                    <Slider {...settings}>
                      {elem.photos.map((photo, idx) => (
                        <div key={idx}>
                          {isVideo(photo) ? (
                            <video src={`${WEB_URL}${photo}?token=${token}`} className="post-media-item" controls />
                          ) : (
                            <ProtectedImage imgSrc={photo} className="post-media-item" defaultImage="images/error-page-pattern.png" />
                          )}
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}

                <div className="post-actions">
                  <IconButton onClick={() => handleLike(elem)} color={elem.likes.includes(userid) ? "error" : "default"}>
                    {elem.likes.includes(userid) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <Typography variant="body2" fontWeight="600">{elem.likes.length} Likes</Typography>
                </div>
              </div>
            ))}
          </Grid>

          {/* --- RIGHT SIDEBAR --- */}
          <Grid item md={3} lg={3} className="sidebar-right">
            <div className="widget-card">
              <div className="widget-title"><CalendarMonth sx={{ color: '#66bd9e' }} /> Upcoming Events</div>
              {upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
                <div key={evt._id} className="event-item">
                  <ProtectedImage imgSrc={evt.photos?.[0]} defaultImage="images/event1.png" className="event-thumb" />
                  <div className="event-info">
                    <Typography variant="subtitle2" noWrap>{evt.title}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{new Date(evt.date).toLocaleDateString()}</Typography>
                  </div>
                </div>
              )) : <Typography variant="body2" color="text.secondary">No upcoming events</Typography>}
            </div>

            {aids.length > 0 && (
              <div className="widget-card">
                <div className="widget-title"><MonetizationOn sx={{ color: '#66bd9e' }} /> Scholarships</div>
                {aids.slice(0, 3).map(aid => (
                  <div key={aid._id} className="aid-item">
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar variant="rounded" src={aid.image ? `${WEB_URL}${aid.image}` : ""} />
                      <Box flex={1}>
                        <Typography variant="subtitle2">{aid.name}</Typography>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption">₹{aid.claimed}</Typography>
                          <Typography variant="caption">Target: ₹{aid.aid}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={(Number(aid.claimed)/Number(aid.aid))*100} className="aid-progress-bar" />
                  </div>
                ))}
              </div>
            )}
          </Grid>

        </Grid>
      </Container>

      {showEduModal && <EditEducationModal closeModal={() => setShowEduModal(false)} education={emptyEducationList} getEducation={checkEducation} modal="Add" />}
    </div>
  );
}