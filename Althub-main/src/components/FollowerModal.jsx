import React, { useState, useEffect } from "react";
import ConnectionUser from "./ConnectionUser";

// --- INJECTED STYLES FOR MODERN MODAL ---
const styles = `
  /* Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 2000; /* High z-index to sit above navbar */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  /* Modal Container */
  .modal-card {
    background: #fff;
    width: 100%;
    max-width: 500px;
    height: 80vh; /* Fixed height relative to viewport */
    max-height: 700px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.3s ease-out;
    overflow: hidden; /* Prevents card itself from scrolling */
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Header */
  .modal-header {
    padding: 20px 25px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    flex-shrink: 0;
  }

  .modal-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #2d3436;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    color: #b2bec3;
    cursor: pointer;
    transition: color 0.2s;
  }
  .close-btn:hover { color: #2d3436; }

  /* Tabs */
  .tab-container {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
    flex-shrink: 0;
  }

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 15px;
    cursor: pointer;
    font-weight: 500;
    color: #888;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    font-size: 0.95rem;
  }

  .tab-item:hover {
    background-color: #f9f9f9;
    color: #66bd9e;
  }

  .tab-item.active {
    color: #66bd9e;
    border-bottom-color: #66bd9e;
    font-weight: 600;
  }

  /* Scrollable List Area */
  .modal-list-body {
    flex: 1;
    overflow-y: auto; /* Enables scrolling inside the list */
    padding: 15px;
    background-color: #fff;
  }

  /* Scrollbar Styling */
  .modal-list-body::-webkit-scrollbar {
    width: 6px;
  }
  .modal-list-body::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 3px;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    font-size: 0.9rem;
  }
`;

const FollowerModal = ({ closeModal, user, getUser, initialType = "Follower" }) => {
  const [type, setType] = useState(initialType);
  
  // --- Check if the logged-in user owns this profile ---
  const myID = localStorage.getItem("Althub_Id");
  const isOwner = user._id === myID; 
  // ----------------------------------------------------

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{user.fname}'s Network</h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-container">
          <div
            className={`tab-item ${type === "Follower" ? "active" : ""}`}
            onClick={() => setType("Follower")}
          >
            Followers ({user.followers ? user.followers.length : 0})
          </div>
          <div
            className={`tab-item ${type === "Following" ? "active" : ""}`}
            onClick={() => setType("Following")}
          >
            Following ({user.followings ? user.followings.length : 0})
          </div>
        </div>

        {/* Scrollable List Body */}
        <div className="modal-list-body">
          {type === "Follower" && user.followers && user.followers.length > 0 ? (
            user.followers.map((elem) => (
              <ConnectionUser 
                key={elem} 
                userid={elem} 
                type={type} 
                getUser={getUser} 
                isOwner={isOwner} 
              />
            ))
          ) : type === "Following" && user.followings && user.followings.length > 0 ? (
            user.followings.map((elem) => (
              <ConnectionUser 
                key={elem} 
                userid={elem} 
                type={type} 
                getUser={getUser} 
                isOwner={isOwner} 
              />
            ))
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-users-slash" style={{fontSize: '2rem', marginBottom: '10px', display: 'block'}}></i>
              No {type.toLowerCase()}s yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FollowerModal;