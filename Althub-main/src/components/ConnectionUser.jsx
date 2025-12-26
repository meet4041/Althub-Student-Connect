import React, { useEffect, useState, useCallback } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";

// --- INJECTED STYLES FOR LIST ITEM ---
const styles = `
  .connection-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
    border-radius: 10px;
    margin-bottom: 5px;
    cursor: pointer;
  }

  .connection-item:hover {
    background-color: #f8f9fa;
  }

  .connection-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .connection-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
  }

  .connection-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
  }

  .remove-btn {
    padding: 5px 12px;
    border: 1px solid #ff4757;
    color: #ff4757;
    background: transparent;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: #ff4757;
    color: #fff;
  }
`;

function ConnectionUser({ userid, type, getUser, isOwner }) {
  const [user, setUser] = useState({});
  const myid = localStorage.getItem("Althub_Id");
  const nav = useNavigate(); 

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const getUser1 = useCallback(() => {
    if (userid && userid !== "") {
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
          console.log(error);
        });
    }
  }, [userid]);

  const handleUnfollow = (e) => {
    e.stopPropagation(); // Prevent triggering the profile click
    if (window.confirm("Do you want to remove this user?")) {
      axios({
        url: `${WEB_URL}/api/unfollow/${type === "Follower" ? myid : userid}`,
        data: {
          userId: type === "Follower" ? userid : myid,
        },
        method: "put",
      })
        .then((Response) => {
          getUser();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleProfileClick = () => {
    // Navigate to clicked user's profile
    if (user._id === myid) {
        nav("/view-profile");
    } else {
        nav("/view-search-profile", { state: { id: user._id } });
    }
    // Note: You might want to close the modal here too, but that requires passing closeModal prop down
  };

  useEffect(() => {
    getUser1();
  }, [getUser1]);

  return (
    <div className="connection-item" onClick={handleProfileClick}>
      
      <div className="connection-left">
        <ProtectedImage 
          imgSrc={user.receiverProfilePic} // Verify the exact field name
          defaultImage="/images/profile1.png" 
          className="connection-avatar"
          alt="User"
        />
        <span className="connection-name">
          {user && user.fname ? `${user.fname} ${user.lname}` : "User"}
        </span>
      </div>

      {isOwner && (
        <button className="remove-btn" onClick={handleUnfollow}>
          Remove
        </button>
      )}
      
    </div>
  );
}

export default ConnectionUser;