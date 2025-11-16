import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import axios from "axios";

function ConnectionUser({ userid ,type, getUser}) {
  const [user, setUser] = useState({});
  const myid = localStorage.getItem("Althub_Id");
  const getUser1 = () => {
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
  };

  const handleUnfollow = () => {
    if (window.confirm("Do you want to Unfollow?") === true) {
      axios({
        url: `${WEB_URL}/api/unfollow/${type==="Follower"?myid:userid}`,
        data: {
          userId: type==="Follower"?userid:myid,
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

  useEffect(() => {
    getUser1();
  }, [getUser1]);

  return (
    <>
      <div className="connection-user">
        <div>
        {user && user.profilepic !== "" ? <img src={`${WEB_URL}${user.profilepic}`} alt="" /> : <img src="images/profile1.png" alt="" />}
        <span className="chat-user-name">
          {user && user.fname ? `${user.fname} ${user.lname}` : "User"}
        </span>
        </div>
        <button className="action-button-cancel" onClick={handleUnfollow}>Remove</button>
      </div>
    </>
  );
}

export default ConnectionUser;
