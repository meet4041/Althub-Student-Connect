import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import {
  Edit2, Trash2, Heart, X, Image as ImageIcon, FolderOpen, AlertTriangle
} from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/MyPosts.css";

export default function MyPosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const userid = localStorage.getItem("Althub_Id");

  // Edit State
  const [openModal, setOpenModal] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [editId, setEditId] = useState("");

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const settings = {
    dots: true,
    infinite: false,
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

    // 1. User Profile
    axios.get(`${WEB_URL}/api/searchUserById/${userid}`, { withCredentials: true })
      .then((res) => {
        if (res.data?.data) setUser(res.data.data[0]);
      })
      .catch(err => console.error("User fetch error:", err));

    // 2. My Posts
    axios.get(`${WEB_URL}/api/getPostByUser/${userid}`, {
      withCredentials: true
    })
      .then((res) => {
        if (res.data && res.data.data) {
          setPosts(res.data.data);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Post fetch error:", err);
        setPosts([]);
      });

    // 3. Suggestions
    axios.post(`${WEB_URL}/api/getRandomUsers`, { userid })
      .then((res) => {
        setTopUsers(res.data.data || []);
      })
      .catch(console.error);

  }, [userid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Handlers ---

  // 1. Trigger Delete Modal
  const promptDelete = (id) => {
    setDeleteId(id);
  };

  // 2. Confirm Delete
  const confirmDelete = () => {
    if (!deleteId) return;

    axios.delete(`${WEB_URL}/api/deletePost/${deleteId}`, { withCredentials: true })
      .then(() => {
        toast.success("Post deleted");
        setDeleteId(null);
        fetchData();
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const handleOpenEdit = (post) => {
    setEditId(post._id);
    setEditDesc(post.description);
    setEditImages(post.photos || []);
    setOpenModal(true);
  };

  const saveEdit = () => {
    const formData = new FormData();
    formData.append("id", editId);
    formData.append("description", editDesc);
    editImages.forEach(img => formData.append("existingPhotos", img));

    axios.post(`${WEB_URL}/api/editPost`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    })
      .then(() => { toast.success("Updated!"); setOpenModal(false); fetchData(); })
      .catch(() => toast.error("Update failed"));
  };

  return (
    <div className="mp-wrapper">
      <div className="mp-container">

        {/* --- Main Feed --- */}
        <div className="mp-main-col">

          {/* Header */}
          <div className="mp-header-card">
            <div className="mp-title-group">
              <h1>My Posts</h1>
              <p>Manage your shared moments and updates.</p>
            </div>
            <div className="mp-badge">
              <ImageIcon size={16} />
              <span>{posts.length} Posts</span>
            </div>
          </div>

          {/* Posts List */}
          {posts.length > 0 ? (
            posts.map((elem) => (
              <div key={elem._id} className="mp-post-card">

                {/* Post Header */}
                <div className="mp-post-header">
                  <div className="mp-user-info">
                    <img
                      src={user.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"}
                      alt="Avatar"
                      className="mp-avatar"
                    />
                    <div className="mp-meta">
                      <h4>{user.fname} {user.lname}</h4>
                      <span>{formatPostTime(elem.date)}</span>
                    </div>
                  </div>

                  <div className="mp-actions">
                    <button className="mp-action-btn edit" onClick={() => handleOpenEdit(elem)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="mp-action-btn delete" onClick={() => promptDelete(elem._id)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mp-content">{elem.description}</div>

                {/* Media Slider */}
                {elem.photos && elem.photos.length > 0 && (
                  <div className="mp-media-wrapper">
                    <Slider {...settings}>
                      {elem.photos.map((el, idx) => (
                        <div key={idx} className="outline-none">
                          {isVideo(el) ? (
                            <video src={`${WEB_URL}${el}`} className="mp-media-item" controls />
                          ) : (
                            <ProtectedImage imgSrc={el} className="mp-media-item" defaultImage="images/cover-pattern.png" />
                          )}
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}

                {/* Footer */}
                <div className="mp-footer">
                  <Heart size={20} className="text-red-500 fill-current" />
                  <span>{elem.likes ? elem.likes.length : 0} Likes</span>
                </div>

              </div>
            ))
          ) : (
            <div className="mp-empty">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FolderOpen size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">No posts yet</h3>
              <p className="text-sm text-slate-400 mt-1">Create your first post from the Home page.</p>
            </div>
          )}
        </div>

        {/* --- Right Sidebar --- */}
        <div className="mp-sidebar-col">
          <div className="sidebar-card">
            <h4 className="sidebar-title">People you may know</h4>
            <div>
              {topUsers.length > 0 ? topUsers.map((u) => (
                <div key={u._id} className="suggestion-item">
                  <div className="suggestion-left">
                    <img
                      src={u.profilepic ? `${WEB_URL}${u.profilepic}` : "images/profile1.png"}
                      alt="User"
                      className="suggestion-avatar"
                    />
                    <div className="suggestion-info">
                      <h4>{u.fname} {u.lname}</h4>
                      <p>{u.city || "Student"}</p>
                    </div>
                  </div>
                  <button
                    className="view-btn"
                    onClick={() => nav("/view-search-profile", { state: { id: u._id } })}
                  >
                    View
                  </button>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No new suggestions.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- Edit Modal --- */}
      {openModal && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-box">

            {/* Header */}
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">Edit Post</h3>
              <button className="mp-close-btn" onClick={() => setOpenModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="mp-modal-content">
              {/* Text Input with Box Styling */}
              <textarea
                className="mp-editor-area"
                placeholder="What's on your mind?"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />

              {/* Image Grid */}
              {editImages.length > 0 && (
                <div className="mt-4">
                  <span className="mp-media-label">Attached Media ({editImages.length})</span>
                  <div className="mp-images-grid">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="mp-image-preview">
                        <ProtectedImage imgSrc={img} className="preview-img" />
                        <button
                          className="remove-img-btn"
                          onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mp-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setOpenModal(false)}>
                Cancel
              </button>
              <button className="btn-modal-save" onClick={saveEdit}>
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteId && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-box delete-box">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Post?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 mt-4 w-full">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}