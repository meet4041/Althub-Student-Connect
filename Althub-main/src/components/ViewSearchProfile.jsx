import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import FollowerModal from "./FollowerModal";
import ProtectedImage from "../ProtectedImage";
import { 
  MapPin, Globe, MessageSquare, Star, UserPlus, UserCheck, 
  Briefcase, GraduationCap, Award, Globe as GlobeIcon 
} from "lucide-react"; 
import "../styles/ViewSearchProfile.css"; 

export default function ViewSearchProfile({ socket }) {
  const location = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [language, setLanguage] = useState([]);
  const myID = localStorage.getItem("Althub_Id");
  const [userID, setUserID] = useState("");
  const [self, setSelf] = useState({});
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  const [followerTab, setFollowerTab] = useState("Follower");
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => { if (location.state && location.state.id) setUserID(location.state.id); }, [location.state]);

  const getUser = useCallback((signal) => {
    if (userID) {
      axios.get(`${WEB_URL}/api/searchUserById/${userID}`, { signal }).then((res) => {
        if (res.data.data) {
          setUser(res.data.data[0]);
          res.data.data[0].skills && setSkills(JSON.parse(res.data.data[0].skills));
          res.data.data[0].languages && setLanguage(JSON.parse(res.data.data[0].languages));
        }
      });
    }
  }, [userID]);

  const getSelf = useCallback((signal) => {
    if (userID) axios.get(`${WEB_URL}/api/searchUserById/${myID}`, { signal }).then((res) => { if (res.data.data) setSelf(res.data.data[0]); });
  }, [userID, myID]);

  const getEducation = useCallback((signal) => {
    if (userID) axios.post(`${WEB_URL}/api/getEducation`, { userid: userID }, { signal }).then((res) => setEducation(res.data.data || []));
  }, [userID]);

  const getExperience = useCallback((signal) => {
    if (userID) axios.post(`${WEB_URL}/api/getExperience`, { userid: userID }, { signal }).then((res) => setExperience(res.data.data || []));
  }, [userID]);

  const handleFollow = () => {
    const msg = `${self.fname} ${self.lname} Started Following You`;
    if (socket) socket.emit("sendNotification", { receiverid: userID, title: "New Follower", msg });
    axios.post(`${WEB_URL}/api/addNotification`, { userid: userID, msg, image: self.profilepic || "", title: "New Follower", date: new Date().toISOString() });

    axios.put(`${WEB_URL}/api/follow/${userID}`, { userId: myID }).then((res) => {
        toast.success(res.data);
        getUser();
        if (!user.followings.includes(myID.toString())) axios.post(`${WEB_URL}/api/newConversation`, { senderId: myID, receiverId: userID });
    });
  };

  const confirmUnfollow = () => {
    axios.put(`${WEB_URL}/api/unfollow/${userID}`, { userId: myID }).then(() => {
        toast.info("Unfollowed successfully.");
        setShowUnfollowModal(false);
        getUser();
    });
  };

  const handleGiveFeedback = () => {
    if (user.followers && user.followers.includes(myID.toString())) nav("/feedback", { state: { selectedUserId: user._id } });
    else toast.error("You must follow this user to give feedback!");
  };

  const isAlumni = useMemo(() => {
    if (!education.length) return false;
    let maxYear = 0;
    education.forEach(edu => { const d = new Date(edu.enddate); if (d.getFullYear() > maxYear) maxYear = d.getFullYear(); });
    return new Date() > new Date(maxYear, 4, 15);
  }, [education]);

  const formatDate = (date) => {
      if (!date) return "Present";
      return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  useEffect(() => {
    const controller = new AbortController();
    if (userID) { getSelf(controller.signal); getUser(controller.signal); getEducation(controller.signal); getExperience(controller.signal); }
    return () => controller.abort();
  }, [userID, getSelf, getUser, getEducation, getExperience]);

  return (
    <div className="vsp-wrapper">
      <div className="vsp-container">

        {/* LEFT COLUMN */}
        <div className="vsp-main-col">

            {/* Header Card */}
            <div className="vsp-header-card">
                <div className="vsp-banner"></div>

                <div className="vsp-content-wrapper">
                    {/* Avatar */}
                    <div className="vsp-avatar-container">
                        <img 
                            src={user.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} 
                            alt="Profile" 
                            className="vsp-avatar" 
                        />
                    </div>

                    {/* Info */}
                    <div className="vsp-info">
                        <div className="vsp-name-row">
                            <div className="flex items-center">
                                <h1 className="vsp-name">{user.fname} {user.lname}</h1>
                                {isAlumni && <span className="vsp-badge"><GraduationCap size={12} /> Alumni</span>}
                            </div>
                            
                            {/* Actions */}
                            <div className="vsp-actions">
                                {user.followers && user.followers.includes(myID.toString()) ? (
                                    <button onClick={() => setShowUnfollowModal(true)} className="btn-following">
                                        <UserCheck size={18} /> Following
                                    </button>
                                ) : (
                                    <button onClick={handleFollow} className="btn-follow">
                                        <UserPlus size={18} /> Follow
                                    </button>
                                )}
                                <button onClick={() => nav("/message", { state: user })} className="btn-secondary">
                                    <MessageSquare size={18} /> Message
                                </button>
                                <button onClick={handleGiveFeedback} className="btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50">
                                    <Star size={18} /> Feedback
                                </button>
                            </div>
                        </div>

                        <p className="vsp-headline">{user.institute || "Student at AltHub University"}</p>
                        
                        <div className="vsp-meta-row">
                            <span className="vsp-meta-item">
                                <MapPin size={16} className="text-slate-400" /> 
                                {user.city ? `${user.city}, ${user.state}` : "Location not set"}
                            </span>
                            {user.portfolioweb && (
                                <a href={user.portfolioweb} target="_blank" rel="noreferrer" className="vsp-meta-item hover:text-teal-600">
                                    <Globe size={16} /> Website
                                </a>
                            )}
                        </div>

                        <div className="vsp-stats">
                            {/* Added 'group' manually */}
                            <div className="stat-box group" onClick={() => { setFollowerTab("Follower"); setShowFollowerModal(true); }}>
                                <span className="stat-val">{user.followers?.length || 0}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat-box group" onClick={() => { setFollowerTab("Following"); setShowFollowerModal(true); }}>
                                <span className="stat-val">{user.followings?.length || 0}</span>
                                <span className="stat-label">Followings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            {user.about && (
                <div className="vsp-section">
                    <div className="section-header">
                        <h3 className="section-title">About</h3>
                    </div>
                    <p className="vsp-about-text">{user.about}</p>
                </div>
            )}

            {/* Experience Section */}
            <div className="vsp-section">
                <div className="section-header">
                    <h3 className="section-title"><Briefcase size={20} className="text-teal-600" /> Experience</h3>
                </div>
                {experience.length > 0 ? experience.map(exp => (
                    <div key={exp._id} className="timeline-item">
                        <img src={exp.companylogo ? `${WEB_URL}${exp.companylogo}` : "images/Institute-Test.png"} alt="" className="timeline-logo" />
                        <div className="timeline-content">
                            <h4 className="timeline-role">{exp.position}</h4>
                            <p className="timeline-company">{exp.companyname}</p>
                            <span className="timeline-date">{formatDate(exp.joindate)} - {formatDate(exp.enddate)}</span>
                            {exp.description && <p className="timeline-desc">{exp.description}</p>}
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-400 italic py-4">No experience added.</p>}
            </div>

            {/* Education Section */}
            <div className="vsp-section">
                <div className="section-header">
                    <h3 className="section-title"><GraduationCap size={22} className="text-teal-600" /> Education</h3>
                </div>
                {education.length > 0 ? education.map(edu => (
                    <div key={edu._id} className="timeline-item">
                        <img src={edu.collagelogo ? `${WEB_URL}${edu.collagelogo}` : "images/Institute-Test.png"} alt="" className="timeline-logo" />
                        <div className="timeline-content">
                            <h4 className="timeline-role">{edu.institutename}</h4>
                            <p className="timeline-company">{edu.course}</p>
                            <span className="timeline-date">{formatDate(edu.joindate)} - {formatDate(edu.enddate)}</span>
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-400 italic py-4">No education added.</p>}
            </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="vsp-sidebar-col">
            
            {/* Skills */}
            <div className="sidebar-card">
                <h4 className="sidebar-title"><Award size={18} className="text-teal-500" /> Skills</h4>
                <div className="chip-wrapper">
                    {skills.length > 0 ? skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>) : <span className="text-xs text-slate-400">No skills added</span>}
                </div>
            </div>

            {/* Languages */}
            <div className="sidebar-card">
                <h4 className="sidebar-title"><GlobeIcon size={18} className="text-slate-400" /> Languages</h4>
                <div className="chip-wrapper">
                    {language.length > 0 ? language.map((l, i) => <span key={i} className="lang-chip">{l}</span>) : <span className="text-xs text-slate-400">No languages added</span>}
                </div>
            </div>

        </div>

      </div>

      {/* Unfollow Confirmation Modal */}
      {showUnfollowModal && (
        <div className="modal-overlay">
            <div className="modal-box animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Unfollow {user.fname}?</h3>
                <p className="text-slate-500 mb-6">Are you sure you want to stop following this user?</p>
                <div className="modal-actions">
                    <button onClick={() => setShowUnfollowModal(false)} className="btn-modal-cancel">Cancel</button>
                    <button onClick={confirmUnfollow} className="btn-modal-danger">Unfollow</button>
                </div>
            </div>
        </div>
      )}

      {showFollowerModal && <FollowerModal closeModal={() => setShowFollowerModal(false)} user={user} getUser={getUser} initialType={followerTab} />}
    </div>
  );
}