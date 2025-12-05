import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";

function ChatUser({
  userid,
  setCurrentId,
  setName,
  setProfilepic,
  setReceiverId,
}) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const myid = localStorage.getItem("Althub_Id");

  useEffect(() => {
    if (userid?.members && myid) {
      const otherUserId = userid.members.find((m) => m !== myid);
      setUserId(otherUserId);
    }
  }, [userid, myid]);

  useEffect(() => {
    if (userId !== "") {
      // 1. Fetch User Info
      axios
        .get(`${WEB_URL}/api/searchUserById/${userId}`)
        .then((response) => {
          setUser(response.data.data[0]);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });

      // 2. Fetch Unseen Count
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

  // --- CLICK HANDLER: Opens Chat & Clears Count ---
  const handleClick = () => {
    // 1. Open the Chat
    setCurrentId(userid._id);
    if (user) {
        setName(`${user.fname} ${user.lname}`);
        setProfilepic(user.profilepic);
        setReceiverId(user._id);
    }

    // 2. Clear badge locally (Immediate feedback)
    setMsgCount(0);

    // 3. Update Database (Persistent fix)
    if (userid?._id && userId) {
        axios.put(`${WEB_URL}/api/markMessagesRead/${userid._id}/${userId}`)
        .catch(err => console.log("Error marking read:", err));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="chat-user"
      onClick={handleClick} // Attach the new handler
    >
      <img
        src={
            user.profilepic && user.profilepic !== "" && user.profilepic !== "undefined" 
            ? `${WEB_URL}${user.profilepic}` 
            : "images/profile1.png"
        }
        alt="Profile"
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <span className="chat-user-name">
          {user.fname} {user.lname}
        </span>
        
        {/* Only show badge if there are unseen messages */}
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