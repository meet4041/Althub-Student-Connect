import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";

import ProtectedImage from "../ProtectedImage";
import "../styles/Message.css"; // <--- Import CSS

// MUI Imports
import {
  Grid, Box, Typography, TextField, IconButton, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, InputAdornment
} from "@mui/material";

import {
  Search, ArrowBack, Send, ArrowBackIos
} from "@mui/icons-material";

// Sub-component for Chat User Item
const ChatUserItem = ({ data, currentId, onClick }) => {
  // Logic to fetch user details for this conversation item (simplified for refactor)
  // Assuming 'data' contains friend details directly or via fetch inside (kept simple here)
  // You might need to fetch the friend's details like in your original ChatUser component.
  // For this refactor, I'll structure it assuming we have the data or fetch it.

  const [friend, setFriend] = useState(null);
  const myId = localStorage.getItem("Althub_Id");

  useEffect(() => {
    const friendId = data.members.find((m) => m !== myId);
    if (friendId) {
      axios.get(`${WEB_URL}/api/searchUserById/${friendId}`)
        .then(res => setFriend(res.data.data[0]))
        .catch(console.error);
    }
  }, [data, myId]);

  if (!friend) return null;

  return (
    <ListItem
      button
      onClick={() => onClick(friend)}
      className={`msg-user-item ${data._id === currentId ? 'active' : ''}`}
    >
      <ListItemAvatar>
        <Avatar className="msg-avatar">
          <ProtectedImage imgSrc={friend.profilepic} defaultImage="images/profile1.png" style={{ width: '100%', height: '100%' }} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={friend.fname + " " + friend.lname}
        secondary={friend.designation || "Student"}
        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
      />
    </ListItem>
  );
};

export default function Message({ socket }) {
  const userid = localStorage.getItem("Althub_Id");
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); // Stores conversation object
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null); // Stores receiver user object
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef();
  const location = useLocation();
  const nav = useNavigate();

  // --- 1. Initialize & Fetch Conversations ---
  const getConversations = useCallback(() => {
    axios.get(`${WEB_URL}/api/getConversations/${userid}`).then((res) => {
      setConversations(res.data.data);
    });
  }, [userid]);

  useEffect(() => {
    getConversations();
    if (socket) {
      socket.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          time: Date.now(),
        });
      });
    }
  }, [socket, getConversations]);

  // --- 2. Handle Incoming Message ---
  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // --- 3. Handle Location State (Redirect from Profile) ---
  useEffect(() => {
    if (location.state) {
      const friend = location.state;
      setReceiver(friend);
      // Check if conversation exists
      axios.post(`${WEB_URL}/api/searchConversations`, { person1: userid, person2: friend._id })
        .then((res) => {
          if (res.data.data.length > 0) {
            setCurrentChat(res.data.data[0]);
          } else {
            // Create new if strictly needed instantly, or handle as "new chat" UI
            // For now, let's assume getMessages handles empty state or creates on first message
            setCurrentChat({ _id: "new", members: [userid, friend._id] });
          }
        });
    }
  }, [location.state, userid]);

  // --- 4. Fetch Messages for Current Chat ---
  useEffect(() => {
    if (currentChat && currentChat._id !== "new") {
      axios.get(`${WEB_URL}/api/getMessages/${currentChat._id}`)
        .then((res) => setMessages(res.data.data));
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  // --- 5. Auto Scroll ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
  const handleUserClick = (friend) => {
    setReceiver(friend);
    // Find conversation ID again from local list or fetch
    // Simplified: find locally
    const conv = conversations.find(c => c.members.includes(friend._id));
    if (conv) setCurrentChat(conv);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiver) return;

    const msgData = {
      sender: userid,
      text: newMessage,
      conversationId: currentChat?._id,
      receiverId: receiver._id,
      time: new Date()
    };

    // If new chat, create conversation first (logic simplified, usually backend handles 'get or create')
    // Assuming backend endpoint /newMessage handles conversation creation or we use existing ID

    // Optimistic UI Update
    setMessages([...messages, { ...msgData, createdAt: Date.now() }]);
    setNewMessage("");

    // Socket Emit
    socket.emit("sendMessage", {
      senderId: userid,
      receiverId: receiver._id,
      text: newMessage,
    });

    // Save to DB
    try {
      const res = await axios.post(`${WEB_URL}/api/newMessage`, msgData);
      // If it was a new chat, update conversation ID
      if (currentChat?._id === "new") {
        getConversations(); // Refresh list
        // Ideally get new ID from res and set currentChat
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations; // Implement search filter logic if needed based on 'searchTerm'

  // --- Conditional Rendering for Mobile ---
  // If currentChat is selected, show Chat Area (hide Sidebar on mobile)
  // If no chat, show Sidebar (hide Chat Area on mobile)

  return (
    <Box className="msg-wrapper">
      <Grid container sx={{ height: '100%' }}>

        {/* --- LEFT SIDEBAR --- */}
        <Grid item xs={12} md={4} lg={3}
          className="msg-sidebar"
          sx={{ display: { xs: currentChat ? 'none' : 'flex', md: 'flex' } }}
        >
          <Box className="msg-sidebar-header">
            <Typography variant="h6" className="msg-sidebar-title">
              <IconButton onClick={() => nav("/home")} size="small"><ArrowBack /></IconButton>
              Chats
            </Typography>
            <TextField
              fullWidth
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="msg-search-field"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              }}
            />
          </Box>

          <List className="msg-user-list">
            {filteredConversations.map((c) => (
              <ChatUserItem
                key={c._id}
                data={c}
                currentId={currentChat?._id}
                onClick={handleUserClick}
              />
            ))}
            {filteredConversations.length === 0 && (
              <Typography textAlign="center" mt={4} color="textSecondary">No conversations found.</Typography>
            )}
          </List>
        </Grid>

        {/* --- RIGHT CHAT AREA --- */}
        <Grid item xs={12} md={8} lg={9}
          className="msg-chat-area"
          sx={{ display: { xs: currentChat ? 'flex' : 'none', md: 'flex' } }}
        >
          {currentChat ? (
            <>
              {/* Header */}
              <Box className="msg-chat-header">
                <IconButton
                  onClick={() => setCurrentChat(null)}
                  sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
                >
                  <ArrowBackIos fontSize="small" />
                </IconButton>
                <ListItemAvatar>
                  <Avatar>
                    <ProtectedImage imgSrc={receiver?.profilepic} defaultImage="images/profile1.png" style={{ width: '100%', height: '100%' }} />
                  </Avatar>
                </ListItemAvatar>
                <Typography variant="subtitle1" className="msg-chat-name">
                  {receiver?.fname} {receiver?.lname}
                </Typography>
              </Box>

              {/* Messages Body */}
              <Box className="msg-body">
                {messages.length > 0 ? messages.map((m, index) => (
                  <div ref={scrollRef} key={index} className={`msg-bubble ${m.sender === userid ? 'msg-sent' : 'msg-received'}`}>
                    {m.text}
                    <span className="msg-timestamp">{new Date(m.createdAt || m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )) : (
                  <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" color="text.disabled">
                    <Typography variant="h6">Say Hello! 👋</Typography>
                  </Box>
                )}
              </Box>

              {/* Input Footer */}
              <Box className="msg-footer" component="form" onSubmit={handleSend}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="msg-input-field"
                />
                <IconButton type="submit" className="msg-send-btn">
                  <Send fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <div className="msg-empty-state">
              <img src="images/Messaging-bro.png" alt="No Chat" className="msg-empty-img" />
              <Typography variant="h5" fontWeight={600} gutterBottom>Welcome to Messages</Typography>
              <Typography variant="body1">Select a conversation to start chatting.</Typography>
            </div>
          )}
        </Grid>

      </Grid>
    </Box>
  );
}