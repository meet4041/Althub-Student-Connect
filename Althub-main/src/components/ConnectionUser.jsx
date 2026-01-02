import React, { useEffect, useState, useCallback } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import "../styles/ConnectionUser.css"; // <--- New CSS Import

function ConnectionUser({ userid, type, getUser, isOwner }) {
  const [user, setUser] = useState({});
  const myid = localStorage.getItem("Althub_Id");
  const nav = useNavigate(); 

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
    if (user._id === myid) {
        nav("/view-profile");
    } else {
        nav("/view-search-profile", { state: { id: user._id } });
    }
  };

  useEffect(() => {
    getUser1();
  }, [getUser1]);

  return (
    <div className="connection-item" onClick={handleProfileClick}>
      
      <div className="connection-left">
        <ProtectedImage 
          imgSrc={user.profilepic} // Note: Changed receiverProfilePic to profilepic to match other components
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