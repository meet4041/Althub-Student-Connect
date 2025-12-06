import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import FollowerModal from "./FollowerModal";

// --- INJECTED STYLES FOR MODERN PROFILE UI ---
const styles = `
  .profile-wrapper {
    background-color: #f3f2ef;
    min-height: 100vh;
    padding: 30px 0;
    font-family: 'Poppins', sans-serif;
  }

  .profile-content {
    width: 98%;
    max-width: 1920px;
    margin: 0 auto;
    padding: 0 10px;
    display: flex;
    gap: 25px;
    align-items: flex-start;
  }

  /* --- LEFT COLUMN (MAIN) --- */
  .profile-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  /* Header Card */
  .profile-header-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #eee;
  }

  .header-cover {
    height: 220px;
    background: linear-gradient(135deg, #66bd9e 0%, #26a69a 100%);
    width: 100%;
  }

  .header-body {
    padding: 0 40px 30px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .header-left {
    flex: 1;
    margin-top: -75px;
  }

  .header-avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 6px solid #fff;
    object-fit: cover;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    margin-bottom: 15px;
  }

  .user-details h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin: 0 0 5px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .alumni-badge {
    background-color: #e3f2fd;
    color: #1565c0;
    font-size: 0.8rem;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 600;
    border: 1px solid #90caf9;
  }

  .user-headline {
    font-size: 1.1rem;
    color: #636e72;
    margin-bottom: 10px;
  }

  .user-location {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 15px;
  }

  .user-stats {
    display: flex;
    gap: 30px;
    font-size: 1rem;
    color: #66bd9e;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .stat-link { cursor: pointer; transition: opacity 0.2s; }
  .stat-link:hover { opacity: 0.8; text-decoration: underline; }

  .user-socials {
    display: flex;
    gap: 20px;
  }
  .user-socials i {
    font-size: 1.6rem;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .user-socials i:hover { transform: translateY(-3px); }

  /* Action Buttons (Right Side of Header) */
  .header-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 30px; /* Align with name area */
  }

  .action-btn {
    padding: 10px 24px;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .btn-primary {
    background: #66bd9e;
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 189, 158, 0.3);
  }
  .btn-primary:hover { background: #479378; transform: translateY(-2px); }

  .btn-outline {
    background: #fff;
    color: #66bd9e;
    border-color: #66bd9e;
  }
  .btn-outline:hover { background: #f0f9f6; }

  .btn-secondary {
    background: #e0e0e0;
    color: #555;
  }

  /* Section Cards */
  .section-card {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #eee;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f5f5;
  }

  .list-item {
    display: flex;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f9f9f9;
    margin-bottom: 20px;
  }
  .list-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  .item-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .item-content { flex: 1; }
  
  .item-title { font-size: 1.1rem; font-weight: 600; color: #333; margin: 0; }
  .item-subtitle { font-size: 0.95rem; color: #555; margin: 2px 0; display: block; }
  .item-meta { font-size: 0.85rem; color: #888; margin-bottom: 8px; display: block; }
  .item-desc { font-size: 0.95rem; color: #555; line-height: 1.6; }

  /* --- RIGHT COLUMN (SIDEBAR) --- */
  .profile-sidebar {
    flex: 0 0 380px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .skill-tag {
    padding: 8px 16px;
    border-radius: 20px;
    background: #f8f9fa;
    color: #555;
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid #eee;
  }

  /* Suggestions */
  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 18px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f9f9f9;
  }
  .suggestion-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  .suggestion-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }

  .suggestion-info h5 { margin: 0; font-size: 1rem; color: #333; }
  .suggestion-info p { margin: 0; font-size: 0.85rem; color: #888; }

  .view-link {
    font-size: 0.9rem;
    color: #66bd9e;
    font-weight: 600;
    cursor: pointer;
    margin-left: auto;
    padding: 5px 15px;
    background: #f0f9f6;
    border-radius: 20px;
  }
  .view-link:hover { background: #66bd9e; color: #fff; }

  /* Responsive */
  @media (max-width: 1100px) {
    .profile-content { flex-direction: column; }
    .profile-sidebar { width: 100%; }
    .header-body { flex-direction: column; align-items: flex-start; }
    .header-actions { margin-top: 20px; width: 100%; justify-content: flex-start; }
  }
`;

export default function ViewSearchProfile({ socket }) {
  const location = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [skills, setSkills] = useState([]);
  const [language, setLanguage] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const myID = localStorage.getItem("Althub_Id");
  const [userID, setUserID] = useState("");
  const [topUsers, setTopUsers] = useState([]);
  const [self, setSelf] = useState({});

  const [showFollowerModal, setShowFollowerModal] = useState(false);
  const [followerTab, setFollowerTab] = useState("Follower");

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    if (location.state && location.state.id) {
      setUserID(location.state.id);
    }
  }, [location.state]);

  const getUser = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${userID}`,
        signal,
      })
        .then((Response) => {
          if (Response?.data?.data && Response.data.data[0]) {
            setUser(Response.data.data[0]);
            Response.data.data[0].skills && setSkills(JSON.parse(Response.data.data[0].skills));
            Response.data.data[0].languages && setLanguage(JSON.parse(Response.data.data[0].languages));
          }
        })
        .catch((error) => { });
    }
  }, [userID]);

  const getSelf = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${myID}`,
        signal,
      }).then((Response) => {
        if (Response?.data?.data && Response.data.data[0]) {
          setSelf(Response.data.data[0]);
        }
      }).catch(() => { });
    }
  }, [userID, myID]);

  const getEducation = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "post",
        url: `${WEB_URL}/api/getEducation`,
        data: { userid: userID },
        signal,
      }).then((Response) => setEducation(Response.data.data || [])).catch(() => { });
    }
  }, [userID]);

  const getExperience = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "post",
        url: `${WEB_URL}/api/getExperience`,
        data: { userid: userID },
        signal,
      }).then((Response) => setExperience(Response.data.data || [])).catch(() => { });
    }
  }, [userID]);

  const getNewUsers = useCallback((signal) => {
    if (myID) {
      return axios({
        url: `${WEB_URL}/api/getRandomUsers`,
        method: "post",
        data: { userid: myID },
        signal,
      }).then((Response) => {
        const filtered = Response.data.data.filter(u => u._id !== userID);
        setTopUsers(filtered);
      }).catch(() => { });
    }
  }, [myID, userID]);

  const handleFollow = () => {
    const msg = `${self.fname} ${self.lname} Started Following You`;
    socket.emit("sendNotification", { receiverid: userID, title: "New Follower", msg: msg });
    axios.post(`${WEB_URL}/api/addNotification`, {
      userid: userID, msg: msg, image: self.profilepic || "", title: "New Follower", date: new Date().toISOString()
    }).catch(err => console.log(err));

    axios.put(`${WEB_URL}/api/follow/${userID}`, { userId: myID })
      .then((Response) => {
        toast.success(Response.data);
        getUser();
        if (!user.followings.includes(myID.toString())) {
          handleConversation();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleUnfollow = () => {
    if (window.confirm("Do you want to Unfollow?") === true) {
      axios.put(`${WEB_URL}/api/unfollow/${userID}`, { userId: myID })
        .then((Response) => {
          toast.success(Response.data);
          getUser();
          handleConversation();
        })
        .catch((error) => console.log(error));
    }
  };

  const handleConversation = () => {
    axios.post(`${WEB_URL}/api/searchConversations`, { person1: userID, person2: myID })
      .then((Response) => {
        if (Response.data.data.length <= 0) {
          axios.post(`${WEB_URL}/api/newConversation`, { senderId: myID, receiverId: userID }).catch(console.log);
        }
      });
  };

  const formatDate = (date) => {
    if (!date) return "Present";
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleSocialClick = (link, platform) => {
    if (!link || link === "" || link === "undefined") {
      toast.info(`${platform} Not Added`, { position: "top-right", autoClose: 3000, theme: "colored" });
    } else {
      const url = link.startsWith('http') ? link : `https://${link}`;
      window.open(url, "_blank");
    }
  };

  const openFollowModal = (type) => {
    setFollowerTab(type);
    setShowFollowerModal(true);
  };

  const isAlumni = useMemo(() => {
    if (!education || education.length === 0) return false;
    const isStudying = education.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;
    let maxYear = 0;
    education.forEach(edu => {
      const d = new Date(edu.enddate);
      if (d.getFullYear() > maxYear) maxYear = d.getFullYear();
    });
    const cutoffDate = new Date(maxYear, 4, 15);
    return new Date() > cutoffDate;
  }, [education]);

  useEffect(() => {
    const controller = new AbortController();
    if (userID) {
      getSelf(controller.signal);
      getUser(controller.signal);
      getEducation(controller.signal);
      getExperience(controller.signal);
    }
    return () => controller.abort();
  }, [userID, getSelf, getUser, getEducation, getExperience]);

  useEffect(() => {
    const controller = new AbortController();
    getNewUsers(controller.signal);
    return () => controller.abort();
  }, [getNewUsers]);

  return (
    <div className="profile-wrapper">
      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-header-card">
            <div className="header-cover"></div>
            <div className="header-body">
              <div className="header-left">
                <img src={user.profilepic && user.profilepic !== "undefined" ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} alt="Profile" className="header-avatar" loading="lazy" />
                <div className="user-details">
                  <h1>{user.fname} {user.lname} {isAlumni && <span className="alumni-badge">Alumni</span>}</h1>
                  <p className="user-headline">{user.institute || "Student"}</p>
                  <p className="user-location">{user.city ? `${user.city}, ` : ""}{user.state ? `${user.state}, ` : ""}{user.nation || ""}</p>
                  <div className="user-stats">
                    <span className="stat-link" onClick={() => openFollowModal("Follower")}>{user.followers ? user.followers.length : 0} Followers</span>
                    <span className="stat-link" onClick={() => openFollowModal("Following")}>{user.followings ? user.followings.length : 0} Connections</span>
                  </div>
                  <div className="user-socials">
                    <i className="fa-brands fa-github" style={{ color: '#333' }} onClick={() => handleSocialClick(user.github, "GitHub")}></i>
                    <i className="fa-solid fa-globe" style={{ color: '#666' }} onClick={() => handleSocialClick(user.portfolioweb, "Website")}></i>
                  </div>
                </div>
              </div>
              <div className="header-actions">
                {user.followers && user.followers.includes(myID.toString()) ? (
                  <button className="action-btn btn-secondary" onClick={handleUnfollow}>Following</button>
                ) : (
                  <button className="action-btn btn-primary" onClick={handleFollow}><i className="fa-solid fa-plus"></i> Follow</button>
                )}
                <button className="action-btn btn-outline" onClick={() => nav("/message", { state: user })}><i className="fa-regular fa-message"></i> Message</button>
              </div>
            </div>
          </div>

          {user.about && ( <div className="section-card"> <h3 className="section-title">About</h3> <p className="item-desc">{user.about}</p> </div> )}

          <div className="section-card">
            <h3 className="section-title">Experience</h3>
            {experience.length > 0 ? experience.map((elem) => (
              <div key={elem._id} className="list-item">
                <img src={`${WEB_URL}${elem.companylogo}`} alt="" className="item-logo" loading="lazy" />
                <div className="item-content">
                  <h4 className="item-title">{elem.position}</h4>
                  <span className="item-subtitle">{elem.companyname} &middot; Full-time</span>
                  <span className="item-meta">{formatDate(elem.joindate)} - {formatDate(elem.enddate)}</span>
                  {elem.description && <p className="item-desc">{elem.description}</p>}
                </div>
              </div>
            )) : <p style={{ color: '#999', fontSize: '0.9rem' }}>No experience details available.</p>}
          </div>

          <div className="section-card">
            <h3 className="section-title">Education</h3>
            {education.length > 0 ? education.map((elem) => (
              <div key={elem._id} className="list-item">
                <img src={`${WEB_URL}${elem.collagelogo}`} alt="" className="item-logo" loading="lazy" />
                <div className="item-content">
                  <h4 className="item-title">{elem.institutename}</h4>
                  <span className="item-subtitle">{elem.course}</span>
                  <span className="item-meta">{elem.joindate ? elem.joindate.split("-")[0] : ""} - {elem.enddate ? elem.enddate.split("-")[0] : "Present"}</span>
                </div>
              </div>
            )) : <p style={{ color: '#999', fontSize: '0.9rem' }}>No education details available.</p>}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '15px' }}>Skills</h3>
            <div className="tag-container">{skills.length > 0 ? skills.map((skill, idx) => (<span key={idx} className="skill-tag">{skill}</span>)) : <span style={{ color: '#999', fontSize: '0.9rem' }}>No skills listed</span>}</div>
          </div>
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '15px' }}>Languages</h3>
            <div className="tag-container">{language.length > 0 ? language.map((lang, idx) => (<span key={idx} className="skill-tag">{lang}</span>)) : <span style={{ color: '#999', fontSize: '0.9rem' }}>No languages listed</span>}</div>
          </div>
          <div className="section-card">
            <h3 className="section-title" style={{ marginBottom: '15px' }}>People you may know</h3>
            {topUsers.map((elem) => (
              <div key={elem._id} className="suggestion-item">
                <img src={elem.profilepic ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png"} alt="" className="suggestion-img" loading="lazy" />
                <div className="suggestion-info"><h5>{elem.fname} {elem.lname}</h5><p>{elem.city ? elem.city : "Student"}</p></div>
                <span className="view-link" onClick={() => { setUserID(elem._id); window.scrollTo(0, 0); }}>View</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showFollowerModal && <FollowerModal closeModal={() => setShowFollowerModal(false)} user={user} getUser={getUser} initialType={followerTab} />}
    </div>
  );
}
