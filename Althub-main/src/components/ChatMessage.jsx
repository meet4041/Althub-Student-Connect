import React, { useEffect } from "react";

// --- INJECTED STYLES FOR MODERN CHAT BUBBLES ---
const styles = `
  /* Shared Bubble Styles */
  .chat-bubble {
    max-width: 70%;
    padding: 12px 18px;
    position: relative;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    line-height: 1.5;
    word-wrap: break-word;
    margin-bottom: 10px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Sent Message (My side) */
  .msg-send {
    align-self: flex-end;
    background: linear-gradient(135deg, #66bd9e 0%, #4cb390 100%);
    color: #fff;
    border-radius: 18px 18px 0 18px; /* Sharp bottom-right corner */
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.25);
    margin-left: auto; /* Pushes to right if parent isn't flex column */
  }

  /* Received Message (Other side) */
  .msg-received {
    align-self: flex-start;
    background: #fff;
    color: #2d3436;
    border-radius: 0 18px 18px 18px; /* Sharp top-left corner */
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    border: 1px solid #f1f1f1;
    margin-right: auto; /* Pushes to left */
  }

  /* Message Text */
  .msg-text-content {
    margin-bottom: 4px;
  }

  /* Time Stamp */
  .msg-time-stamp {
    font-size: 0.7rem;
    opacity: 0.8;
    text-align: right;
    font-weight: 500;
    display: block;
    margin-top: 2px;
    letter-spacing: 0.3px;
  }
  
  /* Specific color for received time to ensure contrast */
  .msg-received .msg-time-stamp {
    color: #b2bec3;
  }
  
  .msg-send .msg-time-stamp {
    color: rgba(255, 255, 255, 0.9);
  }
`;

function ChatMessage({ msg, own }) {
  
  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const formatChatTime = (timestamp) => {
    try {
      const messageTime = new Date(timestamp);
      if (isNaN(messageTime.getTime())) return "";
      const now = new Date();
      const timeDiff = Math.abs(now - messageTime);
      const minutesDiff = Math.floor(timeDiff / 60000);
      
      if (minutesDiff < 1) {
        return "Just now";
      } else if (minutesDiff < 60) {
        return `${minutesDiff} min ago`;
      } else if (messageTime.toDateString() === now.toDateString()) {
        const options = { hour: "numeric", minute: "numeric" };
        return `Today, ${messageTime.toLocaleTimeString("en-US", options)}`;
      } else {
        const options = {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        };
        return messageTime.toLocaleString("en-US", options);
      }
    } catch (err) {
      return "";
    }
  };

  const text = msg && typeof msg === "object" && "text" in msg ? msg.text : "";
  const timeVal = msg && typeof msg === "object" && "time" in msg ? msg.time : null;

  return (
    <div className={`chat-bubble msg-${own}`}>
      <div className="msg-text-content">{text}</div>
      <div className="msg-time-stamp">{timeVal ? formatChatTime(timeVal) : ""}</div>
    </div>
  );
}

export default ChatMessage;