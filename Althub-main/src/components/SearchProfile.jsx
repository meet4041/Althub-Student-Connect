import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { useNavigate } from "react-router-dom";
import FilterModal from "./FilterModal";

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
    if (userID) {
      axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${userID}`,
      })
        .then((Response) => {
          setSelf(Response.data.data[0]);
        })
        .catch((error) => {
        });
    }
  }, [userID]);

  const handleFollow = (targetUser) => {
    if (!socket) return toast("Socket not connected");
    if (!self || !self.fname || !self.lname) {
      return toast.error("User data not loaded. Please try again.");
    }
    socket.emit("sendNotification", {
      receiverid: targetUser._id,
      title: "New Follower",
      msg: `${self.fname} ${self.lname} Started Following You`,
    });
    axios({
      url: `${WEB_URL}/api/follow/${targetUser._id}`,
      data: {
        userId: userID,
      },
      method: "put",
    })
      .then((Response) => {
        toast(Response.data);
        setShowUsers((prev) => prev.map(u => u._id === targetUser._id ? { ...u, followers: [...(u.followers || []), userID] } : u));
        axios({
          url: `${WEB_URL}/api/addNotification`,
          method: "post",
          data: {
            userid: targetUser._id,
            msg: `${self.fname} ${self.lname} Started Following You`,
            image: self.profilepic || "",
            title: "New Follower",
            date: new Date(),
          },
        });
      })
      .catch((error) => {
        toast.error("Failed to follow");
      });
  };

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
      <div className="body1">
        <div className="search-hearder">
          <div className="search-box">
            <i
              className="fa-sharp fa-solid fa-magnifying-glass"
              style={{ color: "#787878" }}
            ></i>
            <input
              type="text"
              placeholder="search"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <i className="fa-solid fa-filter" onClick={() => setModal(true)}></i>
            {add || skill ? <i
              className="fa-solid fa-circle"
              style={{
                color: "#ff0000",
                fontSize: "6px",
                position: "absolute",
                marginLeft: "2px",
              }}
            ></i> : null}
          </div>
        </div>
        
        {showUsers && showUsers.length > 0 ? (
          <div className="card-wrapper">
            {showUsers.map((elem) => (
              <div key={elem._id} className="card">
                <div className="image-content">
                  <span className="overlay"></span>
                  <div className="card-image">
                    {elem.profilepic && elem.profilepic !== "" && elem.profilepic !== "undefined" ? (
                      <img
                        src={`${WEB_URL}${elem.profilepic}`}
                        alt="profile"
                        className="card-img"
                      />
                    ) : (
                      <img src="images/profile1.png" className="card-img" alt="#" />
                    )}
                  </div>
                </div>
                <div className="card-content">
                  
                  {/* --- NAME & ALUMNI TAG --- */}
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <h2 className="name"
                        style={{cursor:'pointer', margin: 0}}
                        onClick={() => {
                        elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } })
                        }
                        }>
                        {elem.fname} {elem.lname}
                    </h2>
                    
                    {/* Alumni Tag Logic */}
                    {elem.isAlumni && (
                        <span style={{
                            backgroundColor: "#e3f2fd", 
                            color: "#1976d2", 
                            padding: "2px 8px", 
                            borderRadius: "10px", 
                            fontSize: "10px", 
                            fontWeight: "600",
                            border: "1px solid #90caf9",
                            marginTop: "4px"
                        }}>
                            Alumni
                        </span>
                    )}
                  </div>
                  {/* ------------------------- */}

                  <p>
                    {elem.city && elem.city} {elem.state && elem.state}{" "}
                    {elem.nation ? `, ${elem.nation} ` : null}
                  </p>
                  
                  <div className="nav">
                    <ul>
                      {elem.linkedin && elem.linkedin.trim() !== "" && (
                        <li>
                          <a 
                            href={getSocialLink(elem.linkedin, 'linkedin')}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginRight: '8px' }}
                          >
                            <i
                              className="fa-brands fa-linkedin-in"
                              style={{ color: "#7e7f81" }}
                            ></i>
                          </a>
                        </li>
                      )}
                      
                      {elem.github && elem.github.trim() !== "" && (
                        <li>
                          <a 
                            href={getSocialLink(elem.github, 'github')}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginRight: '8px' }}
                          >
                            <i
                              className="fa-brands fa-github"
                              style={{ color: "#7e7f81" }}
                            ></i>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      className="btn-more"
                      onClick={() => {
                        elem._id === userID ? nav("/view-profile") : nav("/view-search-profile", { state: { id: elem._id } })
                      }}
                    >
                      View Profile
                    </button>
                    {elem._id !== userID && (
                      <button
                        className="view-profile-button1"
                        style={{ minWidth: 90 }}
                        onClick={() => handleFollow(elem)}
                        disabled={elem.followers && elem.followers.includes(userID)}
                      >
                        {elem.followers && elem.followers.includes(userID) ? "Followed" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="no-search">
              <img src="images/search-bro.png" className="no-search-img" alt="no-image"/>
              <span>"Connecting You with the Right People"</span>
            </div>
          </>
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