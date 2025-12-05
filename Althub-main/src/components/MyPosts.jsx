import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

// Modal Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const userid = localStorage.getItem("Althub_Id");

  // Edit State
  const [open, setOpen] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [editId, setEditId] = useState("");

  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

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

  useEffect(() => {
    getUser();
    getMyPosts();
  }, [getUser, getMyPosts]);

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
    setEditImages(post.photos || []); // Load existing images
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
    
    // We send the REMAINING existing images back to server
    // Note: We are NOT appending to 'photos' (which is for new files), 
    // we use a specific key 'existingPhotos' or just handle it in backend logic.
    // Based on my backend update above, let's append them individually.
    editImages.forEach(img => {
        formData.append("existingPhotos", img);
    });

    // If no images left, we need to ensure backend knows to empty it.
    // If editImages is empty, the loop above does nothing. 
    // My backend logic handles empty existingPhotos if we don't send new files.

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
    <div className="home-container" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
      <h2 style={{marginTop:'20px'}}>My Posts</h2>
      
      <div className="home-post-main" style={{width: '600px'}}> 
        {posts.length > 0 ? (
          posts.map((elem) => (
            <div key={elem._id} className="post" style={{position:'relative'}}>
              {/* CRUD Actions */}
              <div style={{position:'absolute', right:'10px', top:'10px', zIndex: 10}}>
                <button 
                    onClick={() => handleOpenEdit(elem)}
                    style={{marginRight:'5px', padding:'5px 10px', cursor:'pointer', background:'#4CAF50', color:'white', border:'none', borderRadius:'4px'}}
                >
                    Edit
                </button>
                <button 
                    onClick={() => handleDelete(elem._id)}
                    style={{padding:'5px 10px', cursor:'pointer', background:'#f44336', color:'white', border:'none', borderRadius:'4px'}}
                >
                    Delete
                </button>
              </div>

              <div className="post-header">
                <div className="post-profile">
                  <div>
                    <img
                      src={
                        user && user.profilepic
                          ? `${WEB_URL}${user.profilepic}`
                          : "images/profile1.png"
                      }
                      alt=""
                      className="post-profile-img"
                    />
                  </div>
                  <div className="post-info">
                    <span className="post-name">
                      {user.fname} {user.lname}
                    </span>
                    <span className="post-description">
                      {formatPostTime(elem.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="post-message">{elem.description}</div>
              {elem.photos.length > 0 ? (
                <div className="post-images">
                  <Slider {...settings}>
                    {elem.photos.map((el, idx) => (
                      <img
                        key={idx}
                        src={`${WEB_URL}${el}`}
                        alt=""
                        className="post-image"
                      />
                    ))}
                  </Slider>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <h3 style={{textAlign:'center', marginTop:'50px'}}>No posts found.</h3>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3>Edit Post</h3>
          
          <label>Update Description:</label>
          <textarea 
            rows="4" 
            style={{width:'100%', padding:'5px'}}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />

          <label>Manage Images (Click X to delete):</label>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            {editImages.map((img, idx) => (
                <div key={idx} style={{position:'relative', width:'80px', height:'80px'}}>
                    <img src={`${WEB_URL}${img}`} alt="upload" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'5px'}} />
                    <span 
                        onClick={() => removeImage(idx)}
                        style={{
                            position:'absolute', top:-5, right:-5, 
                            background:'red', color:'white', borderRadius:'50%', 
                            width:'20px', height:'20px', textAlign:'center', 
                            lineHeight:'20px', cursor:'pointer', fontSize:'12px'
                        }}
                    >X</span>
                </div>
            ))}
            {editImages.length === 0 && <p style={{fontSize:'12px', color:'gray'}}>No images remaining.</p>}
          </div>

          <button 
            onClick={saveEdit}
            style={{padding:'10px', background:'#2196F3', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}
          >
            Save Changes
          </button>
        </Box>
      </Modal>
    </div>
  );
}