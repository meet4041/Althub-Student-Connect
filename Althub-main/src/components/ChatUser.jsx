import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

function ChatUser({
  userid,
  setCurrentId,
  setName,
  setProfilepic,
  setReceiverId,
  searchQuery // --- ACCEPTED PROP ---
}) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const myid = localStorage.getItem("Althub_Id");
  const nav = useNavigate(); 

  useEffect(() => {
    if (userid?.members && myid) {
      const otherUserId = userid.members.find((m) => m !== myid);
      setUserId(otherUserId);
    }
  }, [userid, myid]);

  useEffect(() => {
    if (userId !== "") {
      axios
        .get(`${WEB_URL}/api/searchUserById/${userId}`)
        .then((response) => {
          setUser(response.data.data[0]);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });

      if (userid?._id) {
        axios
          .get(`${WEB_URL}/api/countMessages/${userid._id}/${userId}`)
          .then((response) => {
            setMsgCount(response.data.count);
          })
          .catch((error) => {
            console.error("Error fetching message count:", error);
          });
      }
    }
  }, [userId, userid]);

  const handleClick = () => {
    setCurrentId(userid._id);
    if (user) {
        setName(`${user.fname} ${user.lname}`);
        setProfilepic(user.profilepic);
        setReceiverId(user._id);
    }
    setMsgCount(0);

    if (userid?._id && userId) {
        axios.put(`${WEB_URL}/api/markMessagesRead/${userid._id}/${userId}`)
        .catch(err => console.log("Error marking read:", err));
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation(); 
    if (user && user._id) {
        nav("/view-search-profile", { state: { id: user._id } });
    }
  };

  // --- NEW: Search Filtering Logic ---
  const fullName = user ? `${user.fname} ${user.lname}`.toLowerCase() : "";
  const filter = searchQuery ? searchQuery.toLowerCase() : "";

  // If user not loaded yet, or if search text exists and doesn't match name -> hide
  if (!user || (filter && !fullName.includes(filter))) {
    return null;
  }
  // -----------------------------------

  return (
    <div
      className="chat-user"
      onClick={handleClick} 
      style={{ cursor: "pointer" }}
    >
      <img
        src={
            user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" 
            ? `${WEB_URL}${user.profilepic}` 
            : "images/profile1.png"
        }
        alt="Profile"
        onClick={handleProfileClick} 
        style={{ cursor: "pointer" }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <span 
            className="chat-user-name"
            // onClick={handleProfileClick} 
            // onMouseOver={(e) => e.target.style.textDecoration = "underline"} 
            onMouseOut={(e) => e.target.style.textDecoration = "none"}
        >
          {user.fname} {user.lname}
        </span>
        
        {msgCount > 0 && (
          <span style={{
            backgroundColor: "#66bd9e",
            color: "white",
            borderRadius: "12px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: "bold",
            marginRight: "10px",
            minWidth: "20px",
            textAlign: "center"
          }}>
            {msgCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatUser;