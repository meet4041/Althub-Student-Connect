import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { useNavigate } from "react-router-dom";
import FilterModal from "./FilterModal";

// --- INJECTED STYLES ---
const styles = `
  .sp-container { padding: 30px 5%; background-color: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: 'Poppins', sans-serif; }
  .sp-header { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 40px; width: 100%; max-width: 1400px; position: sticky; top: 20px; z-index: 100; }
  .sp-search-bar { flex: 1; background: #fff; border-radius: 50px; padding: 5px 25px; display: flex; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: box-shadow 0.3s ease; border: 1px solid #eee; height: 55px; }
  .sp-search-bar:focus-within { box-shadow: 0 4px 20px rgba(102, 189, 158, 0.25); border-color: #66bd9e; }
  .sp-search-bar input { border: none; outline: none; width: 100%; margin-left: 15px; font-size: 1rem; color: #555; }
  .sp-filter-btn { background: #fff; border: none; border-radius: 50%; width: 55px; height: 55px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: #66bd9e; font-size: 1.2rem; transition: all 0.3s ease; position: relative; }
  .sp-filter-btn:hover { background: #66bd9e; color: #fff; transform: translateY(-2px); }
  .filter-active-dot { position: absolute; top: 14px; right: 14px; width: 10px; height: 10px; background-color: #ff4757; border-radius: 50%; border: 2px solid #fff; }
  .back-btn { padding: 0 25px; height: 55px; background: #fff; border-radius: 30px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: #555; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
  .back-btn:hover { background: #f1f3f5; color: #333; transform: translateY(-2px); }
  .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px; width: 100%; max-width: 1400px; }
  .sp-card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.3s ease; display: flex; flex-direction: column; position: relative; border: 1px solid #f0f0f0; }
  .sp-card:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.08); border-color: #e0e0e0; }
  .sp-banner { height: 80px; background: linear-gradient(135deg, #66bd9e 0%, #479378 100%); }
  .sp-avatar-container { display: flex; justify-content: center; margin-top: -45px; }
  .sp-avatar { width: 90px; height: 90px; border-radius: 50%; border: 4px solid #fff; object-fit: cover; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .sp-content { padding: 15px 20px 25px; text-align: center; display: flex; flex-direction: column; flex: 1; }
  .sp-name { font-size: 1.1rem; font-weight: 700; color: #333; margin: 10px 0 5px; cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; line-height: 1.3; }
  .sp-name:hover { color: #66bd9e; }
  .sp-alumni-badge { background-color: #e3f2fd; color: #1565c0; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; border: 1px solid #90caf9; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
  .sp-location { font-size: 0.85rem; color: #777; margin-bottom: 5px; min-height: 20px; }
  
  /* --- NEW STYLE FOR EDUCATION --- */
  .sp-education { font-size: 0.8rem; color: #66bd9e; font-weight: 500; margin-bottom: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .sp-socials { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
  .sp-social-icon { font-size: 1.2rem; color: #bbb; transition: color 0.3s; }
  .sp-social-icon.github:hover { color: #333; }
  .sp-social-icon.website:hover { color: #66bd9e; }
  .sp-actions { margin-top: auto; display: flex; gap: 10px; }
  .sp-btn { flex: 1; padding: 10px 0; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
  .sp-btn-view { background-color: #f8f9fa; color: #333; }
  .sp-btn-view:hover { background-color: #e9ecef; }
  .sp-btn-follow { background-color: #66bd9e; color: #fff; }
  .sp-btn-follow:hover { background-color: #57a88a; }
  .sp-btn-follow:disabled { background-color: #a5d6c5; cursor: default; }
  .sp-no-results { text-align: center; margin-top: 80px; color: #888; }
  .sp-no-results img { max-width: 250px; margin-bottom: 20px; opacity: 0.7; }
  @media (max-width: 768px) { .sp-header { flex-direction: column; position: static; } .sp-search-bar { width: 100%; } .back-btn { width: 100%; justify-content: center; } .sp-filter-btn { display: none; } }
`;

export default function SearchProfile({ socket }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const nav = useNavigate();
  const [modal, setModal] = useState(false);
  const closeModal = () => setModal(false);
  
  const [add, setAdd] = useState("");
  const [skill, setSkill] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");

  const userID = localStorage.getItem("Althub_Id");
  const [self, setSelf] = useState({});

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  useEffect(() => {
    if (userID) {
      axios.get(`${WEB_URL}/api/searchUserById/${userID}`)
        .then((Response) => { setSelf(Response.data.data[0]); })
        .catch((error) => {});
    }
  }, [userID]);

  const performSearch = (overrideParams = {}) => {
    setIsSearching(true);
    const payload = {
        search: overrideParams.name !== undefined ? overrideParams.name : name,
        location: overrideParams.add !== undefined ? overrideParams.add : add,
        skill: overrideParams.skill !== undefined ? overrideParams.skill : skill,
        degree: overrideParams.degree !== undefined ? overrideParams.degree : degree,
        year: overrideParams.year !== undefined ? overrideParams.year : year
    };

    axios.post(`${WEB_URL}/api/searchUser`, payload)
      .then((Response) => {
        const data = Response.data.data || [];
        setUsers(data);
        setShowUsers(data);
        setIsSearching(false);
      })
      .catch((error) => {
        console.log(error);
        setIsSearching(false);
        setUsers([]);
        setShowUsers([]);
      });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        performSearch({ name: name });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [name]); 

  const handleFilter = () => {
    closeModal();
    performSearch();
  };

  const getSocialLink = (input, platform) => {
    if (!input) return "#";
    let cleanInput = input.trim();
    if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) return cleanInput;
    if (platform === 'github') return `https://github.com/${cleanInput}`;
    return `https://${cleanInput}`;
  };

  return (
    <>
      <div className="sp-container">
        <div className="sp-header">
          <button className="back-btn" onClick={() => nav("/home")}><i className="fa-solid fa-arrow-left"></i> Back to Home</button>
          <div className="sp-search-bar">
            <i className="fa-sharp fa-solid fa-magnifying-glass" style={{ color: "#aaa" }}></i>
            <input type="text" placeholder="Search people by name..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="sp-filter-btn" onClick={() => setModal(true)} title="Filters">
            <i className="fa-solid fa-sliders"></i>
            {(add || skill || degree || year) && <div className="filter-active-dot"></div>}
          </button>
        </div>
        
        {isSearching && <div style={{width:'100%', textAlign:'center', marginBottom: '20px', color:'#66bd9e'}}>Searching...</div>}

        {showUsers && showUsers.length > 0 ? (
          <div className="sp-grid">
            {showUsers.map((elem) => (
              <div key={elem._id} className="sp-card">
                <div className="sp-banner"></div>
                <div className="sp-avatar-container">
                  <img
                    src={ elem.profilepic && elem.profilepic !== "" && elem.profilepic !== "undefined" ? `${WEB_URL}${elem.profilepic}` : "images/profile1.png" }
                    alt="profile"
                    className="sp-avatar"
                    loading="lazy"
                  />
                </div>
                <div className="sp-content">
                  <div className="sp-name" onClick={() => { elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } }) }}>
                    {elem.fname} {elem.lname}
                    {elem.isAlumni && ( <span className="sp-alumni-badge" title="Alumni"><i className="fa-solid fa-graduation-cap"></i> Alumni</span> )}
                  </div>
                  
                  <p className="sp-location">{elem.city ? elem.city : ""}{elem.state ? `, ${elem.state}` : ""}{(!elem.city && !elem.state) ? "Student" : ""}</p>

                  {/* --- NEW SECTION: COURSE & YEAR --- */}
                  <div className="sp-education">
                    {elem.latestCourse && (
                      <span>
                        <i className="fa-solid fa-book-open"></i> {elem.latestCourse}
                        {elem.latestYear && ` • ${elem.latestYear}`}
                      </span>
                    )}
                  </div>

                  <div className="sp-socials">
                    {elem.github && elem.github.trim() !== "" && (
                      <a href={getSocialLink(elem.github, 'github')} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-github sp-social-icon github"></i></a>
                    )}
                    {elem.portfolioweb && elem.portfolioweb.trim() !== "" && (
                      <a href={getSocialLink(elem.portfolioweb, 'website')} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-globe sp-social-icon website"></i></a>
                    )}
                  </div>

                  <div className="sp-actions">
                    <button className="sp-btn sp-btn-view" onClick={() => { elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } }) }}>View</button>
                    {elem._id !== userID && (
                      <button className="sp-btn sp-btn-follow" disabled={elem.followers && elem.followers.includes(userID)}>
                        {elem.followers && elem.followers.includes(userID) ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isSearching && (
            <div className="sp-no-results">
                <img src="images/search-bro.png" alt="No results" loading="lazy" />
                <h3>No users found</h3>
                <p>Try searching for a different name.</p>
            </div>
          )
        )}
      </div>
      
      {modal && ( 
        <FilterModal 
            closeModal={closeModal} 
            add={add} setAdd={setAdd} 
            skill={skill} setSkill={setSkill} 
            degree={degree} setDegree={setDegree} 
            year={year} setYear={setYear} 
            handleFilter={handleFilter} 
        /> 
      )}
    </>
  );
}