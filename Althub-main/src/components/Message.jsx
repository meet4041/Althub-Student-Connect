import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatUser from "./ChatUser";
import ChatMessage from "./ChatMessage";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

// --- STYLES REMAIN SAME ---
const styles = `
  .msg-page-container { height: calc(100vh - 70px); width: 100%; background: #fff; display: flex; overflow: hidden; font-family: 'Poppins', sans-serif; margin: 0; border: none; border-radius: 0; }
  .msg-sidebar { width: 350px; background: #fff; border-right: 1px solid #f0f0f0; display: flex; flex-direction: column; height: 100%; z-index: 2; }
  .msg-sidebar-header { padding: 20px 25px; border-bottom: 1px solid #f0f0f0; }
  .msg-sidebar-title { font-size: 1.4rem; font-weight: 700; color: #2d3436; margin-bottom: 15px; display: flex; align-items: center; gap: 12px; }
  .msg-search-bar { background: #f8f9fa; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center; transition: all 0.3s ease; border: 1px solid #eee; }
  .msg-search-bar:focus-within { background: #fff; border-color: #66bd9e; box-shadow: 0 2px 8px rgba(102, 189, 158, 0.1); }
  .msg-search-bar input { border: none; background: transparent; width: 100%; margin-left: 10px; outline: none; color: #333; font-size: 0.95rem; }
  .msg-user-list { flex: 1; overflow-y: auto; padding: 0; }
  .chat-user { padding: 15px 25px; border-bottom: 1px solid #f9f9f9; cursor: pointer; transition: background 0.2s; border-radius: 0; margin: 0; }
  .chat-user:hover { background-color: #f9fbfd; }
  .chat-user.active { background-color: #f0f9f6; border-right: 4px solid #66bd9e; }
  .msg-chat-area { flex: 1; display: flex; flex-direction: column; background: #ffffff; position: relative; height: 100%; }
  .msg-chat-header { height: 70px; padding: 0 30px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; background: #fff; }
  .msg-header-user { display: flex; align-items: center; gap: 15px; }
  .msg-header-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
  .msg-header-info h3 { font-size: 1.1rem; font-weight: 600; color: #2d3436; margin: 0; }
  .msg-body { flex: 1; padding: 20px 30px; overflow-y: auto; background-color: #f4f6f8; display: flex; flex-direction: column; gap: 10px; }
  .msg-user-list::-webkit-scrollbar, .msg-body::-webkit-scrollbar { width: 6px; }
  .msg-user-list::-webkit-scrollbar-thumb, .msg-body::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 3px; }
  .msg-received { align-self: flex-start; background: #fff; color: #333; padding: 12px 18px; border-radius: 0 12px 12px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); max-width: 60%; font-size: 0.95rem; line-height: 1.5; position: relative; }
  .msg-send { align-self: flex-end; background: #66bd9e; color: #fff; padding: 12px 18px; border-radius: 12px 12px 0 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); max-width: 60%; font-size: 0.95rem; line-height: 1.5; }
  .msg-time { font-size: 0.7rem; margin-top: 4px; opacity: 0.7; text-align: right; display: block; }
  .msg-footer { padding: 15px 30px; background: #fff; border-top: 1px solid #f0f0f0; display: flex; align-items: center; gap: 15px; }
  .msg-input-wrapper { flex: 1; background: #f0f2f5; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; }
  .msg-input-wrapper input { width: 100%; background: transparent; border: none; outline: none; font-size: 0.95rem; color: #333; }
  .msg-send-btn { width: 45px; height: 45px; border-radius: 50%; background: #66bd9e; color: #fff; border: none; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; }
  .msg-send-btn:hover { background: #479378; transform: scale(1.05); }
  .msg-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8f9fa; color: #b2bec3; height: 100%; }
  .msg-empty-state img { width: 250px; margin-bottom: 20px; opacity: 0.6; filter: grayscale(100%); }
  @media (max-width: 900px) { .msg-sidebar { width: 100%; display: ${props => props.currentId ? 'none' : 'flex'}; } .msg-chat-area { display: ${props => props.currentId ? 'flex' : 'none'}; } .msg-back-btn { display: block; margin-right: 15px; font-size: 1.2rem; color: #333; cursor: pointer; } }
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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const location = useLocation();
  const msgBoxRef = useRef(null);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    const styleSheet = document.createElement("style");
    const css = styles.replace(/\${props => props.currentId \? 'none' : 'flex'}/g, currentId ? 'none' : 'flex')
                      .replace(/\${props => props.currentId \? 'flex' : 'none'}/g, currentId ? 'flex' : 'none');
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, [currentId]);

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
      // OPTIMIZATION: Don't refresh whole conversation list on every msg, maybe just reorder in state if needed
      // but keeping it for consistency for now, speedup comes from backend.
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

  const isReceiverOnline = onlineUsers.some((u) => u.userId === receiverId);

  return (
    <div className="msg-page-container">
      <div className="msg-sidebar">
        <div className="msg-sidebar-header">
          <div className="msg-sidebar-title">
            <Link to="/home" style={{color: '#333'}}>
                <i className="fa-solid fa-arrow-left" style={{marginRight: '12px', fontSize: '1.1rem'}}></i>
            </Link>
            Chats
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
            <div style={{textAlign: 'center', padding: '30px', color: '#999', fontSize: '0.9rem'}}>No recent conversations</div>
          )}
        </div>
      </div>

      {currentId !== "" ? (
        <div className="msg-chat-area">
          <div className="msg-chat-header">
            <div className="msg-header-user">
              <i className="fa-solid fa-arrow-left msg-back-btn" onClick={handleBack}></i>
              {/* --- OPTIMIZATION: loading="lazy" --- */}
              <img
                src={
                  profilepic && profilepic !== "" && profilepic !== "undefined"
                    ? `${WEB_URL}${profilepic}`
                    : "images/profile1.png"
                }
                alt="User"
                className="msg-header-img"
                loading="lazy"
              />
              <div className="msg-header-info">
                <h3>{name}</h3>
              </div>
            </div>
          </div>

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
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc'}}>
                <i className="fa-regular fa-comments" style={{fontSize: '3rem', marginBottom: '10px'}}></i>
                <p>Say hello to {name}!</p>
              </div>
            )}
          </div>

          <div className="msg-footer">
            <div className="msg-input-wrapper">
              <input
                type="text"
                placeholder="Type a message..."
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                value={newMsg}
              />
            </div>
            <button className="msg-send-btn" onClick={sendMessage}><i className="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      ) : (
        <div className="msg-empty-state">
          <img src="images/Messaging-bro.png" alt="No Chat Selected" loading="lazy"/>
          <h2>Welcome to Messages</h2>
          <p>Select a conversation from the left to start chatting.</p>
        </div>
      )}
    </div>
  );
}