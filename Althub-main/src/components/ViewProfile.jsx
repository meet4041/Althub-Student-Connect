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

export default function ViewProfile() {
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [language, setLanguage] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  // const [contactInfo, setContactInfo] = useState(false); 
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [experience, setExperience] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const closeModal1 = () => setShowModal1(false);
  const closeModal2 = () => setShowModal2(false);
  const closeModal3 = () => setShowModal3(false);
  const closeModal4 = () => setShowModal4(false);
  const closeModal5 = () => setShowModal5(false);
  const [modal, setModal] = useState("");
  const [editmenu, setEditMenu] = useState(false);
  
  const [followerTab, setFollowerTab] = useState("Follower"); 
  
  const userID = localStorage.getItem("Althub_Id");

  const getUser = useCallback((signal) => {
    return axios({
      method: "get",
      url: `${WEB_URL}/api/searchUserById/${userID}`,
      signal,
    })
      .then((Response) => {
        if (Response?.data?.data && Response.data.data[0]) {
          Response.data.data[0].languages &&
            setLanguage(JSON.parse(Response.data.data[0].languages));
          setUser(Response.data.data[0]);
          Response.data.data[0].skills &&
            setSkills(JSON.parse(Response.data.data[0].skills));
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
  }, [userID]);

  const getEducation = useCallback((signal) => {
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
  }, [userID]);

  const getExperience = useCallback((signal) => {
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
  }, [userID]);

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
          setTopUsers(Response.data.data.filter((elem) => elem._id !== user._id));
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
  }, [user]);

  const formatDate = (date) => {
    if (date === "" || date == null) {
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
      default: return "ok";
    }
  };

  const openFollowModal = (type) => {
    setFollowerTab(type);
    setShowModal5(true);
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

  // --- NEW: Alumni Check Logic ---
  const isAlumni = React.useMemo(() => {
    if (!education || education.length === 0) return false;

    // 1. If any education is marked "Present" (null enddate), they are a student
    const isStudying = education.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;

    // 2. Find the latest end year among all education entries
    let maxYear = 0;
    education.forEach(edu => {
        const d = new Date(edu.enddate);
        if (d.getFullYear() > maxYear) {
            maxYear = d.getFullYear();
        }
    });

    // 3. Logic: If current date > 15th May of that Max Year, they are Alumni
    const cutoffDate = new Date(maxYear, 4, 15); // Month 4 is May
    const now = new Date();

    return now > cutoffDate;
  }, [education]);
  // -------------------------------

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getUser(signal);
    getEducation(signal);
    getExperience(signal);

    return () => controller.abort();
  }, [getUser, getEducation, getExperience]);

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
            <div className="profile-container-inner1">
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
                
                {/* --- UPDATED HEADER WITH ALUMNI TAG --- */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1>{user.fname} {user.lname}</h1>
                    {isAlumni && (
                        <span style={{
                            backgroundColor: "#e0e0e0", 
                            color: "#555", 
                            padding: "2px 8px", 
                            borderRadius: "12px", 
                            fontSize: "12px", 
                            fontWeight: "bold",
                            border: "1px solid #ccc"
                        }}>
                            Alumni
                        </span>
                    )}
                </div>
                {/* -------------------------------------- */}

                <p>{user.institute && user.institute}</p>

                {/* Followers & Following Counts */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
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

                {/* Location & Social Icons */}
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
              <div className="edit-icon">
                <i
                  className="fa-solid fa-pencil"
                  onClick={() => setShowModal1(true)}
                ></i>
                <div className="dropdown" style={{ marginLeft: "6px" }}>
                  <i
                    className="fa-solid fa-ellipsis-vertical dropbtn"
                    onClick={() => {
                      setEditMenu(!editmenu);
                    }}
                    style={{ padding: "0 10px", cursor: "pointer" }}
                  ></i>
                  <div
                    className="dropdown-content"
                    style={{ display: `${editmenu ? "block" : "none"}` }}
                  >
                    <b onClick={() => setEditMenu(!editmenu)}>Add Details</b>
                    <hr />
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModal1(true);
                        setEditMenu(!editmenu);
                      }}
                    >
                      Profile
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setModal("Add");
                        setShowModal3(true);
                        setEditMenu(!editmenu);
                      }}
                    >
                      Education
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setModal("Add");
                        setShowModal2(true);
                        setEditMenu(!editmenu);
                      }}
                    >
                      Experience
                    </a>
                    <a
                      onClick={() => {
                        setShowModal4(true);
                        setEditMenu(!editmenu);
                      }}
                    >
                      Change Password
                    </a>
                  </div>
                </div>
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
                <div className="edit-icon">
                  <i
                    className="fa-solid fa-plus"
                    style={{ marginRight: "10px" }}
                    onClick={() => {
                      setModal("Add");
                      setShowModal2(true);
                    }}
                  ></i>
                  <i
                    className="fa-solid fa-pencil"
                    onClick={() => {
                      setModal("Edit");
                      setShowModal2(true);
                    }}
                  ></i>
                </div>
              </div>
              {experience.map((elem) => (
                <div className="profile-desc-row" key={elem._id}>
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
                <div className="edit-icon">
                  <i
                    className="fa-solid fa-plus"
                    style={{ marginRight: "10px" }}
                    onClick={() => {
                      setModal("Add");
                      setShowModal3(true);
                    }}
                  ></i>
                  <i
                    className="fa-solid fa-pencil"
                    onClick={() => {
                      setModal("Edit");
                      setShowModal3(true);
                    }}
                  ></i>
                </div>
              </div>
              {education.map((elem) => (
                <div className="profile-desc-row" key={elem._id}>
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
                      <h2>
                        {elem.fname} {elem.lname}
                      </h2>
                      <p>
                        {elem.city} {elem.state}, {elem.nation}{" "}
                      </p>
                      <a
                        onClick={() =>
                          nav("/view-search-profile", {
                            state: { id: elem._id },
                          })
                        }
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {showModal1 && (
        <EditProfileModal
          closeModal={closeModal1}
          user={user}
          getUser={getUser}
        />
      )}
      {showModal2 && (
        <EditExperienceModal
          closeModal={closeModal2}
          experience={experience}
          getExperience={getExperience}
          modal={modal}
        />
      )}
      {showModal3 && (
        <EditEducationModal
          closeModal={closeModal3}
          education={education}
          getEducation={getEducation}
          modal={modal}
        />
      )}
      {showModal4 && <ChangePasswordModal closeModal={closeModal4} />}
      {showModal5 && <FollowerModal closeModal={closeModal5} user={user} getUser={getUser} initialType={followerTab} />}
    </>
  );
}