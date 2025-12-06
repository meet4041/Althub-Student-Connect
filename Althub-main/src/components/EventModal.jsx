import React from "react";
import Slider from "react-slick";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { toast } from "react-toastify";

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
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  /* Modal Container */
  .modal-card {
    background: #fff;
    width: 100%;
    max-width: 600px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.3s ease-out;
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
  }

  .modal-title {
    margin: 0;
    font-size: 1.4rem;
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
    padding: 5px;
    display: flex;
  }

  .close-btn:hover {
    color: #2d3436;
  }

  /* Scrollable Content Body */
  .modal-body {
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  /* Image Section */
  .modal-image-container {
    background: #000;
    width: 100%;
    height: 300px;
    position: relative;
  }

  .modal-img {
    width: 100%;
    height: 300px;
    object-fit: contain;
    display: block;
  }

  .no-image-placeholder {
    width: 100%;
    height: 200px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1rem;
  }

  /* Content Section */
  .modal-content-box {
    padding: 25px;
  }

  /* Description Section (Moved Up) */
  .desc-section {
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f5f5f5;
  }

  .section-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #66bd9e;
    font-weight: 700;
    margin-bottom: 8px;
    display: block;
  }

  .desc-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #444;
    white-space: pre-wrap;
  }

  /* Info Grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .info-icon {
    width: 35px;
    height: 35px;
    border-radius: 8px;
    background: #f0f9f6;
    color: #66bd9e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .info-text h5 {
    margin: 0 0 2px 0;
    font-size: 0.9rem;
    color: #2d3436;
    font-weight: 600;
  }

  .info-text p {
    margin: 0;
    font-size: 0.85rem;
    color: #636e72;
  }

  /* Footer */
  .modal-footer {
    padding: 20px 25px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
  }

  .join-btn {
    background: #66bd9e;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
  }

  .join-btn:hover {
    background: #479378;
    transform: translateY(-2px);
  }

  /* Mobile Adjustments */
  @media (max-width: 600px) {
    .modal-card { height: 100%; max-height: 100%; border-radius: 0; }
    .info-grid { grid-template-columns: 1fr; }
    .modal-image-container { height: 200px; }
    .modal-img { height: 200px; }
  }
`;

const EventModal = ({ closeModal, event, getEvents }) => {
  const userid = localStorage.getItem("Althub_Id");
  
  // Inject Styles
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // Cleaner look without arrows on top of image
    adaptiveHeight: false
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { hour: "numeric", minute: "numeric", timeZone: "Asia/Kolkata" };
    return date.toLocaleTimeString("en-US", options);
  };

  const handleJoin = () => {
    axios({
      url: `${WEB_URL}/api/participateInEvent/${event._id}`,
      method: "put",
      data: { userId: userid },
    }).then((Response) => {
      toast.success(Response.data);
      closeModal();
      getEvents();
    }).catch((error) => {
      toast.error(error.response?.data || "Error joining event");
      closeModal();
    })
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{event.title}</h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* Images Slider */}
          <div className="modal-image-container">
            {event.photos && event.photos.length > 0 ? (
              <Slider {...settings}>
                {event.photos.map((el, index) => (
                  <div key={index} style={{outline: 'none'}}>
                    <img src={`${WEB_URL}${el}`} alt="Event" className="modal-img" />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="no-image-placeholder">
                <i className="fa-regular fa-image" style={{marginRight: '8px'}}></i> No Images
              </div>
            )}
          </div>

          <div className="modal-content-box">
            
            {/* Description - Moved Up */}
            <div className="desc-section">
              <span className="section-label">About Event</span>
              <div className="desc-text">
                {event.description || "No description provided."}
              </div>
            </div>

            {/* Info Grid */}
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon"><i className="fa-regular fa-calendar-days"></i></div>
                <div className="info-text">
                  <h5>Date</h5>
                  <p>{formatDate(event.date)}</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon"><i className="fa-regular fa-clock"></i></div>
                <div className="info-text">
                  <h5>Time</h5>
                  <p>{formatTime(event.date)}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><i className="fa-solid fa-location-dot"></i></div>
                <div className="info-text">
                  <h5>Venue</h5>
                  <p>{event.venue}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><i className="fa-solid fa-users"></i></div>
                <div className="info-text">
                  <h5>Participants</h5>
                  <p>{event.participants ? event.participants.length : 0} Joined</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer with Action */}
        {new Date() < new Date(event.date) && (
          <div className="modal-footer">
            <button className="join-btn" onClick={handleJoin}>
              Confirm & Join
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EventModal;