import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import "../styles/MyPosts.css"; // <--- Import CSS

// MUI Imports
import {
  Container, Grid, Card, CardHeader, CardContent, Typography, 
  Avatar, IconButton, Box, Button, Modal, TextField, Chip, Divider
} from "@mui/material";

// Icons
import {
  Edit, Delete, Favorite, Close, FolderOpen
} from "@mui/icons-material";

export default function MyPosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const userid = localStorage.getItem("Althub_Id");
  const token = localStorage.getItem("Althub_Token");

  // Edit State
  const [open, setOpen] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [editId, setEditId] = useState("");

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  // --- Helpers ---
  const isVideo = (url) => {
    if (typeof url === "string") {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("mime=video")) return true;
      const videoExts = [".mp4", ".webm", ".ogg", ".mov", ".mkv"];
      return videoExts.some((ext) => lowerUrl.endsWith(ext));
    }
    return false;
  };

  const formatPostTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // --- Data Fetching ---
  const fetchData = useCallback(() => {
    if (!userid) return;
    
    // User Profile
    axios.get(`${WEB_URL}/api/searchUserById/${userid}`).then((res) => {
      if (res.data?.data) setUser(res.data.data[0]);
    });

    // My Posts
    axios.get(`${WEB_URL}/api/getPostById/${userid}`).then((res) => {
      setPosts(res.data.data);
    }).catch(console.error);

    // Suggestions
    axios.post(`${WEB_URL}/api/getRandomUsers`, { userid }).then((res) => {
      setTopUsers(res.data.data);
    }).catch(console.error);

  }, [userid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Handlers ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      axios.delete(`${WEB_URL}/api/deletePost/${id}`)
        .then(() => { toast.success("Post deleted"); fetchData(); })
        .catch(() => toast.error("Failed to delete"));
    }
  };

  const handleOpenEdit = (post) => {
    setEditId(post._id);
    setEditDesc(post.description);
    setEditImages(post.photos || []);
    setOpen(true);
  };

  const saveEdit = () => {
    const formData = new FormData();
    formData.append("id", editId);
    formData.append("description", editDesc);
    editImages.forEach(img => formData.append("existingPhotos", img));

    axios.post(`${WEB_URL}/api/editPost`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => { toast.success("Updated!"); setOpen(false); fetchData(); })
      .catch(() => toast.error("Update failed"));
  };

  return (
    <div className="mp-wrapper">
      <Container maxWidth="xl" className="mp-container">
        <Grid container spacing={3} justifyContent="center">
          
          {/* --- LEFT: POST FEED --- */}
          <Grid item xs={12} lg={7}>
            <Box className="mp-header-card">
                <div>
                    <Typography variant="h5" className="mp-title">My Posts</Typography>
                    <Typography className="mp-subtitle">Manage your shared moments</Typography>
                </div>
                <Chip label={`${posts.length} Posts`} className="mp-badge" />
            </Box>

            {posts.length > 0 ? (
              posts.map((elem) => (
                <Card key={elem._id} className="mp-post-card">
                  <CardHeader
                    avatar={
                        <Avatar src={user.profilepic ? `${WEB_URL}${user.profilepic}` : ""} className="mp-post-avatar" />
                    }
                    action={
                        <div className="mp-post-actions">
                            <IconButton size="small" className="mp-action-btn" onClick={() => handleOpenEdit(elem)}>
                                <Edit fontSize="small" color="primary" />
                            </IconButton>
                            <IconButton size="small" className="mp-action-btn mp-delete-btn" onClick={() => handleDelete(elem._id)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    }
                    title={<Typography className="mp-post-name">{user.fname} {user.lname}</Typography>}
                    subheader={<Typography className="mp-post-date">{formatPostTime(elem.date)}</Typography>}
                    className="mp-post-header"
                  />
                  
                  <div className="mp-post-content">{elem.description}</div>

                  {elem.photos.length > 0 && (
                    <div className="mp-media-container">
                      <Slider {...settings}>
                        {elem.photos.map((el, idx) => (
                          <div key={idx} style={{ outline: 'none' }}>
                            {isVideo(el) ? (
                                <video src={`${WEB_URL}${el}${el.includes('?') ? '&' : '?'}token=${token}`} className="mp-media-item" controls />
                            ) : (
                                <ProtectedImage imgSrc={el} className="mp-media-item" defaultImage="images/cover-pattern.png" />
                            )}
                          </div>
                        ))}
                      </Slider>
                    </div>
                  )}

                  <div className="mp-post-footer">
                    <Favorite sx={{ color: "#ef4444" }} fontSize="small" />
                    <span>{elem.likes.length} Likes</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="mp-no-posts">
                <FolderOpen className="mp-empty-icon" />
                <Typography variant="h6" color="textSecondary">No posts yet</Typography>
              </div>
            )}
          </Grid>

          {/* --- RIGHT: SIDEBAR --- */}
          <Grid item lg={3.5} className="mp-sidebar">
            <Card className="mp-widget-card">
                <Typography variant="h6" className="mp-widget-title">People you may know</Typography>
                {topUsers.length > 0 ? topUsers.map((u) => (
                    <div key={u._id} className="mp-suggestion-item">
                        <Avatar src={u.profilepic ? `${WEB_URL}${u.profilepic}` : ""} sx={{ width: 45, height: 45, mr: 2 }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600}>{u.fname} {u.lname}</Typography>
                            <Typography variant="caption" color="textSecondary">{u.city || "Student"}</Typography>
                        </Box>
                        <Button size="small" className="mp-view-btn" onClick={() => nav("/view-search-profile", { state: { id: u._id } })}>
                            View
                        </Button>
                    </div>
                )) : <Typography variant="body2" color="textSecondary">No new suggestions</Typography>}
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* --- EDIT MODAL --- */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="mp-modal-box">
            <div className="mp-modal-header">
                <Typography variant="h5" fontWeight={700}>Edit Post</Typography>
                <IconButton onClick={() => setOpen(false)}><Close /></IconButton>
            </div>
            
            <TextField
                fullWidth multiline rows={4} label="Description" variant="outlined"
                value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Manage Images</Typography>
            <div className="mp-img-preview-container">
                {editImages.map((img, idx) => (
                    <div key={idx} className="mp-img-preview-wrapper">
                        <ProtectedImage imgSrc={img} className="mp-img-preview" />
                        <IconButton 
                            size="small" className="mp-remove-btn"
                            onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    </div>
                ))}
                {editImages.length === 0 && <Typography variant="caption" color="textSecondary">No images attached.</Typography>}
            </div>

            <div className="mp-modal-actions">
                <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: '#66bd9e', '&:hover': { bgcolor: '#479378' } }}>Save Changes</Button>
            </div>
        </Box>
      </Modal>
    </div>
  );
}