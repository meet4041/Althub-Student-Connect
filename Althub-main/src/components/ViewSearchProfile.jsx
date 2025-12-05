import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import FollowerModal from "./FollowerModal";

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

  useEffect(() => {
    if(location.state && location.state.id) {
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
        .catch((error) => {
          if (
            error?.code === "ERR_CANCELED" ||
            error?.message?.toLowerCase()?.includes("aborted") ||
            error?.name === "CanceledError"
          ) {
            return;
          }
        });
    }
  }, [userID]);

  const getSelf = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${myID}`,
        signal,
      })
        .then((Response) => {
          if (Response?.data?.data && Response.data.data[0]) {
            setSelf(Response.data.data[0]);
          }
        })
        .catch((error) => {
          if (
            error?.code === "ERR_CANCELED" ||
            error?.message?.toLowerCase()?.includes("aborted") ||
            error?.name === "CanceledError"
          ) {
            return;
          }
          toast.error("Something Went Wrong");
        });
    }
  }, [userID, myID]);

  const getEducation = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "post",
        url: `${WEB_URL}/api/getEducation`,
        data: {
          userid: userID,
        },
        signal,
      })
        .then((Response) => {
          setEducation(Response.data.data || []);
        })
        .catch((Error) => {
          if (
            Error?.code === "ERR_CANCELED" ||
            Error?.message?.toLowerCase()?.includes("aborted") ||
            Error?.name === "CanceledError"
          ) {
            return;
          }
          console.log(Error);
        });
    }
  }, [userID]);

  const getExperience = useCallback((signal) => {
    if (userID !== "") {
      return axios({
        method: "post",
        url: `${WEB_URL}/api/getExperience`,
        data: {
          userid: userID,
        },
        signal,
      })
        .then((Response) => {
          setExperience(Response.data.data || []);
        })
        .catch((Error) => {
          if (
            Error?.code === "ERR_CANCELED" ||
            Error?.message?.toLowerCase()?.includes("aborted") ||
            Error?.name === "CanceledError"
          ) {
            return;
          }
          console.log(Error);
        });
    }
  }, [userID]);

  const handleFollow = () => {
    socket.emit("sendNotification", {
      receiverid: userID,
      title: "New Follower",
      msg: `${self.fname} ${self.lname} Started Following You`,
    });
    axios({
      url: `${WEB_URL}/api/follow/${userID}`,
      data: {
        userId: myID,
      },
      method: "put",
    })
      .then((Response) => {
        toast(Response.data);
        getUser();
        if (!user.followings.includes(myID.toString())) {
          handleConversation();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleUnfollow = () => {
    if (window.confirm("Do you want to Unfollow?") === true) {
      axios({
        url: `${WEB_URL}/api/unfollow/${userID}`,
        data: {
          userId: myID,
        },
        method: "put",
      })
        .then((Response) => {
          toast(Response.data);
          getUser();
          handleConversation();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleConversation = () => {
    axios({
      url: `${WEB_URL}/api/searchConversations`,
      method: "post",
      data: {
        person1: userID,
        person2: myID,
      },
    }).then((Response) => {
      if (Response.data.data.length <= 0) {
        axios({
          url: `${WEB_URL}/api/newConversation`,
          data: {
            senderId: myID,
            receiverId: userID,
          },
          method: "post",
        })
          .then((Response) => {
          })
          .catch((error) => {
            console.log(error.response.data);
          });
      }
    });
  };

  const getNewUsers = useCallback((signal) => {
    if (user && Object.keys(user).length > 0 && user.institute) {
      return axios({
        url: `${WEB_URL}/api/getTopUsers`,
        method: "post",
        data: {
          institute: user.institute,
        },
        signal,
      })
        .then((Response) => {
          setTopUsers(Response.data.data.filter((elem) => elem._id !== myID && elem._id !== user._id));
        })
        .catch((err) => {
          if (
            err?.code === "ERR_CANCELED" ||
            err?.message?.toLowerCase()?.includes("aborted") ||
            err?.name === "CanceledError"
          ) {
            return;
          }
          console.error("getTopUsers error:", err?.response?.data || err?.message);
        });
    }
  }, [user, myID]);

  const formatDate = (date) => {
    if (date === "" || date === null) {
      return "Present";
    }
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    switch (month) {
      case "01": return `January ${year}`;
      case "02": return `February ${year}`;
      case "03": return `March ${year}`;
      case "04": return `April ${year}`;
      case "05": return `May ${year}`;
      case "06": return `June ${year}`;
      case "07": return `July ${year}`;
      case "08": return `August ${year}`;
      case "09": return `September ${year}`;
      case "10": return `October ${year}`;
      case "11": return `November ${year}`;
      case "12": return `December ${year}`;
      default: return "sorry"
    }
  };

  const handleSocialClick = (link, platform) => {
    if (!link || link === "" || link === "undefined") {
      toast.info(`${platform} Not Added`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      const url = link.startsWith('http') ? link : `https://${link}`; 
      window.open(url, "_blank");
    }
  };

  const openFollowModal = (type) => {
    setFollowerTab(type);
    setShowFollowerModal(true);
  };

  // --- ALUMNI CALCULATION LOGIC ---
  const isAlumni = useMemo(() => {
    if (!education || education.length === 0) return false;

    // 1. Check if user is currently studying (empty enddate)
    const isStudying = education.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;

    // 2. Find the latest graduation year
    let maxYear = 0;
    education.forEach(edu => {
        const d = new Date(edu.enddate);
        if (d.getFullYear() > maxYear) {
            maxYear = d.getFullYear();
        }
    });

    // 3. Compare with May 15th of that year
    const cutoffDate = new Date(maxYear, 4, 15); // Month 4 is May (0-indexed)
    const now = new Date();

    return now > cutoffDate;
  }, [education]);
  // --------------------------------

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    if(userID) {
      getSelf(signal);
      getUser(signal);
      getEducation(signal);
      getExperience(signal);
    }

    return () => controller.abort();
  }, [userID, getSelf, getUser, getEducation, getExperience]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getNewUsers(signal);

    return () => controller.abort();
  }, [getNewUsers]);

  return (
    <>
      <div className="container">
        <div className="profile-main">
          <div className="profile-container">
            <div className="profile-cover"></div>
            <div className="profile-container-inner">
              <div>
                {user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" ? (
                  <img
                    src={`${WEB_URL}${user.profilepic}`}
                    alt=""
                    className="profile-pic"
                  />
                ) : (
                  <img src="images/profile1.png" className="profile-pic" alt="#" />
                )}
                
                {/* --- NAME & ALUMNI TAG --- */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1>{user.fname} {user.lname}</h1>
                    
                    {/* Only show Alumni Tag if criteria met */}
                    {isAlumni && (
                        <span style={{
                            backgroundColor: "#e3f2fd", // Light blue bg
                            color: "#1976d2", // Dark blue text
                            padding: "4px 10px", 
                            borderRadius: "15px", 
                            fontSize: "12px", 
                            fontWeight: "600",
                            border: "1px solid #90caf9",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                        }}>
                            <i className="fa-solid fa-graduation-cap"></i> Alumni
                        </span>
                    )}
                </div>
                {/* ------------------------- */}

                <p>{user.institute && user.institute}</p>
                
                {/* Follower Counts */}
                <div style={{ margin: '8px 0', display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
                  <span 
                    onClick={() => openFollowModal("Follower")} 
                    style={{ cursor: "pointer", color: "#333" }}
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                  >
                    <b>{user.followers ? user.followers.length : 0}</b> Followers
                  </span>
                  <span 
                    onClick={() => openFollowModal("Following")} 
                    style={{ cursor: "pointer", color: "#333" }}
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                  >
                    <b>{user.followings ? user.followings.length : 0}</b> Following
                  </span>
                </div>

                {/* Social Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                  <p style={{ margin: 0 }}>
                    {user.city && user.city} {user.state && user.state}{" "}
                    {user.nation ? `, ${user.nation} ` : null}
                  </p>
                  
                  <i 
                    className="fa-brands fa-github" 
                    title="GitHub"
                    style={{ fontSize: '24px', cursor: 'pointer', color: '#333' }}
                    onClick={() => handleSocialClick(user.github, "GitHub")}
                  ></i>

                  <i 
                    className="fa-brands fa-linkedin" 
                    title="LinkedIn"
                    style={{ fontSize: '24px', cursor: 'pointer', color: '#0077b5' }}
                    onClick={() => handleSocialClick(user.linkedin, "LinkedIn")}
                  ></i>
                </div>

              </div>
              <div>
                {user.followers && user.followers.includes(myID.toString()) ? (
                  <button
                    className="view-profile-button1"
                    onClick={handleUnfollow}
                  >
                    Followed
                  </button>
                ) : (
                  <button
                    className="view-profile-button1"
                    onClick={handleFollow}
                  >
                    Follow
                  </button>
                )}

                {user.followers && user.followers.includes(myID.toString()) ? (
                  <button
                    className="view-profile-button2"
                    onClick={() => {
                      nav("/message", { state: user });
                    }}
                  >
                    Message
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {user.about !== "" ? (
            <div className="profile-description">
              <h2>About</h2>
              <p>{user.about}</p>
            </div>
          ) : null}

          {experience.length > 0 ? (
            <div className="profile-description">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2>Experience</h2>
              </div>
              {experience.map((elem) => (
                <div key={elem._id} className="profile-desc-row">
                  <img src={`${WEB_URL}${elem.companylogo}`} alt="" />
                  <div>
                    <h3>{elem.position}</h3>
                    <b>{elem.companyname} &middot; Full-time</b>
                    <b>
                      {formatDate(elem.joindate)} - {formatDate(elem.enddate)}
                    </b>
                    {elem.description !== "" ? (
                      <p>
                        <strong>Description :</strong> {elem.description}
                      </p>
                    ) : (
                      ""
                    )}
                    <hr />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {education.length > 0 ? (
            <div className="profile-description">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2>Education</h2>
              </div>
              {education.map((elem) => (
                <div key={elem._id} className="profile-desc-row">
                  <img src={`${WEB_URL}${elem.collagelogo}`} alt="" />
                  <div>
                    <h3>{elem.institutename}</h3>
                    <b>{elem.course}</b>
                    <b>
                      {elem.joindate.split("-")[0]} -{" "}
                      {elem.enddate.split("-")[0]}
                    </b>
                    <hr />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div className="profile-description">
              <h3>Skills</h3>
              {skills.map((elem, idx) => (
                <a key={idx} className="skills-btn">{elem}</a>
              ))}
            </div>
          ) : null}

          {language.length > 0 ? (
            <div className="profile-description">
              <h3>Language</h3>
              {language.map((elem, idx) => (
                <a key={idx} className="language-btn">{elem}</a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="profile-sidebar">
          {topUsers.length > 0 ? (
            <div className="sidebar-people">
              <h3>People you may know</h3>
              {topUsers.map((elem) => (
                <div key={elem._id}>
                  <div className="sidebar-people-row">
                    {elem.profilepic && elem.profilepic !== "" && elem.profilepic !== "undefined" ? (
                        <img src={`${WEB_URL}${elem.profilepic}`} alt="" />
                    ) : (
                        <img src="images/profile1.png" alt="" />
                    )}
                    <div>
                      <h2>{elem.fname} {elem.lname}</h2>
                      <p>{elem.city} {elem.state}, {elem.nation} </p>
                      
                      <div style={{ fontSize: "13px", color: "grey", marginBottom: "5px" }}>
                        <span style={{ marginRight: "10px" }}>
                            <b>{elem.followers ? elem.followers.length : 0}</b> Followers
                        </span>
                        <span>
                            <b>{elem.followings ? elem.followings.length : 0}</b> Following
                        </span>
                      </div>

                      <a onClick={()=> { setUserID(elem._id); window.scrollTo(0,0); }}>View Profile</a>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {showFollowerModal && (
        <FollowerModal 
          closeModal={() => setShowFollowerModal(false)} 
          user={user} 
          getUser={getUser} 
          initialType={followerTab} 
        />
      )}
    </>
  );
}