import React, { useEffect, useState, useCallback, useMemo } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import EditEducationModal from "./EditEducationModal";
import ProtectedImage from "../ProtectedImage";
import { 
  User, Calendar, Heart, Gift, MessageSquare, LogOut, 
  Image as ImageIcon, Briefcase, GraduationCap, Plus, Users 
} from 'lucide-react';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/HomePage.css"; 

export default function Home({ socket }) {
  const settings = { dots: true, infinite: false, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false };
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
  
  // CHANGED: Initialized as empty array to store real data
  const [suggestions, setSuggestions] = useState([]);

  const userid = localStorage.getItem("Althub_Id");
  const emptyEducationList = useMemo(() => [], []);

  // Image Compression
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
          canvas.width = scaleSize < 1 ? MAX_WIDTH : img.width;
          canvas.height = scaleSize < 1 ? img.height * scaleSize : img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const isVideo = (urlOrFile) => {
    if (urlOrFile instanceof File) return urlOrFile.type.startsWith("video/");
    if (typeof urlOrFile === "string") {
      const lower = urlOrFile.toLowerCase();
      return lower.includes("mime=video") || [".mp4", ".webm", ".ogg"].some(ext => lower.endsWith(ext));
    }
    return false;
  };

  const getUser = useCallback(() => {
    if (userid) axios.get(`${WEB_URL}/api/searchUserById/${userid}`, { withCredentials: true }).then((res) => { if (res.data?.data) setUser(res.data.data[0]); });
  }, [userid]);

  const checkEducation = useCallback(() => {
    if (userid) axios.post(`${WEB_URL}/api/getEducation`, { userid }).then((res) => setHasEducation(res.data.data?.length > 0));
  }, [userid]);

  // CHANGED: New function to fetch random users and filter them
  const getSuggestions = useCallback(() => {
    if (!userid) return;
    axios.post(`${WEB_URL}/api/getRandomUsers`, { userid })
      .then((res) => {
        if (res.data.data) {
            // Filter out users I already follow and my own profile
            // Note: The backend usually handles 'not me', but we ensure 'not following' here
            const allSuggestions = res.data.data.filter(u => 
                u._id !== userid && 
                (!user.followings || !user.followings.includes(u._id))
            );

            // Shuffle and pick 3
            const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 3));
        }
      })
      .catch((err) => console.error("Error fetching suggestions:", err));
  }, [userid, user.followings]); // Re-run if user followings change

  useEffect(() => { 
    getUser(); 
    checkEducation();
    axios.get(`${WEB_URL}/api/getPost`, { withCredentials: true }).then((res) => setPost(res.data.data));
    axios.get(`${WEB_URL}/api/getEvents`).then((res) => setEvents(res.data.data));
    axios.get(`${WEB_URL}/api/getFinancialAid`).then((res) => setAids(res.data.data));
  }, [getUser, checkEducation]);

  // CHANGED: Fetch suggestions only after we have user data (to know who we follow)
  useEffect(() => {
    if (user._id) {
        getSuggestions();
    }
  }, [user._id, getSuggestions]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].size > 20 * 1024 * 1024) return toast.error("File too large");
      setFileList(files);
    }
  };

  const addPost = async () => {
    if (!description.trim() && !fileList) return toast.error("Empty post!");
    setUploading(true);
    var body = new FormData();
    body.append("userid", userid);
    body.append("description", description);
    body.append("date", new Date().toISOString());
    body.append("fname", user.fname);
    body.append("lname", user.lname);
    body.append("profilepic", user.profilepic || "");
    if (fileList) {
      const compressed = await Promise.all(Array.from(fileList).map(f => compressImage(f)));
      compressed.forEach(f => body.append(`photos`, f, f.name));
    }
    axios.post(`${WEB_URL}/api/addPost`, body, { headers: { "Content-type": "multipart/form-data" }, withCredentials: true })
      .then(() => {
        toast.success("Posted!"); setFileList(null); setDescription(""); setUploading(false);
        axios.get(`${WEB_URL}/api/getPost`, { withCredentials: true }).then((res) => setPost(res.data.data));
      })
      .catch(() => { toast.error("Failed"); setUploading(false); });
  };

  const handleLike = (elem) => {
    axios.put(`${WEB_URL}/api/like/${elem._id}`, { userId: userid }).then((res) => {
      if (userid !== elem.userid && res.data.msg === "Like") socket.emit("sendNotification", { receiverid: elem.userid, title: "New Like", msg: `${user.fname} Liked Your Post` });
      axios.get(`${WEB_URL}/api/getPost`, { withCredentials: true }).then((r) => setPost(r.data.data));
    });
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) > now).slice(0, 3);

  return (
    <div className="home-wrapper">
      <div className="home-container">
        
        {/* --- LEFT SIDEBAR (Profile & Stats) --- */}
        <div className="sidebar-left">
          
          {/* Profile Card */}
          <div className="profile-mini-card">
            <div className="profile-bg"></div>
            <div className="profile-avatar-wrapper">
              <img src={user.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} className="profile-avatar" alt="Profile" />
            </div>
            <h3 className="profile-name">{user.fname} {user.lname}</h3>
            <p className="profile-role">{user.designation || "Student"}</p>
            
            {/* Stats Section */}
            <div className="profile-stats">
                <div className="stat-item">
                    <span className="stat-value">{user.followers?.length || 0}</span>
                    <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{user.followings?.length || 0}</span>
                    <span className="stat-label">Following</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{post.filter(p => p.userid === userid).length}</span>
                    <span className="stat-label">Posts</span>
                </div>
            </div>
          </div>

          {/* Menu */}
          <div className="menu-box">
            <div onClick={() => nav("/view-profile")} className="menu-item"><User size={20} /> My Profile</div>
            <div onClick={() => nav("/search-profile")} className="menu-item"><Users size={20} /> Search Alumni</div>
            <div onClick={() => nav("/events")} className="menu-item"><Calendar size={20} /> Events</div>
            <div onClick={() => nav("/scholarship")} className="menu-item"><Gift size={20} /> Scholarships</div>
            <div onClick={() => nav("/feedback")} className="menu-item"><MessageSquare size={20} /> Feedback</div>
            <div onClick={() => { localStorage.clear(); nav("/"); }} className="menu-item menu-item-logout"><LogOut size={20} /> Logout</div>
          </div>
        </div>

        {/* --- CENTER FEED --- */}
        <div className="feed-section">
          {!hasEducation && (
            <div className="edu-alert">
              <div className="flex items-center gap-3">
                <GraduationCap size={24} />
                <span className="text-sm font-semibold">Boost your profile visibility by adding education details.</span>
              </div>
              <button onClick={() => setShowEduModal(true)} className="edu-btn">Add Now</button>
            </div>
          )}

          {/* Create Post */}
          <div className="create-post-card">
            <div className="cp-top">
              <img src={user.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} className="cp-avatar" alt="" />
              <input 
                type="text"
                placeholder={`What's on your mind, ${user.fname}?`} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cp-input"
              />
            </div>
            
            {fileList && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from(fileList).map((file, i) => (
                  isVideo(file) 
                    ? <video key={i} src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded-lg" />
                    : <img key={i} src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="cp-actions">
              <label className="media-btn">
                <ImageIcon size={18} /> Photo / Video
                <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
              </label>
              <button onClick={addPost} disabled={uploading} className="post-btn">
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {post.map((elem) => (
            <div key={elem._id} className="post-card">
              <div className="post-header">
                <img 
                  src={elem.profilepic ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png"} 
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border border-slate-100"
                  onClick={() => nav(elem.userid === userid ? "/view-profile" : "/view-search-profile", { state: { id: elem.userid } })}
                  alt=""
                />
                <div className="post-info">
                  <h4 className="post-name">{elem.fname} {elem.lname}</h4>
                  <span className="post-date">{new Date(elem.date).toLocaleString()}</span>
                </div>
              </div>

              <div className="post-desc">{elem.description}</div>

              {elem.photos.length > 0 && (
                <div className="post-media-box">
                  <Slider {...settings}>
                    {elem.photos.map((photo, idx) => (
                      <div key={idx}>
                        {isVideo(photo) ? (
                          <video src={`${WEB_URL}${photo}`} className="post-img" controls />
                        ) : (
                          <ProtectedImage imgSrc={photo} className="post-img" defaultImage="images/error-page-pattern.png" />
                        )}
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

              <div className="post-footer">
                <button onClick={() => handleLike(elem)} className={`like-btn ${elem.likes.includes(userid) ? 'liked' : ''}`}>
                  <Heart size={20} fill={elem.likes.includes(userid) ? "currentColor" : "none"} />
                  {elem.likes.length} Likes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- RIGHT SIDEBAR (Widgets) --- */}
        <div className="sidebar-right">
          
          {/* UPDATED: Dynamic People You May Know Widget */}
          <div className="widget-card">
             <div className="widget-header">
                <span>People You May Know</span>
             </div>
             
             {suggestions.length > 0 ? (
                 suggestions.map((person) => (
                    <div key={person._id} className="suggestion-item">
                        <div className="suggestion-info">
                            <img 
                                src={person.profilepic ? `${WEB_URL}${person.profilepic}` : "images/profile1.png"} 
                                className="suggestion-avatar cursor-pointer" 
                                alt={person.fname}
                                onClick={() => nav("/view-search-profile", { state: { id: person._id } })} 
                            />
                            <div className="suggestion-text">
                                <h4 
                                    className="cursor-pointer hover:underline"
                                    onClick={() => nav("/view-search-profile", { state: { id: person._id } })}
                                >
                                    {person.fname} {person.lname}
                                </h4>
                                <span>{person.city || "Student"}</span>
                            </div>
                        </div>
                        {/* Note: Navigating to search profile is safer than direct follow here 
                           because we want them to view the profile first 
                        */}
                        <button 
                            className="btn-icon-follow" 
                            onClick={() => nav("/view-search-profile", { state: { id: person._id } })}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                 ))
             ) : (
                 <p className="text-sm text-slate-400 italic text-center py-2">No new suggestions</p>
             )}

             <div className="mt-4 text-center">
                <span onClick={() => nav("/search-profile")} className="widget-link">See all</span>
             </div>
          </div>

          {/* Events Widget */}
          <div className="widget-card">
            <div className="widget-header">
               <span className="flex items-center gap-2"><Calendar className="widget-icon" /> Upcoming Events</span>
               <span onClick={() => nav("/events")} className="widget-link">View All</span>
            </div>
            {upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
              <div key={evt._id} className="event-item group" onClick={() => nav("/events")}>
                <ProtectedImage imgSrc={evt.photos?.[0]} defaultImage="images/event1.png" className="event-thumb" />
                <div className="event-info">
                  <h4>{evt.title}</h4>
                  <span className="event-date">{new Date(evt.date).toLocaleDateString()}</span>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No upcoming events.</p>}
          </div>

          {/* Scholarship Widget */}
          {aids.length > 0 && (
            <div className="widget-card">
              <div className="widget-header">
                 <span className="flex items-center gap-2"><Briefcase className="widget-icon" /> Scholarships</span>
                 <span onClick={() => nav("/scholarship")} className="widget-link">View</span>
              </div>
              {aids.slice(0, 3).map(aid => (
                <div key={aid._id} className="aid-item">
                  <div className="aid-top">
                    <img src={aid.image ? `${WEB_URL}${aid.image}` : "images/Institute-Test.png"} className="aid-logo" alt="" />
                    <div className="aid-details flex-1">
                      <h4>{aid.name}</h4>
                      <div className="aid-meta">
                        <span>Fund: ₹{aid.aid}</span>
                        <span>Used: {Math.round((Number(aid.claimed)/Number(aid.aid))*100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="aid-bar-bg">
                    <div className="aid-bar-fill" style={{ width: `${(Number(aid.claimed)/Number(aid.aid))*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showEduModal && (
        <EditEducationModal 
          closeModal={() => setShowEduModal(false)} 
          education={emptyEducationList} 
          getEducation={checkEducation} 
          modal="Add" 
        />
      )}
    </div>
  );
}