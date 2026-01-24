import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import { 
  MapPin, Globe, Edit3, MoreHorizontal, Plus, Lock, Trash2, 
  Briefcase, GraduationCap, Award, ChevronRight, UserCheck 
} from "lucide-react"; 
import "../styles/ViewProfile.css"; 

// Modals
import EditProfileModal from "./EditProfileModal";
import EditExperienceModal from "./EditExperienceModal";
import EditEducationModal from "./EditEducationModal";
import ChangePasswordModal from "./ChangePasswordModal";
import FollowerModal from "./FollowerModal";

export default function ViewProfile() {
    const nav = useNavigate();
    const [user, setUser] = useState({});
    const [language, setLanguage] = useState([]);
    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    // Modals & Menu State
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditExp, setShowEditExp] = useState(false);
    const [showEditEdu, setShowEditEdu] = useState(false);
    const [showChangePass, setShowChangePass] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // --- Ref for Dropdown Menu ---
    const menuRef = useRef(null);

    const [modalType, setModalType] = useState(""); 
    const [followerTab, setFollowerTab] = useState("Follower");
    const userID = localStorage.getItem("Althub_Id");

    // --- Click Outside Listener ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    // --- Data Fetching ---
    const getUser = useCallback(() => {
        axios.get(`${WEB_URL}/api/searchUserById/${userID}`, { withCredentials: true }).then((res) => {
            if (res.data?.data) {
                const u = res.data.data[0];
                setUser(u);
                u.languages && setLanguage(JSON.parse(u.languages));
                u.skills && setSkills(JSON.parse(u.skills));
            }
        });
    }, [userID]);

    const getEducation = useCallback(() => {
        axios.post(`${WEB_URL}/api/getEducation`, { userid: userID }, { withCredentials: true }).then((res) => setEducation(res.data.data || []));
    }, [userID]);

    const getExperience = useCallback(() => {
        axios.post(`${WEB_URL}/api/getExperience`, { userid: userID }, { withCredentials: true }).then((res) => setExperience(res.data.data || []));
    }, [userID]);

    const getNewUsers = useCallback(() => {
        axios.post(`${WEB_URL}/api/getRandomUsers`, { userid: userID }, { withCredentials: true }).then((res) => setTopUsers(res.data.data));
    }, [userID]);

    useEffect(() => {
        getUser(); getEducation(); getExperience(); getNewUsers();
    }, [getUser, getEducation, getExperience, getNewUsers]);

    // --- Handlers ---
    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            axios.delete(`${WEB_URL}/api/deleteUser/${userID}`, { withCredentials: true }).then(() => {
                toast.success("Account Deleted"); localStorage.clear(); nav("/");
            });
        }
    };

    const handleSocialClick = (link) => {
        if (!link) toast.info("Link not added");
        else window.open(link.startsWith('http') ? link : `https://${link}`, "_blank");
    };

    const isAlumni = useMemo(() => {
        if (!education.length) return false;
        let maxYear = 0;
        education.forEach(edu => {
            const d = new Date(edu.enddate);
            if (d.getFullYear() > maxYear) maxYear = d.getFullYear();
        });
        return new Date() > new Date(maxYear, 4, 15);
    }, [education]);

    const formatDate = (date) => {
        if (!date) return "Present";
        return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    return (
        <div className="vp-wrapper">
            <div className="vp-container">

                {/* LEFT COLUMN: MAIN PROFILE */}
                <div className="vp-main-col">

                    {/* Header Card */}
                    <div className="vp-header-card">
                        <div className="vp-banner"></div>

                        <div className="vp-content-wrapper">
                            {/* Avatar */}
                            <div className="vp-avatar-container">
                                <img 
                                    src={user.profilepic ? `${WEB_URL}${user.profilepic}` : "images/profile1.png"} 
                                    alt="Profile" 
                                    className="vp-avatar" 
                                />
                            </div>

                            {/* Info */}
                            <div className="vp-info">
                                <div className="vp-name-row">
                                    <div className="flex items-center">
                                        <h1 className="vp-name">{user.fname} {user.lname}</h1>
                                        {isAlumni && <span className="vp-badge"><GraduationCap size={12} /> Alumni</span>}
                                    </div>
                                    
                                    {/* Desktop Actions */}
                                    <div className="vp-actions">
                                        <button onClick={() => setShowEditProfile(true)} className="btn-secondary">
                                            <Edit3 size={16} /> Edit Profile
                                        </button>
                                        
                                        {/* Dropdown with Ref */}
                                        <div className="relative" ref={menuRef}>
                                            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-icon">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {menuOpen && (
                                                <div className="menu-dropdown">
                                                    <button onClick={() => { setModalType("Add"); setShowEditExp(true); setMenuOpen(false); }} className="menu-item">
                                                        <Briefcase size={16} /> Add Experience
                                                    </button>
                                                    <button onClick={() => { setModalType("Add"); setShowEditEdu(true); setMenuOpen(false); }} className="menu-item">
                                                        <GraduationCap size={16} /> Add Education
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button onClick={() => { setShowChangePass(true); setMenuOpen(false); }} className="menu-item">
                                                        <Lock size={16} /> Change Password
                                                    </button>
                                                    <button onClick={handleDeleteAccount} className="menu-item text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 size={16} /> Delete Account
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="vp-headline">{user.institute || "Student at AltHub University"}</p>
                                
                                <div className="vp-meta-row">
                                    <span className="vp-meta-item">
                                        <MapPin size={16} className="text-slate-400" /> 
                                        {user.city ? `${user.city}, ${user.state}` : "Location not set"}
                                    </span>
                                    {user.github && (
                                        <span onClick={() => handleSocialClick(user.github)} className="vp-meta-item cursor-pointer hover:text-teal-600">
                                            <Github size={16} /> GitHub
                                        </span>
                                    )}
                                    {user.portfolioweb && (
                                        <span onClick={() => handleSocialClick(user.portfolioweb)} className="vp-meta-item cursor-pointer hover:text-teal-600">
                                            <Globe size={16} /> Website
                                        </span>
                                    )}
                                </div>

                                <div className="vp-stats">
                                    {/* Added 'group' manually for CSS hover effects */}
                                    <div className="stat-box group" onClick={() => { setFollowerTab("Follower"); setShowFollowers(true); }}>
                                        <span className="stat-val">{user.followers?.length || 0}</span>
                                        <span className="stat-label">Followers</span>
                                    </div>
                                    <div className="stat-box group" onClick={() => { setFollowerTab("Following"); setShowFollowers(true); }}>
                                        <span className="stat-val">{user.followings?.length || 0}</span>
                                        <span className="stat-label">Followings</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    {user.about && (
                        <div className="vp-section">
                            <div className="section-header">
                                <h3 className="section-title">About</h3>
                                <button onClick={() => setShowEditProfile(true)} className="section-add-btn"><Edit3 size={18} /></button>
                            </div>
                            <p className="vp-about-text">{user.about}</p>
                        </div>
                    )}

                    {/* Experience Section */}
                    <div className="vp-section">
                        <div className="section-header">
                            <h3 className="section-title"><Briefcase size={20} className="text-teal-600" /> Experience</h3>
                            <button onClick={() => { setModalType("Add"); setShowEditExp(true); }} className="section-add-btn"><Plus size={20} /></button>
                        </div>
                        {experience.length > 0 ? experience.map(exp => (
                            <div key={exp._id} className="timeline-item">
                                <img src={exp.companylogo ? `${WEB_URL}${exp.companylogo}` : "images/Institute-Test.png"} alt="" className="timeline-logo" />
                                <div className="timeline-content">
                                    <button className="item-edit-btn" onClick={() => { setModalType("Edit"); setShowEditExp(true); }}><Edit3 size={14} /></button>
                                    <h4 className="timeline-role">{exp.position}</h4>
                                    <p className="timeline-company">{exp.companyname}</p>
                                    <span className="timeline-date">{formatDate(exp.joindate)} - {formatDate(exp.enddate)}</span>
                                    {exp.description && <p className="timeline-desc">{exp.description}</p>}
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-400 italic py-4">No experience added yet. Click + to add.</p>}
                    </div>

                    {/* Education Section */}
                    <div className="vp-section">
                        <div className="section-header">
                            <h3 className="section-title"><GraduationCap size={22} className="text-teal-600" /> Education</h3>
                            <button onClick={() => { setModalType("Add"); setShowEditEdu(true); }} className="section-add-btn"><Plus size={20} /></button>
                        </div>
                        {education.length > 0 ? education.map(edu => (
                            <div key={edu._id} className="timeline-item">
                                <img src={edu.collagelogo ? `${WEB_URL}${edu.collagelogo}` : "images/Institute-Test.png"} alt="" className="timeline-logo" />
                                <div className="timeline-content">
                                    <button className="item-edit-btn" onClick={() => { setModalType("Edit"); setShowEditEdu(true); }}><Edit3 size={14} /></button>
                                    <h4 className="timeline-role">{edu.institutename}</h4>
                                    <p className="timeline-company">{edu.course}</p>
                                    <span className="timeline-date">{formatDate(edu.joindate)} - {formatDate(edu.enddate)}</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-400 italic py-4">No education added yet. Click + to add.</p>}
                    </div>

                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="vp-sidebar-col">
                    
                    {/* Skills */}
                    <div className="sidebar-card">
                        <h4 className="sidebar-title"><Award size={18} className="text-teal-500" /> Skills</h4>
                        <div className="chip-wrapper">
                            {skills.length > 0 ? skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>) : <span className="text-xs text-slate-400">No skills added</span>}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="sidebar-card">
                        <h4 className="sidebar-title"><Globe size={18} className="text-slate-400" /> Languages</h4>
                        <div className="chip-wrapper">
                            {language.length > 0 ? language.map((l, i) => <span key={i} className="lang-chip">{l}</span>) : <span className="text-xs text-slate-400">No languages added</span>}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="sidebar-card">
                        <h4 className="sidebar-title"><UserCheck size={18} className="text-teal-500" /> People you may know</h4>
                        <div className="space-y-1">
                            {topUsers.map(u => (
                                <div key={u._id} className="suggest-item" onClick={() => nav("/view-search-profile", { state: { id: u._id } })}>
                                    <div className="flex items-center gap-3">
                                        <img src={u.profilepic ? `${WEB_URL}${u.profilepic}` : "images/profile1.png"} className="suggest-avatar" alt="" />
                                        <div className="suggest-info">
                                            <h4>{u.fname} {u.lname}</h4>
                                            <p>{u.city || "Student"}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="suggest-arrow" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* Modals */}
            {showEditProfile && <EditProfileModal closeModal={() => setShowEditProfile(false)} user={user} getUser={getUser} />}
            {showEditExp && <EditExperienceModal closeModal={() => setShowEditExp(false)} experience={experience} getExperience={getExperience} modal={modalType} />}
            {showEditEdu && <EditEducationModal closeModal={() => setShowEditEdu(false)} education={education} getEducation={getEducation} modal={modalType} />}
            {showChangePass && <ChangePasswordModal closeModal={() => setShowChangePass(false)} />}
            {showFollowers && <FollowerModal closeModal={() => setShowFollowers(false)} user={user} getUser={getUser} initialType={followerTab} />}
        </div>
    );
}