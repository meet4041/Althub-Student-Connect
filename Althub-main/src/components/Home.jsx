import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

export default function Home({ socket }) {
  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [post, setPost] = useState([]);
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState([]);
  const [aids, setAids] = useState([]);
  const [fileList, setFileList] = useState(null);
  const files = fileList ? [...fileList] : [];
  const userid = localStorage.getItem("Althub_Id");

  const getUser = useCallback(() => {
    if (!userid) return;
    axios({
      method: "get",
      url: `${WEB_URL}/api/searchUserById/${userid}`,
    })
      .then((Response) => {
        if (Response.data && Response.data.data && Response.data.data[0]) {
          setUser(Response.data.data[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, [userid]);

  const getAids = useCallback(() => {
    axios({
      url: `${WEB_URL}/api/getFinancialAid`,
      method: "get",
    })
      .then((Response) => {
        setAids(Response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching financial aids:", error);
      });
  }, []);

  const getPost = useCallback(() => {
    axios({
      method: "get",
      url: `${WEB_URL}/api/getPost`,
    })
      .then((Response) => {
        setPost(Response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  const getEvents = useCallback(() => {
    axios({
      method: "get",
      url: `${WEB_URL}/api/getEvents`,
    })
      .then((Response) => {
        setEvents(Response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  useEffect(() => {
    getUser();
    getPost();
    getEvents();
    getAids();
  }, [getUser, getPost, getEvents, getAids]);

  const uploadImg = () => {
    const fileInput = document.getElementById("myFileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  const imgChange = (e) => {
    setFileList(e.target.files);
  };

  const sendNewPostNotification = () => {
    if (user && user.followers && user.followers.length > 0) {
      user.followers.forEach((followerId) => {
        socket.emit("sendNotification", {
          receiverid: followerId,
          title: "New Post",
          msg: `${user.fname} ${user.lname} added a new post`,
        });

        axios({
          url: `${WEB_URL}/api/addNotification`,
          method: "post",
          data: {
            userid: followerId,
            msg: `${user.fname} ${user.lname} added a new post`,
            image: user.profilepic || "",
            title: "New Post",
            date: new Date(),
          },
        }).catch((err) => console.log("Notification DB Error:", err));
      });
    }
  };

  const addPost = () => {
    if (!user || !user.fname || !user.lname) {
      toast.error("User data not loaded. Please refresh.");
      return;
    }
    if ((!description || description.trim() === "") && files.length === 0) {
      toast.error("Empty post not allowed!");
      return;
    }
    var body = new FormData();
    body.append("userid", localStorage.getItem("Althub_Id"));
    body.append("description", description);
    body.append("date", new Date().toISOString());
    files.forEach((file, i) => {
      body.append(`photos`, file, file.name);
    });
    body.append("fname", user.fname);
    body.append("lname", user.lname);
    body.append("profilepic", user.profilepic || "");
    
    axios({
      url: `${WEB_URL}/api/addPost`,
      method: "post",
      headers: {
        "Content-type": "multipart/form-data",
      },
      data: body,
    })
      .then((Response) => {
        toast.success("Post Uploaded!!");
        sendNewPostNotification(); 
        setFileList(null);
        setDescription("");
        getPost();
      })
      .catch((error) => {
        toast.error("Something went wrong!!");
      });
  };

  const Logout = () => {
    localStorage.clear();
    nav("/");
  };

  const handleLike = async (elem) => {
    // 1. Database Update (Toggle Like)
    await axios({
      method: "put",
      url: `${WEB_URL}/api/like/${elem._id}`,
      data: { userId: userid },
    })
    .then((response) => {
      // 2. ONLY Notify if liking someone else's post
      if (userid !== elem.userid) {
        const msg = `${user.fname} Liked Your Post`;
  
        // A. Save to Database (For Notification Page)
        axios.post(`${WEB_URL}/api/addNotification`, {
          userid: elem.userid, // Receiver
          msg: msg,
          image: user.profilepic || "", // Sender's Image
          title: "New Like",
          date: new Date().toISOString()
        });
        
        // B. Socket Emission (Optional: If you want pop-up for likes, uncomment below)
        socket.emit("sendNotification", {
          receiverid: elem.userid,
          title: "New Like",
          msg: msg,
        }); 
        
      }
      getPost(); // Refresh posts
    })
    .catch((error) => console.error("Error:", error));
  };

  const formatPostTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now - messageTime);
    const minutesDiff = Math.floor(timeDiff / 60000);
    if (minutesDiff < 1) {
      return "Just now";
    } else if (minutesDiff < 60) {
      return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
    } else if (messageTime.toDateString() === now.toDateString()) {
      const options = { hour: "numeric", minute: "numeric" };
      return `Today at ${messageTime.toLocaleTimeString("en-US", options)}`;
    } else {
      const options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return messageTime.toLocaleString("en-US", options);
    }
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = {
      hour: "numeric",
      minute: "numeric",
      timeZone: "Asia/Kolkata",
    };

    const formattedTime = date.toLocaleTimeString("en-US", options);
    return formattedTime.replace(/(\+|-)\d+:\d+/, "");
  };

  const calWidth = (aid, claimed) => {
    const ans = Number(claimed) / Number(aid) * 100;
    if (ans > 100) {
      return "100%";
    } else {
      return `${ans.toFixed(2)}%`;
    }
  }

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) > now);

  return (
    <>
      <div 
        className="home-container" 
        style={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-start", 
          gap: "20px", 
          padding: "20px",
          height: "calc(100vh - 85px)", 
          overflow: "hidden"
        }}
      >
        
        {/* Left Sidebar */}
        <div 
          className="profile-card-main" 
          style={{ flex: "0 0 280px" }}
        >
          <div className="profile-card">
            <div className="profile-card-imgbox">
              {user && user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" ? (
                <img
                  src={`${WEB_URL}${user.profilepic}`}
                  alt=""
                  className="profile-card-img"
                />
              ) : (
                <img
                  alt=""
                  src="images/profile1.png"
                  className="profile-card-img"
                />
              )}
            </div>

            <div className="profile-card-info">
              <span className="profile-card-name">
                {user.fname} {user.lname}
              </span>
            </div>
            
            {/* REMOVED: Old Go to Profile Button */}
          </div>

          <div className="menu-container">
            {/* ADDED: New Profile Menu Item (Top of list) */}
            <div
              className="menu"
              onClick={() => {
                nav("/view-profile");
                window.scrollTo(0, 0);
              }}
            >
              <i className="fa-solid fa-user"></i>Go to Profile
            </div>

            <div
              className="menu"
              onClick={() => {
                nav("/events");
              }}
            >
              <i className="fa-solid fa-calendar"></i>Events
            </div>
            <div
              className="menu"
              onClick={() => {
                nav("/scholarship");
              }}
            >
              <i className="fa-solid fa-handshake-angle"></i>Scholarship
            </div>
            <div
              className="menu"
              onClick={() => {
                nav("/feedback");
              }}
            >
              <i className="fa-solid fa-star"></i>FeedBack & Rating
            </div>
            <hr className="hr-line" />
            <div className="menu" onClick={Logout}>
              <i className="fa-solid fa-right-from-bracket"></i>Logout
            </div>
          </div>
        </div>

        {/* Center Post Feed */}
        <div 
          className="home-post-main" 
          style={{ 
            flex: "1", 
            maxWidth: "650px", 
            minWidth: "0", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            height: "100%", 
            overflowY: "auto",
            paddingBottom: "50px"
          }}
        >
          <div className="new-post-box" style={{ width: "100%" }}>
            {user && user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" ? (
              <img src={`${WEB_URL}${user.profilepic}`} alt="" />
            ) : (
              <img src="images/profile1.png" alt="" />
            )}
            <div className="new-post-content">
              <div className="new-post-text">
                <input
                  type="text"
                  placeholder="Write Here"
                  name="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
                <input
                  type="file"
                  onChange={imgChange}
                  id="myFileInput"
                  hidden
                  multiple={true}
                />
                <i className="fa-regular fa-image" onClick={uploadImg}></i>
              </div>
              {files.length > 0 ? (
                <div className="selected-img">
                  {files.map((elem, index) => (
                    <div key={index}>
                      <img src={window.URL.createObjectURL(elem)} alt="" />
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
            <button type="submit" className="new-post-btn" onClick={addPost}>
              Post
            </button>
          </div>

          <div className="post-box" style={{ width: "100%" }}>
            {post.length > 0 ? (
              <>
                {post.map((elem) => (
                  <div key={elem._id} className="post">
                    <div className="post-header">
                      <div className="post-profile">
                        <div
                          onClick={() => {
                            elem.userid === userid
                              ? nav("/view-profile")
                              : nav("/view-search-profile", {
                                state: { id: elem.userid },
                              });
                          }}
                          style={{ cursor: "pointer" }} 
                        >
                          <img
                            src={
                              elem && elem.profilepic && elem.profilepic !== "" && elem.profilepic !== "undefined"
                                ? `${WEB_URL}${elem.profilepic}`
                                : "images/profile1.png"
                            }
                            alt=""
                            className="post-profile-img"
                          />
                        </div>
                        
                        <div className="post-info" style={{ cursor: "default" }}>
                          <span className="post-name">
                            {elem.fname} {elem.lname}
                          </span>
                          <span className="post-description">
                            {formatPostTime(elem.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="post-message" style={{ cursor: "default" }}>
                        {elem.description}
                    </div>
                    
                    {elem.photos.length > 0 ? (
                      <div className="post-images">
                        <Slider {...settings}>
                          {elem.photos.map((el, idx) => (
                            <img
                              key={idx}
                              src={`${WEB_URL}${el}`}
                              alt=""
                              className="post-image"
                              onDoubleClick={() => {
                                handleLike(elem);
                              }}
                              style={{ cursor: "default" }} 
                            />
                          ))}
                        </Slider>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="likebar">
                      <i
                        className={`${elem.likes.includes(userid.toString())
                          ? "fa-solid fa-heart"
                          : "fa-regular fa-heart"
                          }`}
                        style={{
                          color: `${elem.likes.includes(userid.toString())
                            ? "#FF0000"
                            : "#000000"
                            }`,
                          cursor: "pointer" 
                        }}
                        onClick={() => {
                          handleLike(elem);
                        }}
                      ></i>
                      <span style={{ cursor: "default" }}>{elem.likes.length}</span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div 
          className="home-right-main" 
          style={{ flex: "0 0 300px" }}
        >
          <div className="event-box">
            <span>Events</span>
            <div className="upcoming-events">
              {upcomingEvents.map((elem) => (
                <div key={elem._id} className="upcoming-event">
                  <div className="event-img">
                    {elem.photos.length > 0 ? (
                      <img
                        src={`${WEB_URL}${elem.photos[0]}`}
                        alt=""
                        className="post-image"
                      />
                    ) : (
                      <img src="images/event1.png" className="post-image" alt=""></img>
                    )}
                  </div>
                  <div className="event-info">
                    <div className="event-name">{elem.title}</div>
                    <div className="event-date">
                      <i className="fa-solid fa-calendar-days"></i>
                      {formatDate(elem.date)}
                    </div>
                    <div className="event-time">
                      <i className="fa-regular fa-clock"></i>
                      {formatTime(elem.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {aids.length > 0 ?
            <div className="aid-box">
              <h2>Scholership Progress</h2>
              {aids.map((elem) =>
                <div key={elem._id} className="aid">
                  {elem.image && elem.image !== "" && elem.image !== "undefined" ?
                    <img
                      src={`${WEB_URL}${elem.image}`}
                      alt={elem.name ? `${elem.name} Profile Picture` : "User Profile Picture"}
                    />
                    :
                    <img
                      src="images/profile1.png"
                      alt="Default Profile"
                    />
                  }
                  <div className="aid-info">
                    <div className="aid-info-div">
                      <div className="name">{elem.name && elem.name}</div>
                      <div>{calWidth(elem.aid, elem.claimed)}</div>
                    </div>
                    <div className="progress-bar">
                      <div className="fill-progress-bar" style={{ width: calWidth(elem.aid, elem.claimed) }}></div>
                    </div>
                    <div className="amount">
                      <span>₹{elem.claimed}</span>
                      <span>₹{elem.aid}</span>
                    </div>
                  </div>
                </div>
              )}
            </div> : null
          }
        </div>
      </div>
    </>
  );
}