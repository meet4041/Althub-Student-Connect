import React, { useEffect, useState, useCallback, useMemo } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import EditEducationModal from "./EditEducationModal";

// ... (Paste your styles string here, unchanged) ...
const styles = `
  .home-wrapper { background-color: #f3f2ef; min-height: 100vh; padding: 15px 0; font-family: 'Poppins', sans-serif; }
  .home-content { display: flex; justify-content: center; gap: 20px; width: 98%; max-width: 1920px; margin: 0 auto; padding: 0 10px; align-items: flex-start; }
  .sidebar-left { flex: 0 0 320px; position: sticky; top: 90px; display: flex; flex-direction: column; gap: 15px; }
  .profile-mini-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: center; position: relative; border: 1px solid #e5e7eb; }
  .profile-bg { background: linear-gradient(135deg, #66bd9e 0%, #479378 100%); height: 90px; }
  .profile-img-wrapper { margin-top: -45px; display: inline-block; padding: 4px; background: #fff; border-radius: 50%; width:100px; }
  .profile-img-wrapper img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
  .profile-info { padding: 10px 15px 20px; }
  .profile-name { font-weight: 700; font-size: 1.2rem; color: #333; display: block; }
  .menu-box { background: #fff; border-radius: 12px; padding: 8px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
  .menu-item { display: flex; align-items: center; padding: 12px 25px; color: #555; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
  .menu-item:hover { background: #f0f9f6; color: #66bd9e; border-left-color: #66bd9e; }
  .menu-item i { width: 30px; font-size: 1.2rem; margin-right: 10px; }
  .menu-divider { height: 1px; background: #eee; margin: 5px 0; }
  .feed-center { flex: 1; display: flex; flex-direction: column; gap: 15px; min-width: 0; }
  .create-post-card { background: #fff; border-radius: 12px; padding: 15px 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
  .cp-top { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
  .cp-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
  .cp-input { flex: 1; background: #f8f9fa; border: 1px solid #eee; border-radius: 50px; padding: 12px 20px; outline: none; font-size: 1rem; transition: background 0.2s; }
  .cp-input:focus { background: #fff; border-color: #66bd9e; }
  .cp-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f0f0f0; }
  .cp-upload-btn { display: flex; align-items: center; gap: 8px; color: #666; cursor: pointer; font-size: 0.95rem; font-weight: 500; padding: 8px 15px; border-radius: 8px; transition: background 0.2s; }
  .cp-upload-btn:hover { background: #f0f0f0; }
  .cp-upload-btn i { color: #66bd9e; font-size: 1.3rem; }
  .cp-post-btn { background: #66bd9e; color: #fff; border: none; padding: 8px 30px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .cp-post-btn:hover { background: #479378; }
  .preview-grid { display: flex; gap: 10px; margin-bottom: 15px; overflow-x: auto; }
  .preview-media { height: 120px; width: auto; max-width: 200px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
  .post-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); overflow: hidden; padding-bottom: 10px; border: 1px solid #e5e7eb; }
  .post-header { padding: 15px 20px; display: flex; align-items: center; gap: 15px; }
  .post-header img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 1px solid #eee; }
  .post-meta h4 { margin: 0; font-size: 1.05rem; font-weight: 600; color: #333; }
  .post-meta span { font-size: 0.85rem; color: #999; }
  .post-content { padding: 5px 20px 15px; font-size: 1rem; color: #333; white-space: pre-wrap; line-height: 1.5; }
  .post-media { margin-bottom: 10px; background: #000; }
  .post-media-item { width: 100%; max-height: 600px; object-fit: contain; background: #000; display: block; margin: 0 auto; }
  .post-actions { padding: 5px 20px 10px; display: flex; align-items: center; gap: 15px; border-top: 1px solid #f5f5f5; padding-top: 12px; }
  .like-btn { cursor: pointer; font-size: 1.5rem; transition: transform 0.2s; }
  .like-btn:active { transform: scale(1.2); }
  .like-count { font-weight: 600; color: #555; font-size: 1rem; }
  .sidebar-right { flex: 0 0 380px; display: flex; flex-direction: column; gap: 15px; position: sticky; top: 90px; }
  .widget-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e5e7eb; }
  .widget-title { font-size: 1.15rem; font-weight: 700; color: #333; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
  .event-item { display: flex; gap: 15px; margin-bottom: 15px; border-bottom: 1px solid #f9f9f9; padding-bottom: 12px; }
  .event-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
  .event-thumb { width: 95px; height: 80px; border-radius: 10px; object-fit: cover; background: #eee; }
  .event-details { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
  .event-title { font-size: 1rem; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  .event-meta { font-size: 0.85rem; color: #777; display: flex; flex-direction: column; gap: 2px; }
  .aid-item { display: flex; align-items: center; gap: 15px; margin-bottom: 18px; }
  .aid-img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
  .aid-content { flex: 1; }
  .aid-header { display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
  .aid-progress-bg { height: 8px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
  .aid-progress-fill { height: 100%; background: #66bd9e; border-radius: 10px; }
  .aid-amounts { display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; margin-top: 4px; font-weight: 500; }
  .education-alert { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
  .alert-content { display: flex; align-items: center; gap: 12px; }
  .alert-content i { font-size: 1.5rem; }
  .alert-btn { background: #856404; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
  .alert-btn:hover { background: #6d5203; }
  @media (max-width: 1400px) { .sidebar-right { flex: 0 0 320px; } .sidebar-left { flex: 0 0 260px; } }
  @media (max-width: 1100px) { .sidebar-right { display: none; } .feed-center { flex: 1; } }
  @media (max-width: 850px) { .sidebar-left { display: none; } .home-content { padding: 0 10px; } }
`;

export default function Home({ socket }) {
  const settings = { dots: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false, lazyLoad: 'ondemand' };
  const nav = useNavigate();
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
  
  // Stable empty list reference to avoid re-renders
  const emptyEducationList = useMemo(() => [], []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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

  const getUser = useCallback(() => {
    if (!userid) return;
    axios.get(`${WEB_URL}/api/searchUserById/${userid}`)
      .then((Response) => {
        if (Response.data && Response.data.data && Response.data.data[0]) {
          setUser(Response.data.data[0]);
        }
      })
      .catch((error) => console.error("Error fetching user:", error));
  }, [userid]);

  const checkEducation = useCallback(() => {
    if (!userid) return Promise.resolve();
    return axios.post(`${WEB_URL}/api/getEducation`, { userid: userid })
      .then((Response) => {
        if (Response.data.data && Response.data.data.length === 0) {
            setHasEducation(false);
        } else {
            setHasEducation(true);
        }
      })
      .catch((error) => console.error("Error checking education:", error));
  }, [userid]);

  const getAids = useCallback(() => {
    axios.get(`${WEB_URL}/api/getFinancialAid`).then((Response) => setAids(Response.data.data)).catch((error) => console.error("Error fetching aids:", error));
  }, []);

  const getPost = useCallback(() => {
    axios.get(`${WEB_URL}/api/getPost`).then((Response) => setPost(Response.data.data)).catch((error) => console.error("Error fetching posts:", error));
  }, []);

  const getEvents = useCallback(() => {
    axios.get(`${WEB_URL}/api/getEvents`).then((Response) => setEvents(Response.data.data)).catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => { getUser(); getPost(); getEvents(); getAids(); checkEducation(); }, [getUser, getPost, getEvents, getAids, checkEducation]);

  const imgChange = (e) => { setFileList(e.target.files); };

  const addPost = async () => {
    if (!user || !user.fname || !user.lname) { toast.error("User data not loaded. Please refresh."); return; }
    if ((!description || description.trim() === "") && (!fileList || fileList.length === 0)) { toast.error("Empty post not allowed!"); return; }
    setUploading(true);
    var body = new FormData();
    body.append("userid", localStorage.getItem("Althub_Id"));
    body.append("description", description);
    body.append("date", new Date().toISOString());
    body.append("fname", user.fname);
    body.append("lname", user.lname);
    body.append("profilepic", user.profilepic || "");
    if (fileList) {
        const filesArray = Array.from(fileList);
        const compressedFiles = await Promise.all(filesArray.map(file => compressImage(file)));
        compressedFiles.forEach((file) => { body.append(`photos`, file, file.name); });
    }
    axios({ url: `${WEB_URL}/api/addPost`, method: "post", headers: { "Content-type": "multipart/form-data" }, data: body })
      .then((Response) => {
        toast.success("Post Uploaded!!");
        if (user && user.followers && user.followers.length > 0) {
            user.followers.forEach((followerId) => {
                socket.emit("sendNotification", { receiverid: followerId, title: "New Post", msg: `${user.fname} ${user.lname} added a new post` });
            });
        }
        setFileList(null); setDescription(""); setUploading(false); getPost();
      })
      .catch((error) => { toast.error("Something went wrong!!"); setUploading(false); });
  };

  const Logout = () => { localStorage.clear(); nav("/"); };

  const handleLike = async (elem) => {
    await axios.put(`${WEB_URL}/api/like/${elem._id}`, { userId: userid })
    .then((response) => {
      if (userid !== elem.userid && response.data.msg === "Like") {
        socket.emit("sendNotification", { receiverid: elem.userid, title: "New Like", msg: `${user.fname} Liked Your Post` }); 
      }
      getPost(); 
    }).catch((error) => console.error("Error:", error));
  };

  const formatPostTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now - messageTime);
    const minutesDiff = Math.floor(timeDiff / 60000);
    if (minutesDiff < 1) return "Just now";
    else if (minutesDiff < 60) return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
    else if (messageTime.toDateString() === now.toDateString()) return `Today at ${messageTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}`;
    else return messageTime.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" });
  };
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
  const calWidth = (aid, claimed) => { const ans = Number(claimed) / Number(aid) * 100; return ans > 100 ? "100%" : `${ans.toFixed(2)}%`; }

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) > now).slice(0, 3); 

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <div className="sidebar-left">
          <div className="profile-mini-card">
            <div className="profile-bg"></div>
            <div className="profile-img-wrapper"><img src={user?.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} alt="Profile" loading="lazy" /></div>
            <div className="profile-info"><span className="profile-name">{user.fname} {user.lname}</span><span style={{ fontSize: '0.9rem', color: '#777' }}>{user.designation || "Student"}</span></div>
          </div>
          <div className="menu-box">
            <div className="menu-item" onClick={() => { nav("/view-profile"); window.scrollTo(0, 0); }}><i className="fa-solid fa-user"></i> Profile</div>
            <div className="menu-item" onClick={() => nav("/events")}><i className="fa-solid fa-calendar"></i> Events</div>
            <div className="menu-item" onClick={() => nav("/scholarship")}><i className="fa-solid fa-handshake-angle"></i> Scholarship</div>
            <div className="menu-item" onClick={() => nav("/feedback")}><i className="fa-solid fa-star"></i> Feedback</div>
            <div className="menu-divider"></div>
            <div className="menu-item" onClick={Logout} style={{ color: '#ff4d4d' }}><i className="fa-solid fa-right-from-bracket"></i> Logout</div>
          </div>
        </div>

        <div className="feed-center">
          {!hasEducation && (
            <div className="education-alert">
              <div className="alert-content">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div><strong>Complete Your Profile</strong><div style={{fontSize: '0.9rem'}}>Please add your education details to help us connect you better.</div></div>
              </div>
              <button className="alert-btn" onClick={() => setShowEduModal(true)}>Add Education</button>
            </div>
          )}

          <div className="create-post-card">
            <div className="cp-top">
              <img src={user?.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} className="cp-avatar" alt="" loading="lazy"/>
              <input type="text" className="cp-input" placeholder={`What's on your mind, ${user.fname || 'User'}?`} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {fileList && fileList.length > 0 && (
              <div className="preview-grid">
                {Array.from(fileList).map((elem, index) => (
                  <div key={index} style={{position: 'relative'}}>
                    {isVideo(elem) ? <video src={window.URL.createObjectURL(elem)} className="preview-media" muted /> : <img src={window.URL.createObjectURL(elem)} alt="" className="preview-media" />}
                  </div>
                ))}
              </div>
            )}
            <div className="cp-actions">
              <label className="cp-upload-btn"><i className="fa-regular fa-image"></i> Media<input type="file" onChange={imgChange} id="myFileInput" hidden multiple accept="image/*,video/*" /></label>
              <button className="cp-post-btn" onClick={addPost} disabled={uploading}>{uploading ? "Posting..." : "Post"}</button>
            </div>
          </div>

          {post.map((elem) => (
            <div key={elem._id} className="post-card">
              <div className="post-header">
                <img src={elem?.profilepic ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png"} alt="" onClick={() => { elem.userid === userid ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem.userid } }); }} loading="lazy" />
                <div className="post-meta"><h4>{elem.fname} {elem.lname}</h4><span>{formatPostTime(elem.date)}</span></div>
              </div>
              <div className="post-content">{elem.description}</div>
              {elem.photos.length > 0 && (
                <div className="post-media">
                  <Slider {...settings}>
                    {elem.photos.map((el, idx) => (
                      <div key={idx} style={{ outline: 'none' }}>
                        {isVideo(el) ? <video src={`${WEB_URL}${el}`} className="post-media-item" controls playsInline preload="metadata" /> : <img src={`${WEB_URL}${el}`} alt="Post Content" className="post-media-item" onDoubleClick={() => handleLike(elem)} loading="lazy" />}
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
              <div className="post-actions">
                <i className={`${elem.likes.includes(userid.toString()) ? "fa-solid fa-heart" : "fa-regular fa-heart"} like-btn`} style={{ color: elem.likes.includes(userid.toString()) ? "#e0245e" : "#555" }} onClick={() => handleLike(elem)}></i>
                <span className="like-count">{elem.likes.length} Likes</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-right">
          <div className="widget-card">
            <div className="widget-title"><i className="fa-solid fa-calendar-day" style={{color: '#66bd9e'}}></i> Upcoming Events</div>
            {upcomingEvents.length > 0 ? upcomingEvents.map((elem) => (
              <div key={elem._id} className="event-item">
                <img src={elem.photos && elem.photos.length > 0 ? `${WEB_URL}${elem.photos[0]}` : "images/event1.png"} className="event-thumb" alt="" loading="lazy"/>
                <div className="event-details"><div className="event-title">{elem.title}</div><div className="event-meta"><span>{formatDate(elem.date)}</span><span>{formatTime(elem.date)}</span></div></div>
              </div>
            )) : <span style={{color:'#999', fontSize:'0.9rem'}}>No upcoming events</span>}
          </div>
          {aids.length > 0 && (
            <div className="widget-card">
              <div className="widget-title"><i className="fa-solid fa-hand-holding-dollar" style={{color: '#66bd9e'}}></i> Scholarship Aid</div>
              {aids.slice(0, 3).map((elem) => (
                <div key={elem._id} className="aid-item">
                  <img src={elem.image ? `${WEB_URL}${elem.image}` : "images/profile1.png"} className="aid-img" alt="" loading="lazy"/>
                  <div className="aid-content">
                    <div className="aid-header"><span>{elem.name}</span><span>{calWidth(elem.aid, elem.claimed)}</span></div>
                    <div className="aid-progress-bg"><div className="aid-progress-fill" style={{ width: calWidth(elem.aid, elem.claimed) }}></div></div>
                    <div className="aid-amounts"><span>₹{elem.claimed}</span><span>₹{elem.aid}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showEduModal && <EditEducationModal closeModal={() => setShowEduModal(false)} education={emptyEducationList} getEducation={checkEducation} modal="Add" />}
    </div>
  );
}