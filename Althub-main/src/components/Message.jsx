import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatUser from "./ChatUser";
import ChatMessage from "./ChatMessage";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

// --- INJECTED STYLES FOR MODERN UI ---
const styles = `
  .msg-page-container {
    height: calc(100vh - 80px); /* Adjust based on navbar height */
    padding: 20px 4%;
    background-color: #f3f2ef;
    display: flex;
    gap: 20px;
    font-family: 'Poppins', sans-serif;
  }

  /* --- LEFT SIDEBAR --- */
  .msg-sidebar {
    flex: 1;
    max-width: 350px;
    background: #fff;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .msg-sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
  }

  .msg-sidebar-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .msg-search-bar {
    background: #f8f9fa;
    border-radius: 50px;
    padding: 8px 15px;
    display: flex;
    align-items: center;
    border: 1px solid #eee;
    transition: all 0.3s ease;
  }

  .msg-search-bar:focus-within {
    border-color: #66bd9e;
    box-shadow: 0 0 0 3px rgba(102, 189, 158, 0.1);
    background: #fff;
  }

  .msg-search-bar input {
    border: none;
    background: transparent;
    width: 100%;
    margin-left: 10px;
    outline: none;
    color: #555;
    font-size: 0.9rem;
  }

  .msg-user-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
  }

  /* --- RIGHT CHAT AREA --- */
  .msg-chat-area {
    flex: 3;
    background: #fff;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    overflow: hidden;
    position: relative;
  }

  /* Chat Header */
  .msg-chat-header {
    padding: 15px 25px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .msg-header-user {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .msg-header-img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f0f0;
  }

  .msg-header-info h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .msg-header-status {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.3s ease;
  }

  .msg-header-status.online {
    color: #66bd9e;
  }

  .msg-header-status.offline {
    color: #999;
  }

  .msg-header-status::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
  }

  .msg-header-status.online::before {
    background: #66bd9e;
  }

  .msg-header-status.offline::before {
    background: #ccc;
  }

  .msg-back-btn {
    display: none; /* Hidden on desktop */
    font-size: 1.2rem;
    color: #555;
    cursor: pointer;
    margin-right: 15px;
  }

  /* Messages List */
  .msg-body {
    flex: 1;
    padding: 20px 30px;
    overflow-y: auto;
    background-image: radial-gradient(#66bd9e 0.5px, transparent 0.5px), radial-gradient(#66bd9e 0.5px, #fff 0.5px);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
    background-color: #fcfcfc;
    display: flex;
    flex-direction: column;
  }
  
  .msg-received {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    color: #333;
    border-radius: 0 16px 16px 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    padding: 10px 20px;
    align-self: flex-start;
    margin: 10px 0;
    max-width: 70%;
  }

  .msg-send {
    background-color: #66bd9e; /* Your theme green */
    color: #fff;
    border-radius: 16px 0 16px 16px;
    box-shadow: 0 2px 5px rgba(102, 189, 158, 0.4);
    padding: 10px 20px;
    align-self: flex-end;
    margin: 10px 0;
    max-width: 70%;
  }
  
  .msg-time {
    font-size: 11px;
    margin-top: 5px;
    opacity: 0.7;
    text-align: right;
  }

  /* Footer / Input Area */
  .msg-footer {
    padding: 15px 25px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .msg-input-wrapper {
    flex: 1;
    background: #f0f2f5;
    border-radius: 25px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
  }

  .msg-input-wrapper input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.95rem;
    color: #333;
  }

  .msg-send-btn {
    background: #66bd9e;
    color: #fff;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s;
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(102, 189, 158, 0.3);
  }

  .msg-send-btn:hover {
    background: #479378;
    transform: scale(1.05);
  }

  /* Empty State */
  .msg-empty-state {
    flex: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    color: #888;
    text-align: center;
  }

  .msg-empty-state img {
    max-width: 350px;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  /* --- RESPONSIVE --- */
  @media (max-width: 900px) {
    .msg-page-container {
      padding: 0;
      height: calc(100vh - 60px);
      gap: 0;
    }
    
    .msg-sidebar, .msg-chat-area, .msg-empty-state {
      border-radius: 0;
      box-shadow: none;
      max-width: 100%;
      height: 100%;
    }

    .msg-sidebar {
      display: ${props => props.currentId ? 'none' : 'flex'};
      width: 100%;
    }

    .msg-chat-area {
      display: ${props => props.currentId ? 'flex' : 'none'};
      width: 100%;
    }

    .msg-back-btn {
      display: block;
    }

    .msg-empty-state {
      display: none;
    }
  }
`;

export default function Message({ socket }) {
  const userid = localStorage.getItem("Althub_Id");
  const [conversationID, setConversationID] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [profilepic, setProfilepic] = useState("");
  const [user, setUser] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // --- NEW STATE ---
  const location = useLocation();
  const msgBoxRef = useRef(null);
  const [searchName, setSearchName] = useState("");

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    // We replace the pseudo-prop inside the string for the media query logic
    styleSheet.innerText = styles.replace(/\${props => props.currentId \? 'none' : 'flex'}/g, currentId ? 'none' : 'flex')
                                 .replace(/\${props => props.currentId \? 'flex' : 'none'}/g, currentId ? 'flex' : 'none');
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, [currentId]);

  // --- NEW: LISTEN FOR ONLINE USERS ---
  useEffect(() => {
    if (socket) {
        socket.on("getUsers", (users) => {
            setOnlineUsers(users);
        });
    }
  }, [socket]);

  const getConversation = useCallback(() => {
    axios({
      url: `${WEB_URL}/api/getConversations/${userid}`,
      method: "get",
    })
      .then((response) => {
        setConversationID(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [userid]);

  const getUser = useCallback(() => {
    if (userid !== "") {
      axios({
        method: "get",
        url: `${WEB_URL}/api/searchUserById/${userid}`,
      })
        .then((Response) => {
          setUser(Response.data.data[0]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [userid]);

  const searchConversation = useCallback(() => {
    if (location.state !== null) {
      axios({
        url: `${WEB_URL}/api/searchConversations`,
        method: "post",
        data: {
          person1: location.state._id,
          person2: userid,
        },
      }).then((Response) => {
        if(Response.data.data && Response.data.data.length > 0){
            setCurrentId(Response.data.data[0]._id);
        }
      });
    }
  }, [location.state, userid]);

  useEffect(() => {
    socket.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        time: data.time,
        createdAt: Date.now(),
      });
      getConversation(); 
    });

    if (location.state !== null) {
      setName(location.state.fname + " " + location.state.lname);
      setReceiverId(location.state._id);
      setProfilepic(location.state.profilepic);
      searchConversation();
    }
    getConversation();
    getUser();
  }, [location.state, socket, searchConversation, getConversation, getUser]);

  useEffect(() => {
    arrivalMessage &&
      arrivalMessage.sender === receiverId &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, receiverId]);

  const getMessages = useCallback(() => {
    if (currentId !== "") {
      axios({
        url: `${WEB_URL}/api/getMessages/${currentId}`,
        method: "get",
      })
        .then((response) => {
          setMessages(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [currentId]);

  useEffect(() => {
    getMessages();
  }, [currentId, getMessages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMsg.trim() === "") return;

    if (user && user.followings) {
        if (!user.followings.includes(receiverId)) {
            toast.error("First follow the user before messaging");
            return; 
        }
    }

    socket.emit("sendMessage", {
      senderId: userid,
      receiverId: receiverId,
      text: newMsg,
      time: new Date()
    });

    if (user && user.fname) {
      socket.emit("sendNotification", {
        receiverid: receiverId,
        title: "New Message",
        msg: `${user.fname} ${user.lname} sent you a message`,
      });
    }

    axios({
      method: "post",
      url: `${WEB_URL}/api/newMessage`,
      data: {
        conversationId: currentId,
        sender: userid,
        text: newMsg,
        time: new Date(),
        receiverId: receiverId 
      },
    })
      .then((response) => {
        getMessages();
        setNewMsg("");
        scrollToEnd();
        getConversation(); 
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  const handleBack = () => {
    setCurrentId("");
    getConversation();
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const scrollToEnd = () => {
    if (msgBoxRef.current) {
      const msgBox = msgBoxRef.current;
      msgBox.scrollTop = msgBox.scrollHeight;
    }
  }

  // --- CHECK ONLINE STATUS ---
  const isReceiverOnline = onlineUsers.some((u) => u.userId === receiverId);

  return (
    <div className="msg-page-container">
      
      {/* --- SIDEBAR LIST --- */}
      <div className="msg-sidebar">
        <div className="msg-sidebar-header">
          <div className="msg-sidebar-title">
            <Link to="/home" style={{color: '#333'}}>
                <i className="fa-solid fa-arrow-left" style={{marginRight: '10px', fontSize: '1rem'}}></i>
            </Link>
            Messages
          </div>
          <div className="msg-search-bar">
            <i className="fa-solid fa-magnifying-glass" style={{ color: "#aaa" }}></i>
            <input 
                type="text" 
                placeholder="Search people..." 
                value={searchName} 
                onChange={(e) => setSearchName(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="msg-user-list">
          {conversationID.length > 0 ? (
            conversationID.map((elem) => (
              <ChatUser
                key={elem._id}
                userid={elem}
                setCurrentId={setCurrentId}
                setName={setName}
                setProfilepic={setProfilepic}
                setReceiverId={setReceiverId}
                searchQuery={searchName}
              />
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>No conversations yet</div>
          )}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      {currentId !== "" ? (
        <div className="msg-chat-area">
          {/* Chat Header */}
          <div className="msg-chat-header">
            <div className="msg-header-user">
              <i className="fa-solid fa-arrow-left msg-back-btn" onClick={handleBack}></i>
              <img
                src={
                  profilepic && profilepic !== "" && profilepic !== "undefined"
                    ? `${WEB_URL}${profilepic}`
                    : "images/profile1.png"
                }
                alt="User"
                className="msg-header-img"
              />
              <div className="msg-header-info">
                <h3>{name}</h3>
                {/* --- DYNAMIC STATUS --- */}
                <div className={`msg-header-status ${isReceiverOnline ? 'online' : 'offline'}`}>
                    {isReceiverOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="msg-body" ref={msgBoxRef}>
            {messages.length > 0 ? (
              messages.map((elem) => (
                <ChatMessage
                  key={elem._id || Math.random()}
                  msg={elem}
                  own={userid === elem.sender ? "send" : "received"}
                />
              ))
            ) : (
              <div style={{textAlign:'center', marginTop: '50px', color: '#ccc'}}>
                Say hello to start the conversation!
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="msg-footer">
            <div className="msg-input-wrapper">
              <input
                type="text"
                placeholder="Type your message..."
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                value={newMsg}
              />
            </div>
            <button className="msg-send-btn" onClick={sendMessage}>
                <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="msg-empty-state">
          <img src="images/Messaging-bro.png" alt="No Chat Selected" />
          <h2>Select a conversation</h2>
          <p>Choose a person from the left list to start chatting.</p>
        </div>
      )}
    </div>
  );
}