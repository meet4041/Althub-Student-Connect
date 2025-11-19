import React from "react";

function ChatMessage({ msg, own }) {
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
        return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
      } else if (messageTime.toDateString() === now.toDateString()) {
        const options = { hour: "numeric", minute: "numeric" };
        return `Today at ${messageTime.toLocaleTimeString("en-US", options)}`;
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
    <>
      <div className={`msg-${own}`}>
        <div className="msg">{text}</div>
        <div className="msg-time">{timeVal ? formatChatTime(timeVal) : ""}</div>
      </div>
    </>
  );
}

export default ChatMessage;
