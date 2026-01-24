import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import { toast } from "react-toastify";
import { 
  Search, SlidersHorizontal, ArrowLeft, GraduationCap, 
  Github, Globe, Check, X, Loader2 
} from 'lucide-react';
import "../styles/SearchProfile.css"; // Ensure path matches your file

export default function SearchProfile({ socket }) {
  const [name, setName] = useState("");
  const [showUsers, setShowUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const nav = useNavigate();
  
  // Modals State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [unfollowId, setUnfollowId] = useState(null); 

  // Filter State
  const [add, setAdd] = useState("");
  const [skill, setSkill] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");

  const userID = localStorage.getItem("Althub_Id");
  const [self, setSelf] = useState({});

  useEffect(() => {
    if(userID) {
      axios.get(`${WEB_URL}/api/searchUserById/${userID}`)
        .then((res) => { if (res?.data?.data) setSelf(res.data.data[0]); })
        .catch(console.error);
    }
  }, [userID]);

  const performSearch = useCallback((overrideParams = {}) => {
    setIsSearching(true);
    const payload = {
        search: overrideParams.name !== undefined ? overrideParams.name : name,
        location: overrideParams.add !== undefined ? overrideParams.add : add,
        skill: overrideParams.skill !== undefined ? overrideParams.skill : skill,
        degree: overrideParams.degree !== undefined ? overrideParams.degree : degree,
        year: overrideParams.year !== undefined ? overrideParams.year : year
    };

    axios.post(`${WEB_URL}/api/searchUser`, payload)
      .then((res) => {
        setShowUsers(res.data.data || []);
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
        setShowUsers([]);
      });
  }, [name, add, skill, degree, year]);

  useEffect(() => {
    const delay = setTimeout(() => performSearch({ name }), 300);
    return () => clearTimeout(delay);
  }, [name, performSearch]); 

  const handleFollow = (targetId) => {
    const msg = `${self.fname} ${self.lname} Started Following You`;
    if (socket) socket.emit("sendNotification", { receiverid: targetId, title: "New Follower", msg: msg });
    
    axios.post(`${WEB_URL}/api/addNotification`, { 
        userid: targetId, msg: msg, image: self.profilepic || "", title: "New Follower", date: new Date().toISOString() 
    });

    axios.put(`${WEB_URL}/api/follow/${targetId}`, { userId: userID })
        .then(() => {
            toast.success("Following!");
            performSearch(); 
            axios.post(`${WEB_URL}/api/searchConversations`, { person1: targetId, person2: userID })
            .then((res) => {
                if (res.data.data.length <= 0) {
                    axios.post(`${WEB_URL}/api/newConversation`, { senderId: userID, receiverId: targetId });
                }
            });
        })
        .catch(() => toast.error("Action failed."));
  };

  const confirmUnfollow = () => {
    if (!unfollowId) return;
    axios.put(`${WEB_URL}/api/unfollow/${unfollowId}`, { userId: userID })
        .then(() => {
            toast.info("Unfollowed.");
            setUnfollowId(null);
            performSearch();
        })
        .catch(() => { toast.error("Failed."); setUnfollowId(null); });
  };

  const getSocialLink = (input, platform) => {
    if (!input) return "#";
    let clean = input.trim();
    if (!clean.startsWith("http")) clean = `https://${clean}`;
    if (platform === 'github' && !clean.includes('github.com')) clean = `https://github.com/${input.trim()}`;
    return clean;
  };

  const isFilterActive = add || skill || degree || year;

  return (
    <div className="search-wrapper">
      <div className="search-container">
        
        {/* Header */}
        <div className="search-header">
          <button onClick={() => nav("/home")} className="back-btn">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowFilterModal(true)} 
            className={`filter-btn ${isFilterActive ? 'filter-active' : ''}`}
            title="Filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* User Grid */}
        {isSearching ? (
          <div className="empty-state">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
            <p className="text-slate-500">Searching profiles...</p>
          </div>
        ) : (
          <div className="user-grid">
            {showUsers.length > 0 ? showUsers.map((elem) => (
              // ADDED 'group' here manually to enable hover effects on children
              <div key={elem._id} className="user-card group">
                
                {/* Banner */}
                <div className="card-banner"></div>
                
                {/* Avatar */}
                <div className="card-avatar-wrapper">
                  <div className="card-avatar overflow-hidden">
                    <ProtectedImage 
                      imgSrc={elem.profilepic} 
                      defaultImage="images/profile1.png" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 
                    className="user-name" 
                    onClick={() => nav(elem._id === userID ? "/view-profile" : "/view-search-profile", { state: { id: elem._id } })}
                  >
                    {elem.fname} {elem.lname}
                  </h3>
                  
                  {elem.isAlumni && (
                    <span className="alumni-badge">
                      <GraduationCap size={12} /> Alumni
                    </span>
                  )}

                  <p className="user-role">{elem.city || "Student"}</p>
                  
                  {elem.latestCourse && (
                    <p className="user-course">{elem.latestCourse}</p>
                  )}

                  <div className="social-links">
                    {elem.github && (
                      <a href={getSocialLink(elem.github, 'github')} target="_blank" rel="noreferrer" className="social-icon">
                        <Github size={16} />
                      </a>
                    )}
                    {elem.portfolioweb && (
                      <a href={getSocialLink(elem.portfolioweb, 'web')} target="_blank" rel="noreferrer" className="social-icon">
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <button 
                    className="btn-view"
                    onClick={() => nav(elem._id === userID ? "/view-profile" : "/view-search-profile", { state: { id: elem._id } })}
                  >
                    View
                  </button>
                  
                  {elem._id !== userID && (
                    elem.followers && elem.followers.includes(userID) ? (
                      <button 
                        className="btn-following"
                        onClick={() => setUnfollowId(elem._id)}
                      >
                        <Check size={16} /> Following
                      </button>
                    ) : (
                      <button 
                        className="btn-follow"
                        onClick={() => handleFollow(elem._id)}
                      >
                        Follow
                      </button>
                    )
                  )}
                </div>

              </div>
            )) : (
              <div className="col-span-full empty-state">
                <img src="images/search-bro.png" alt="No results" className="w-48 h-48 opacity-60 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">No users found</h3>
                <p className="text-slate-400">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- FILTER MODAL --- */}
      {showFilterModal && (
        <div className="modal-overlay">
          <div className="modal-box animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="modal-title mb-0">Filter Profiles</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div>
                <label className="filter-label">Location (City/State)</label>
                <input value={add} onChange={e => setAdd(e.target.value)} className="filter-input" placeholder="e.g. Ahmedabad" />
              </div>
              <div>
                <label className="filter-label">Skill</label>
                <input value={skill} onChange={e => setSkill(e.target.value)} className="filter-input" placeholder="e.g. React" />
              </div>
              <div>
                <label className="filter-label">Degree/Course</label>
                <input value={degree} onChange={e => setDegree(e.target.value)} className="filter-input" placeholder="e.g. B.Tech" />
              </div>
              <div>
                <label className="filter-label">Year</label>
                <input value={year} onChange={e => setYear(e.target.value)} className="filter-input" placeholder="e.g. 2024" type="number" />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setAdd(""); setSkill(""); setDegree(""); setYear("");
                  performSearch({ add:"", skill:"", degree:"", year:"" });
                  setShowFilterModal(false);
                }} 
                className="btn-modal-cancel"
              >
                Clear
              </button>
              <button 
                onClick={() => { setShowFilterModal(false); performSearch(); }} 
                className="btn-modal-confirm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- UNFOLLOW CONFIRMATION MODAL --- */}
      {unfollowId && (
        <div className="modal-overlay">
          <div className="modal-box animate-fade-in">
            <h3 className="modal-title">Unfollow User?</h3>
            <p className="text-slate-500 mb-6">Are you sure you want to stop following this user? You won't see their updates anymore.</p>
            <div className="modal-actions">
              <button onClick={() => setUnfollowId(null)} className="btn-modal-cancel">
                Cancel
              </button>
              <button onClick={confirmUnfollow} className="btn-modal-danger">
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}