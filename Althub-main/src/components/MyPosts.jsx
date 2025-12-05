import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";

// Standard Modal Style matched to your CSS theme
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "16px",
  outline: "none",
};

export default function MyPosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [topUsers, setTopUsers] = useState([]); // Sidebar Data
  const userid = localStorage.getItem("Althub_Id");

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

  // --- 1. Fetch User Data ---
  const getUser = useCallback(() => {
    if (!userid) return;
    axios({
      method: "get",
      url: `${WEB_URL}/api/searchUserById/${userid}`,
    }).then((Response) => {
      if (Response.data && Response.data.data && Response.data.data[0]) {
        setUser(Response.data.data[0]);
      }
    });
  }, [userid]);

  // --- 2. Fetch My Posts ---
  const getMyPosts = useCallback(() => {
    axios({
      method: "get",
      url: `${WEB_URL}/api/getPostById/${userid}`,
    })
      .then((Response) => {
        setPosts(Response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching my posts:", error);
      });
  }, [userid]);

  // --- 3. Fetch Sidebar Users (People you may know) ---
  const getNewUsers = useCallback(() => {
    if (userid) {
      axios({
        url: `${WEB_URL}/api/getRandomUsers`,
        method: "post",
        data: { userid: userid },
      })
        .then((Response) => {
          setTopUsers(Response.data.data);
        })
        .catch((err) => console.error(err));
    }
  }, [userid]);

  useEffect(() => {
    getUser();
    getMyPosts();
    getNewUsers();
  }, [getUser, getMyPosts, getNewUsers]);

  // --- DELETE POST ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      axios.delete(`${WEB_URL}/api/deletePost/${id}`)
        .then(() => {
          toast.success("Post deleted successfully");
          getMyPosts();
        })
        .catch(() => toast.error("Failed to delete post"));
    }
  };

  // --- EDIT HANDLERS ---
  const handleOpenEdit = (post) => {
    setEditId(post._id);
    setEditDesc(post.description);
    setEditImages(post.photos || []);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const removeImage = (indexToRemove) => {
    setEditImages(editImages.filter((_, index) => index !== indexToRemove));
  };

  const saveEdit = () => {
    const formData = new FormData();
    formData.append("id", editId);
    formData.append("description", editDesc);
    editImages.forEach(img => {
        formData.append("existingPhotos", img);
    });

    axios({
      method: "post",
      url: `${WEB_URL}/api/editPost`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        toast.success("Post updated!");
        handleClose();
        getMyPosts();
      })
      .catch((err) => toast.error("Update failed"));
  };

  const formatPostTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    return messageTime.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <div className="container">
      {/* --- LEFT SIDE: MAIN POST FEED --- */}
      <div className="profile-main">
        
        {/* Header Card (Matches Profile Header Style) */}
        <div className="profile-container" style={{ marginBottom: "20px", padding: "0" }}>
            <div className="profile-container-inner1" style={{ alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', color: '#2c3e50' }}>My Posts</h1>
                    <p style={{ color: '#6b7280' }}>Manage your shared content</p>
                </div>
                <div style={{ background: '#e0f2ec', padding: '10px 20px', borderRadius: '12px', color: '#4da385', fontWeight: '600' }}>
                    {posts.length} Posts
                </div>
            </div>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          posts.map((elem) => (
            <div key={elem._id} className="post">
              <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="post-profile">
                  <img
                    src={user?.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"}
                    alt=""
                    className="post-profile-img"
                  />
                  <div className="post-info">
                    <span className="post-name">{user.fname} {user.lname}</span>
                    <span className="post-description">{formatPostTime(elem.date)}</span>
                  </div>
                </div>

                {/* Modern Edit/Delete Icons */}
                <div className="edit-icon" style={{ gap: '10px', marginTop: '0' }}>
                    <i 
                        className="fa-solid fa-pen-to-square" 
                        title="Edit Post"
                        onClick={() => handleOpenEdit(elem)}
                        style={{ background: '#f3f4f6', color: '#66bd9e' }}
                    ></i> <br></br>
                    <i 
                        className="fa-solid fa-trash" 
                        title="Delete Post"
                        onClick={() => handleDelete(elem._id)}
                        style={{ background: '#fee2e2', color: '#ef4444' }}
                    ></i>
                </div>
              </div>

              <div className="post-message" style={{ whiteSpace: "pre-wrap" }}>{elem.description}</div>
              
              {elem.photos.length > 0 && (
                <div className="post-images">
                  <Slider {...settings}>
                    {elem.photos.map((el, idx) => (
                      <div key={idx} style={{ outline: 'none' }}>
                          <img src={`${WEB_URL}${el}`} alt="" className="post-image" />
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

              <div className="likebar">
                 <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i> 
                 <span style={{ marginLeft: "8px", fontSize: "14px", fontWeight: "500", color: "#555" }}>
                    {elem.likes.length} Likes
                 </span>
              </div>
            </div>
          ))
        ) : (
          <div className="profile-description" style={{ textAlign: "center", padding: "50px" }}>
             <i className="fa-regular fa-folder-open" style={{ fontSize: "40px", color: "#ccc", marginBottom: "15px" }}></i>
             <h3 style={{ color: "#777" }}>You haven't posted anything yet.</h3>
          </div>
        )}
      </div>

      {/* --- RIGHT SIDE: SIDEBAR (Matches ViewProfile) --- */}
      <div className="profile-sidebar">
          <div className="sidebar-people">
            <h3>People you may know</h3>
            {topUsers.length > 0 ? (
              topUsers.map((elem) => (
                <div key={elem._id}>
                  <div className="sidebar-people-row">
                    {elem.profilepic ? (
                        <img src={`${WEB_URL}${elem.profilepic}`} alt="" />
                    ) : (
                        <img src="images/profile1.png" alt="" />
                    )}
                    <div>
                      <h2>{elem.fname} {elem.lname}</h2>
                      <p>{elem.city} {elem.state}</p>
                      <a onClick={() => nav("/view-search-profile", { state: { id: elem._id } })}>
                        View Profile
                      </a>
                    </div>
                  </div>
                  <hr />
                </div>
              ))
            ) : (
              <div style={{ padding: "10px", color: "#666", fontSize: "14px" }}>No suggestions available</div>
            )}
          </div>
      </div>

      {/* --- EDIT MODAL --- */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>Edit Post</h2>
            <i className="fa-solid fa-xmark" onClick={handleClose} style={{ cursor: "pointer", fontSize: "20px", color: "gray" }}></i>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#666" }}>Description</label>
            <textarea 
              rows="4" 
              className="txt-feedback" // Reusing your style.css class for consistency
              style={{ width: "100%", margin: "0", borderColor: "#e5e7eb" }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
             <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#666" }}>Manage Images</label>
             <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {editImages.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "70px", height: "70px" }}>
                        <img 
                            src={`${WEB_URL}${img}`} 
                            alt="post-content" 
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} 
                        />
                        <div 
                            onClick={() => removeImage(idx)}
                            style={{
                                position: "absolute", top: "-6px", right: "-6px", 
                                background: "#ef4444", color: "white", borderRadius: "50%", 
                                width: "20px", height: "20px", display: "flex", 
                                alignItems: "center", justifyContent: "center", 
                                cursor: "pointer", fontSize: "10px", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </div>
                ))}
                {editImages.length === 0 && <span style={{ fontSize: "13px", color: "gray", fontStyle: "italic" }}>No images to show.</span>}
             </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="action-button-cancel" style={{width: 'auto'}} onClick={handleClose}>Cancel</button>
            <button className="action-button" style={{width: 'auto'}} onClick={saveEdit}>Save Changes</button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}