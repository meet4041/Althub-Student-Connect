import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

// --- INJECTED STYLES FOR LIST ITEM ---
const styles = `
  .chat-user-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #f9f9f9;
    width: 100%;
    box-sizing: border-box;
  }
  
  .chat-user-card:hover {
    background-color: #f0f9f6; /* Subtle green tint on hover */
  }

  .chat-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
    flex-shrink: 0; /* Prevent shrinking */
  }

  .chat-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden; /* Prevent text overflow */
  }

  .chat-username {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2d3436;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .chat-username:hover {
    color: #66bd9e; /* Theme color on name hover */
  }

  .unread-badge {
    background-color: #66bd9e;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    min-width: 22px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(102, 189, 158, 0.3);
  }
`;

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

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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

  // --- Search Filtering Logic ---
  const fullName = user ? `${user.fname} ${user.lname}`.toLowerCase() : "";
  const filter = searchQuery ? searchQuery.toLowerCase() : "";

  if (!user || (filter && !fullName.includes(filter))) {
    return null;
  }
  // ------------------------------

  return (
    <div className="chat-user-card" onClick={handleClick}>
      
      {/* Avatar */}
      <img
        src={
            user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" 
            ? `${WEB_URL}${user.profilepic}` 
            : "images/profile1.png"
        }
        alt="Profile"
        className="chat-avatar"
        onClick={handleProfileClick}
        title="View Profile"
      />
      
      {/* Info & Badge */}
      <div className="chat-info">
        <span className="chat-username">
          {user.fname} {user.lname}
        </span>
        
        {msgCount > 0 && (
          <span className="unread-badge">
            {msgCount}
          </span>
        )}
      </div>

    </div>
  );
}

export default ChatUser;