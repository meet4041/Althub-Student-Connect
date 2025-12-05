import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { useNavigate } from "react-router-dom";
import FilterModal from "./FilterModal";

// --- INLINE STYLES FOR QUICK SETUP (Or move these to style.css) ---
const styles = `
  .sp-container {
    padding: 30px;
    background-color: #f8f9fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Header Section */
  .sp-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 40px;
    width: 100%;
    max-width: 800px;
  }

  .sp-search-bar {
    flex: 1;
    background: #fff;
    border-radius: 50px;
    padding: 2px 25px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    transition: box-shadow 0.3s ease;
  }

  .sp-search-bar:focus-within {
    box-shadow: 0 4px 20px rgba(102, 189, 158, 0.25);
  }

  .sp-search-bar input {
    border: none;
    outline: none;
    width: 100%;
    margin-left: 10px;
    font-size: 16px;
    color: #555;
  }

  .sp-filter-btn {
    background: #fff;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    color: #66bd9e;
    font-size: 18px;
    transition: all 0.3s ease;
    position: relative;
  }

  .sp-filter-btn:hover {
    background: #66bd9e;
    color: #fff;
    transform: translateY(-2px);
  }

  .filter-active-dot {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 8px;
    height: 8px;
    background-color: #ff4757;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  /* Grid Layout */
  .sp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
    width: 100%;
    max-width: 1200px;
  }

  /* Card Design */
  .sp-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .sp-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  }

  .sp-banner {
    height: 90px;
    background: linear-gradient(135deg, #66bd9e 0%, #479378 100%);
  }

  .sp-avatar-container {
    display: flex;
    justify-content: center;
    margin-top: -50px;
  }

  .sp-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #fff;
    object-fit: cover;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .sp-content {
    padding: 15px 20px 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .sp-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 10px 0 5px;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sp-name:hover {
    color: #66bd9e;
  }

  .sp-alumni-badge {
    background-color: #e3f2fd;
    color: #1565c0;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid #90caf9;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .sp-location {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 15px;
    min-height: 20px;
  }

  .sp-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 10px 0;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }

  .sp-stat-item {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    color: #555;
  }

  .sp-stat-item b {
    font-size: 1.1rem;
    color: #333;
  }

  .sp-socials {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .sp-social-icon {
    font-size: 1.3rem;
    color: #bbb;
    transition: color 0.3s;
  }

  .sp-social-icon.linkedin:hover { color: #0077b5; }
  .sp-social-icon.github:hover { color: #333; }

  .sp-actions {
    margin-top: auto;
    display: flex;
    gap: 10px;
  }

  .sp-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .sp-btn-view {
    background-color: #f0f2f5;
    color: #333;
  }

  .sp-btn-view:hover {
    background-color: #e4e6eb;
  }

  .sp-btn-follow {
    background-color: #66bd9e;
    color: #fff;
  }

  .sp-btn-follow:hover {
    background-color: #57a88a;
  }

  .sp-btn-follow:disabled {
    background-color: #a5d6c5;
    cursor: default;
  }

  .sp-no-results {
    text-align: center;
    margin-top: 50px;
    color: #888;
  }
  
  .sp-no-results img {
    max-width: 300px;
    margin-bottom: 20px;
    opacity: 0.8;
  }
`;

export default function SearchProfile({ socket }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState([]);
  const nav = useNavigate();
  const [modal, setModal] = useState(false);
  const closeModal = () => setModal(false);
  const [add, setAdd] = useState("");
  const [skill, setSkill] = useState("");
  const userID = localStorage.getItem("Althub_Id");
  const [self, setSelf] = useState({});

  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (userID) {
      axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${userID}`,
      })
        .then((Response) => {
          setSelf(Response.data.data[0]);
        })
        .catch((error) => {});
    }
  }, [userID]);

  useEffect(() => {
    axios({
      url: `${WEB_URL}/api/searchUser`,
      method: "post",
      data: {
        search: name,
      },
    })
      .then((Response) => {
        setUsers(Response.data.data);
        setShowUsers(Response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [name]);

  const handleFilter = () => {
    closeModal();
    setShowUsers(users.filter((elem) => {
      const cityMatch = elem.city && elem.city.toLowerCase().includes(add.toLowerCase())
      const skillreg = new RegExp(skill, "i");
      const skillsMatch = elem.skills && skillreg.test(elem.skills);
      return cityMatch && skillsMatch;
    }));
  };

  const getSocialLink = (input, platform) => {
    if (!input) return "#";
    const cleanInput = input.trim();
    if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
      return cleanInput;
    }
    if (cleanInput.startsWith("www.")) {
      return `https://${cleanInput}`;
    }
    if (platform === 'linkedin') return `https://www.linkedin.com/in/${cleanInput}`;
    if (platform === 'github') return `https://github.com/${cleanInput}`;
    return cleanInput;
  };

  return (
    <>
      <div className="sp-container">
        {/* --- Header Section --- */}
        <div className="sp-header">
          <div className="sp-search-bar">
            <i className="fa-sharp fa-solid fa-magnifying-glass" style={{ color: "#aaa" }}></i>
            <input
              type="text"
              placeholder="Search by name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className="sp-filter-btn" onClick={() => setModal(true)} title="Filters">
            <i className="fa-solid fa-sliders"></i>
            {(add || skill) && <div className="filter-active-dot"></div>}
          </button>
        </div>
        
        {/* --- Grid Section --- */}
        {showUsers && showUsers.length > 0 ? (
          <div className="sp-grid">
            {showUsers.map((elem) => (
              <div key={elem._id} className="sp-card">
                
                {/* Banner & Avatar */}
                <div className="sp-banner"></div>
                <div className="sp-avatar-container">
                  <img
                    src={
                      elem.profilepic && elem.profilepic !== "" && elem.profilepic !== "undefined"
                        ? `${WEB_URL}${elem.profilepic}`
                        : "images/profile1.png"
                    }
                    alt="profile"
                    className="sp-avatar"
                  />
                </div>

                {/* Content */}
                <div className="sp-content">
                  
                  {/* Name & Badge */}
                  <h2 
                    className="sp-name"
                    onClick={() => {
                      elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } })
                    }}
                  >
                    {elem.fname} {elem.lname}
                    {elem.isAlumni && (
                      <span className="sp-alumni-badge" title="Alumni">
                        <i className="fa-solid fa-graduation-cap"></i> Alumni
                      </span>
                    )}
                  </h2>

                  {/* Location */}
                  <p className="sp-location">
                    {elem.city ? elem.city : ""}{elem.state ? `, ${elem.state}` : ""}
                    {(!elem.city && !elem.state) ? "Location not added" : ""}
                  </p>
                  
                  {/* Social Icons */}
                  <div className="sp-socials">
                    {elem.linkedin && elem.linkedin.trim() !== "" && (
                      <a href={getSocialLink(elem.linkedin, 'linkedin')} target="_blank" rel="noopener noreferrer">
                        <i className="fa-brands fa-linkedin-in sp-social-icon linkedin"></i>
                      </a>
                    )}
                    {elem.github && elem.github.trim() !== "" && (
                      <a href={getSocialLink(elem.github, 'github')} target="_blank" rel="noopener noreferrer">
                        <i className="fa-brands fa-github sp-social-icon github"></i>
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="sp-actions">
                    <button
                      className="sp-btn sp-btn-view"
                      onClick={() => {
                        elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } })
                      }}
                    >
                      View Profile
                    </button>
                    {elem._id !== userID && (
                      <button
                        className="sp-btn sp-btn-follow"
                        disabled={elem.followers && elem.followers.includes(userID)}
                      >
                        {elem.followers && elem.followers.includes(userID) ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sp-no-results">
            <img src="images/search-bro.png" alt="No results"/>
            <h3>No users found</h3>
            <p>Try adjusting your search or filters to find more people.</p>
          </div>
        )}
      </div>
      
      {modal && (
        <FilterModal
          closeModal={closeModal}
          add={add}
          setAdd={setAdd}
          skill={skill}
          setSkill={setSkill}
          handleFilter={handleFilter}
        />
      )}
    </>
  );
}