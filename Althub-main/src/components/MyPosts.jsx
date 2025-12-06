import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";

// --- INJECTED STYLES FOR MODERN UI ---
const styles = `
  .myposts-wrapper {
    background-color: #f3f2ef;
    min-height: 100vh;
    padding: 30px 0;
    font-family: 'Poppins', sans-serif;
  }

  .myposts-content {
    display: flex;
    justify-content: center;
    gap: 30px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    align-items: flex-start;
  }

  /* --- LEFT FEED SECTION --- */
  .myposts-feed {
    flex: 1;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Header Card */
  .myposts-header-card {
    background: #fff;
    border-radius: 16px;
    padding: 25px 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid #66bd9e;
  }

  .header-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3436;
    margin: 0 0 5px 0;
  }

  .header-info p {
    color: #636e72;
    margin: 0;
    font-size: 0.9rem;
  }

  .post-count-badge {
    background: #e3fdf5;
    color: #66bd9e;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  /* Post Card */
  .post-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    overflow: hidden;
    padding-bottom: 15px;
    position: relative;
  }

  .post-header {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .post-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .post-user-img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
  }

  .post-meta h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .post-meta span {
    font-size: 0.75rem;
    color: #999;
  }

  /* Action Buttons (Edit/Delete) */
  .post-actions-top {
    display: flex;
    gap: 10px;
  }

  .action-icon-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 0.9rem;
  }

  .btn-edit { background: #f0f9f6; color: #66bd9e; }
  .btn-edit:hover { background: #66bd9e; color: #fff; }

  .btn-delete { background: #fff0f1; color: #ff4757; }
  .btn-delete:hover { background: #ff4757; color: #fff; }

  /* Post Body */
  .post-desc {
    padding: 0 20px 15px;
    font-size: 0.95rem;
    color: #444;
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .post-media-container {
    margin-bottom: 15px;
    background: #f8f9fa;
  }

  .post-img {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    display: block;
    margin: 0 auto;
  }

  .post-footer {
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #555;
  }

  /* --- RIGHT SIDEBAR --- */
  .myposts-sidebar {
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: sticky;
    top: 90px;
  }

  .sidebar-widget {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
  }

  .suggestion-img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
  }

  .suggestion-info {
    flex: 1;
  }

  .suggestion-info h5 {
    margin: 0;
    font-size: 0.95rem;
    color: #333;
  }

  .suggestion-info p {
    margin: 0;
    font-size: 0.8rem;
    color: #888;
  }

  .suggestion-link {
    font-size: 0.8rem;
    color: #66bd9e;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .suggestion-link:hover { text-decoration: underline; }

  /* Empty State */
  .no-posts {
    text-align: center;
    padding: 60px;
    background: #fff;
    border-radius: 16px;
    color: #999;
  }

  .no-posts i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #eee;
  }

  /* --- MODAL STYLES --- */
  .modal-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    background-color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    padding: 25px;
    border-radius: 16px;
    outline: none;
    font-family: 'Poppins', sans-serif;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .modal-title { font-size: 1.2rem; font-weight: 600; color: #333; }
  
  .modal-close { cursor: pointer; color: #888; font-size: 1.2rem; transition: color 0.2s; }
  .modal-close:hover { color: #333; }

  .modal-input-group { margin-bottom: 20px; }
  .modal-label { display: block; font-size: 0.85rem; font-weight: 600; color: #66bd9e; margin-bottom: 8px; }
  
  .modal-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    background: #fafafa;
  }
  .modal-textarea:focus { border-color: #66bd9e; background: #fff; }

  .modal-imgs { display: flex; gap: 10px; flex-wrap: wrap; }
  .modal-img-wrapper { position: relative; width: 70px; height: 70px; }
  .modal-img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
  .modal-remove-img {
    position: absolute;
    top: -5px; right: -5px;
    background: #ff4757; color: #fff;
    border-radius: 50%;
    width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
  
  .btn-modal { padding: 8px 20px; border-radius: 20px; font-weight: 500; cursor: pointer; border: none; font-size: 0.9rem; }
  .btn-cancel { background: #f1f2f6; color: #555; }
  .btn-save { background: #66bd9e; color: #fff; }
  .btn-save:hover { background: #479378; }

  /* Responsive */
  @media (max-width: 900px) {
    .home-content { flex-direction: column; }
    .myposts-sidebar { display: none; }
    .myposts-feed { width: 100%; max-width: 100%; }
    .modal-box { width: 90%; }
  }
`;

export default function MyPosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [topUsers, setTopUsers] = useState([]);
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

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // --- Fetch Data ---
  const getUser = useCallback(() => {
    if (!userid) return;
    axios.get(`${WEB_URL}/api/searchUserById/${userid}`).then((Response) => {
      if (Response.data && Response.data.data && Response.data.data[0]) {
        setUser(Response.data.data[0]);
      }
    });
  }, [userid]);

  const getMyPosts = useCallback(() => {
    axios.get(`${WEB_URL}/api/getPostById/${userid}`)
      .then((Response) => {
        setPosts(Response.data.data);
      })
      .catch((error) => console.error("Error:", error));
  }, [userid]);

  const getNewUsers = useCallback(() => {
    if (userid) {
      axios.post(`${WEB_URL}/api/getRandomUsers`, { userid: userid })
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

  // --- Actions ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      axios.delete(`${WEB_URL}/api/deletePost/${id}`)
        .then(() => {
          toast.success("Post deleted");
          getMyPosts();
        })
        .catch(() => toast.error("Failed to delete"));
    }
  };

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

    axios.post(`${WEB_URL}/api/editPost`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => {
        toast.success("Post updated!");
        handleClose();
        getMyPosts();
      })
      .catch(() => toast.error("Update failed"));
  };

  const formatPostTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="myposts-wrapper">
      <div className="myposts-content">
        
        {/* --- LEFT: POST FEED --- */}
        <div className="myposts-feed">
          
          {/* Header */}
          <div className="myposts-header-card">
            <div className="header-info">
                <h1>My Posts</h1>
                <p>Manage and view your shared moments</p>
            </div>
            <div className="post-count-badge">
                {posts.length} Posts
            </div>
          </div>

          {/* Posts List */}
          {posts.length > 0 ? (
            posts.map((elem) => (
              <div key={elem._id} className="post-card">
                
                <div className="post-header">
                  <div className="post-user-info">
                    <img
                      src={user?.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"}
                      alt=""
                      className="post-user-img"
                    />
                    <div className="post-meta">
                      <h4>{user.fname} {user.lname}</h4>
                      <span>{formatPostTime(elem.date)}</span>
                    </div>
                  </div>

                  <div className="post-actions-top">
                    <button 
                        className="action-icon-btn btn-edit" 
                        onClick={() => handleOpenEdit(elem)}
                        title="Edit"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                        className="action-icon-btn btn-delete" 
                        onClick={() => handleDelete(elem._id)}
                        title="Delete"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="post-desc">{elem.description}</div>
                
                {elem.photos.length > 0 && (
                  <div className="post-media-container">
                    <Slider {...settings}>
                      {elem.photos.map((el, idx) => (
                        <div key={idx} style={{ outline: 'none' }}>
                            <img src={`${WEB_URL}${el}`} alt="" className="post-img" />
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}

                <div className="post-footer">
                   <i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i> 
                   <span>{elem.likes.length} Likes</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
               <i className="fa-regular fa-folder-open"></i>
               <h3>You haven't posted anything yet.</h3>
            </div>
          )}
        </div>

        {/* --- RIGHT: SIDEBAR --- */}
        <div className="myposts-sidebar">
            <div className="sidebar-widget">
                <div className="widget-title">People you may know</div>
                {topUsers.length > 0 ? (
                    topUsers.map((elem) => (
                        <div key={elem._id} className="suggestion-item">
                            <img 
                                src={elem.profilepic ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png"} 
                                alt="" 
                                className="suggestion-img"
                            />
                            <div className="suggestion-info">
                                <h5>{elem.fname} {elem.lname}</h5>
                                <p>{elem.city ? elem.city : "Student"}</p>
                            </div>
                            <span 
                                className="suggestion-link"
                                onClick={() => nav("/view-search-profile", { state: { id: elem._id } })}
                            >
                                View
                            </span>
                        </div>
                    ))
                ) : (
                    <div style={{color: '#999', fontSize: '0.9rem'}}>No new suggestions</div>
                )}
            </div>
        </div>

      </div>

      {/* --- EDIT MODAL --- */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">Edit Post</span>
            <i className="fa-solid fa-xmark modal-close" onClick={handleClose}></i>
          </div>
          
          <div className="modal-input-group">
            <label className="modal-label">Description</label>
            <textarea 
              rows="4" 
              className="modal-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <div className="modal-input-group">
             <label className="modal-label">Manage Images</label>
             <div className="modal-imgs">
                {editImages.map((img, idx) => (
                    <div key={idx} className="modal-img-wrapper">
                        <img 
                            src={`${WEB_URL}${img}`} 
                            alt="post-content" 
                            className="modal-img"
                        />
                        <div className="modal-remove-img" onClick={() => removeImage(idx)}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </div>
                ))}
                {editImages.length === 0 && <span style={{fontSize: '0.85rem', color: '#999'}}>No images.</span>}
             </div>
          </div>

          <div className="modal-actions">
            <button className="btn-modal btn-cancel" onClick={handleClose}>Cancel</button>
            <button className="btn-modal btn-save" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}