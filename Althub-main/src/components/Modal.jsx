import React, { useEffect } from 'react';

// --- INJECTED STYLES FOR MODERN REUSABLE MODAL ---
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
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Modal Card */
  .modal-card {
    background: #fff;
    width: 100%;
    max-width: 500px; /* Default width, can be overridden */
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    font-family: 'Poppins', sans-serif;
    transform: translateY(20px);
    animation: slideUp 0.3s ease-out forwards;
    overflow: hidden;
  }

  @keyframes slideUp {
    to { transform: translateY(0); }
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

  /* Content Body */
  .modal-content {
    padding: 25px;
    overflow-y: auto;
    color: #555;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

function Modal({ closeModal, title = "Details", children }) {
  
  useEffect(() => {
    // Inject Styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Lock Body Scroll
    document.body.style.overflowY = "hidden";
    
    return () => {
      document.head.removeChild(styleSheet);
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="modal-content">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Modal;