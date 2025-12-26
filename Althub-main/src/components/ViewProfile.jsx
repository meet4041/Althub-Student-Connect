import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import EditProfileModal from "./EditProfileModal";
import EditExperienceModal from "./EditExperienceModal";
import EditEducationModal from "./EditEducationModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import FollowerModal from "./FollowerModal";
import ProtectedImage from "../ProtectedImage";

// --- STYLES REMAIN SAME ---
const styles = `
  .profile-wrapper { background-color: #f3f2ef; min-height: 100vh; padding: 20px 0; font-family: 'Poppins', sans-serif; }
  .profile-content { width: 98%; max-width: 1920px; margin: 0 auto; padding: 0 10px; display: flex; gap: 25px; align-items: flex-start; }
  .profile-main { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
  .profile-header-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative; border: 1px solid #eee; }
  .header-cover { height: 120px; background: linear-gradient(135deg, #66bd9e 0%, #26a69a 100%); width: 100%; }
  .header-body { padding: 0 40px 30px; position: relative; }
  .header-avatar-wrapper { margin-top: -75px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header-avatar { width: 160px; height: 160px; border-radius: 50%; border: 6px solid #fff; object-fit: cover; background: #fff; }
  .header-actions { display: flex; gap: 12px; margin-bottom: 10px; }
  .icon-btn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid #e0e0e0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #555; transition: all 0.2s; position: relative; font-size: 1rem; }
  .icon-btn:hover { background: #f8f9fa; color: #66bd9e; border-color: #66bd9e; }
  .dropdown-menu { position: absolute; top: 110%; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); padding: 10px 0; width: 220px; z-index: 100; border: 1px solid #eee; text-align: left; }
  .dropdown-item { padding: 12px 20px; display: block; color: #555; text-decoration: none; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; }
  .dropdown-item:hover { background: #f0f9f6; color: #66bd9e; }
  .dropdown-divider { border-top: 1px solid #eee; margin: 5px 0; }
  .user-details h1 { font-size: 2rem; font-weight: 700; color: #2d3436; margin: 0; display: flex; align-items: center; gap: 15px; }
  .alumni-badge { background-color: #e3f2fd; color: #1565c0; font-size: 0.8rem; padding: 5px 12px; border-radius: 20px; font-weight: 600; border: 1px solid #90caf9; }
  .user-headline { font-size: 1.1rem; color: #636e72; margin: 5px 0 15px; }
  .user-stats { display: flex; gap: 30px; font-size: 1rem; color: #66bd9e; font-weight: 600; margin-bottom: 20px; }
  .stat-link { cursor: pointer; } .stat-link:hover { text-decoration: underline; }
  .user-socials { display: flex; gap: 20px; }
  .user-socials i { font-size: 1.6rem; cursor: pointer; transition: transform 0.2s; } .user-socials i:hover { transform: translateY(-2px); }
  .section-card { background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5; }
  .section-title { font-size: 1.3rem; font-weight: 700; color: #2d3436; margin: 0; }
  .add-btn { width: 35px; height: 35px; border-radius: 50%; background: #f0f9f6; color: #66bd9e; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; font-size: 1rem; }
  .add-btn:hover { background: #66bd9e; color: #fff; }
  .list-item { display: flex; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #f9f9f9; margin-bottom: 20px; } .list-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
  .item-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; }
  .item-content { flex: 1; }
  .item-title { font-size: 1.1rem; font-weight: 600; color: #333; margin: 0; }
  .item-subtitle { font-size: 0.95rem; color: #555; display: block; margin-bottom: 4px; }
  .item-meta { font-size: 0.9rem; color: #888; display: block; margin-bottom: 10px; }
  .item-desc { font-size: 0.95rem; color: #555; line-height: 1.6; }
  .profile-sidebar { flex: 0 0 380px; display: flex; flex-direction: column; gap: 20px; }
  .tag-container { display: flex; flex-wrap: wrap; gap: 10px; }
  .skill-tag { padding: 8px 16px; border-radius: 20px; background: #f8f9fa; color: #555; font-size: 0.9rem; font-weight: 500; border: 1px solid #eee; }
  .suggestion-item { display: flex; align-items: center; gap: 15px; margin-bottom: 18px; padding-bottom: 15px; border-bottom: 1px solid #f9f9f9; } .suggestion-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .suggestion-img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
  .suggestion-info h5 { margin: 0; font-size: 1rem; color: #333; } .suggestion-info p { margin: 0; font-size: 0.85rem; color: #888; }
  .view-link { font-size: 0.9rem; color: #66bd9e; font-weight: 600; cursor: pointer; margin-left: auto; padding: 5px 15px; background: #f0f9f6; border-radius: 20px; } .view-link:hover { background: #66bd9e; color: #fff; }
  @media (max-width: 1100px) { .profile-content { flex-direction: column; } .profile-sidebar { width: 100%; } }
`;

export default function ViewProfile() {
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [language, setLanguage] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [experience, setExperience] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [modal, setModal] = useState("");
  const [editmenu, setEditMenu] = useState(false);
  const [followerTab, setFollowerTab] = useState("Follower"); 
  const userID = localStorage.getItem("Althub_Id");

  const closeModal1 = () => setShowModal1(false);
  const closeModal2 = () => setShowModal2(false);
  const closeModal3 = () => setShowModal3(false);
  const closeModal4 = () => setShowModal4(false);
  const closeModal5 = () => setShowModal5(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      axios.delete(`${WEB_URL}/api/deleteUser/${userID}`)
        .then((response) => { toast.success("Account Deleted Successfully"); localStorage.clear(); nav("/"); })
        .catch((error) => { toast.error("Failed to delete account. Please try again."); });
    }
  };

  const getUser = useCallback((signal) => {
    return axios({ method: "get", url: `${WEB_URL}/api/searchUserById/${userID}`, signal })
      .then((Response) => {
        if (Response?.data?.data && Response.data.data[0]) {
          Response.data.data[0].languages && setLanguage(JSON.parse(Response.data.data[0].languages));
          setUser(Response.data.data[0]);
          Response.data.data[0].skills && setSkills(JSON.parse(Response.data.data[0].skills));
        }
      }).catch((error) => {});
  }, [userID]);

  const getEducation = useCallback((signal) => {
    return axios({ method: "post", url: `${WEB_URL}/api/getEducation`, data: { userid: userID }, signal })
      .then((Response) => { setEducation(Response.data.data || []); }).catch((Error) => {});
  }, [userID]);

  const getExperience = useCallback((signal) => {
    return axios({ method: "post", url: `${WEB_URL}/api/getExperience`, data: { userid: userID }, signal })
      .then((Response) => { setExperience(Response.data.data || []); }).catch((Error) => {});
  }, [userID]);

  const getNewUsers = useCallback((signal) => {
    if (userID) {
      return axios({ url: `${WEB_URL}/api/getRandomUsers`, method: "post", data: { userid: userID }, signal })
        .then((Response) => { setTopUsers(Response.data.data); }).catch((err) => {});
    }
  }, [userID]);

  const formatDate = (date) => {
    if (!date) return "Present";
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const openFollowModal = (type) => { setFollowerTab(type); setShowModal5(true); };

  const handleSocialClick = (link, platform) => {
    if (!link || link === "" || link === "undefined") { toast.info(`${platform} Not Added`, { position: "top-right", autoClose: 3000, theme: "colored" }); } 
    else { const url = link.startsWith('http') ? link : `https://${link}`; window.open(url, "_blank"); }
  };

  const isAlumni = React.useMemo(() => {
    if (!education || education.length === 0) return false;
    const isStudying = education.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;
    let maxYear = 0;
    education.forEach(edu => { const d = new Date(edu.enddate); if (d.getFullYear() > maxYear) maxYear = d.getFullYear(); });
    const cutoffDate = new Date(maxYear, 4, 15);
    return new Date() > cutoffDate;
  }, [education]);

  useEffect(() => {
    const controller = new AbortController();
    getUser(controller.signal);
    getEducation(controller.signal);
    getExperience(controller.signal);
    getNewUsers(controller.signal);
    return () => controller.abort();
  }, [getUser, getEducation, getExperience, getNewUsers]);

  return (
    <div className="profile-wrapper">
      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-header-card">
            <div className="header-cover"></div>
            <div className="header-body">
              <div className="header-avatar-wrapper">
                <ProtectedImage 
                    imgSrc={user.profilepic} 
                    defaultImage="/images/profile1.png" 
                    className="header-avatar" 
                    alt="Profile"
                  />
                <div className="header-actions">
                  <button className="icon-btn" onClick={() => setShowModal1(true)} title="Edit Profile"><i className="fa-solid fa-pencil"></i></button>
                  <div style={{position: 'relative'}}>
                    <button className="icon-btn" onClick={() => setEditMenu(!editmenu)} title="More Options"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    {editmenu && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={() => { setModal("Add"); setShowModal2(true); setEditMenu(false); }}>Add Experience</div>
                            <div className="dropdown-item" onClick={() => { setModal("Add"); setShowModal3(true); setEditMenu(false); }}>Add Education</div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item" onClick={() => { setShowModal4(true); setEditMenu(false); }}>Change Password</div>
                            <div className="dropdown-item" onClick={handleDeleteAccount} style={{color: '#ff4757'}}>Delete Account</div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="user-details">
                <h1>{user.fname} {user.lname} {isAlumni && <span className="alumni-badge">Alumni</span>}</h1>
                <p className="user-headline">{user.institute || "Student"}</p>
                <p className="item-meta" style={{marginBottom: '15px'}}>{user.city ? `${user.city}, ` : ""}{user.state ? `${user.state}, ` : ""}{user.nation || ""}</p>
                <div className="user-stats">
                  <span className="stat-link" onClick={() => openFollowModal("Follower")}>{user.followers ? user.followers.length : 0} Followers</span>
                  <span className="stat-link" onClick={() => openFollowModal("Following")}>{user.followings ? user.followings.length : 0} Connections</span>
                </div>
                <div className="user-socials">
                    <i className="fa-brands fa-github" style={{color: '#333'}} onClick={() => handleSocialClick(user.github, "GitHub")}></i>
                    <i className="fa-solid fa-globe" style={{color: '#666'}} onClick={() => handleSocialClick(user.portfolioweb, "Website")}></i>
                </div>
              </div>
            </div>
          </div>

          {user.about && (
            <div className="section-card">
              <div className="section-header"><h3 className="section-title">About</h3><div className="add-btn" onClick={() => setShowModal1(true)}><i className="fa-solid fa-pencil"></i></div></div>
              <p className="item-desc">{user.about}</p>
            </div>
          )}

          <div className="section-card">
            <div className="section-header"><h3 className="section-title">Experience</h3><div className="add-btn" onClick={() => { setModal("Add"); setShowModal2(true); }}><i className="fa-solid fa-plus"></i></div></div>
            {experience.length > 0 ? experience.map((elem) => (
              <div className="list-item" key={elem._id}>
                <img src={`${WEB_URL}${elem.companylogo}`} alt="" className="item-logo" loading="lazy" />
                <div className="item-content">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h4 className="item-title">{elem.position}</h4>
                        <i className="fa-solid fa-pencil" style={{cursor:'pointer', color:'#aaa', fontSize:'0.9rem'}} onClick={() => { setModal("Edit"); setShowModal2(true); }}></i>
                    </div>
                    <span className="item-subtitle">{elem.companyname}</span>
                    <span className="item-meta">{formatDate(elem.joindate)} - {formatDate(elem.enddate)}</span>
                    {elem.description && <p className="item-desc">{elem.description}</p>}
                </div>
              </div>
            )) : <p style={{color: '#999', fontSize: '0.9rem'}}>No experience added yet.</p>}
          </div>

          <div className="section-card">
            <div className="section-header"><h3 className="section-title">Education</h3><div className="add-btn" onClick={() => { setModal("Add"); setShowModal3(true); }}><i className="fa-solid fa-plus"></i></div></div>
            {education.length > 0 ? education.map((elem) => (
              <div className="list-item" key={elem._id}>
                <img src={`${WEB_URL}${elem.collagelogo}`} alt="" className="item-logo" loading="lazy" />
                <div className="item-content">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h4 className="item-title">{elem.institutename}</h4>
                        <i className="fa-solid fa-pencil" style={{cursor:'pointer', color:'#aaa', fontSize:'0.9rem'}} onClick={() => { setModal("Edit"); setShowModal3(true); }}></i>
                    </div>
                    <span className="item-subtitle">{elem.course}</span>
                    <span className="item-meta">{elem.joindate ? elem.joindate.split("-")[0] : ""} - {elem.enddate ? elem.enddate.split("-")[0] : "Present"}</span>
                </div>
              </div>
            )) : <p style={{color: '#999', fontSize: '0.9rem'}}>No education added yet.</p>}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="section-card">
            <h3 className="section-title" style={{fontSize: '1.2rem', marginBottom: '20px'}}>Skills</h3>
            <div className="tag-container">{skills.length > 0 ? skills.map((skill, idx) => (<span key={idx} className="skill-tag">{skill}</span>)) : <span style={{color: '#999', fontSize:'0.9rem'}}>No skills added</span>}</div>
          </div>
          <div className="section-card">
            <h3 className="section-title" style={{fontSize: '1.2rem', marginBottom: '20px'}}>Languages</h3>
            <div className="tag-container">{language.length > 0 ? language.map((lang, idx) => (<span key={idx} className="skill-tag">{lang}</span>)) : <span style={{color: '#999', fontSize:'0.9rem'}}>No languages added</span>}</div>
          </div>
          <div className="section-card">
            <h3 className="section-title" style={{fontSize: '1.2rem', marginBottom: '20px'}}>People you may know</h3>
            {topUsers.map((elem) => (
                <div key={elem._id} className="suggestion-item">
                    <img src={elem.profilepic ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png"} alt="" className="suggestion-img" loading="lazy" />
                    <div className="suggestion-info"><h5>{elem.fname} {elem.lname}</h5><p>{elem.city ? elem.city : "Student"}</p></div>
                    <span className="view-link" onClick={() => nav("/view-search-profile", { state: { id: elem._id } })}>View</span>
                </div>
            ))}
          </div>
        </div>
      </div>
      {showModal1 && <EditProfileModal closeModal={closeModal1} user={user} getUser={() => getUser(new AbortController().signal)} />}
      {showModal2 && <EditExperienceModal closeModal={closeModal2} experience={experience} getExperience={() => getExperience(new AbortController().signal)} modal={modal} />}
      {showModal3 && <EditEducationModal closeModal={closeModal3} education={education} getEducation={() => getEducation(new AbortController().signal)} modal={modal} />}
      {showModal4 && <ChangePasswordModal closeModal={closeModal4} />}
      {showModal5 && <FollowerModal closeModal={closeModal5} user={user} getUser={() => getUser(new AbortController().signal)} initialType={followerTab} />}
    </div>
  );
}