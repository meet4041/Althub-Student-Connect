import React, { useState, useEffect } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import EventModal from "./EventModal";
import ProtectedImage from "../ProtectedImage"; // Ensure this is imported

const styles = `
  .events-page-wrapper {
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 30px 5%;
    font-family: 'Poppins', sans-serif;
  }

  .events-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* --- HEADER SECTION --- */
  .events-header-card {
    background: #fff;
    padding: 25px 40px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
    border: 1px solid #eee;
  }

  .events-header-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 6px;
    background: linear-gradient(180deg, #66bd9e 0%, #479378 100%);
  }

  .header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin: 0 0 5px 0;
  }

  .header-content p {
    font-size: 1rem;
    color: #636e72;
    font-weight: 500;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .header-img {
    height: 120px;
    object-fit: contain;
    margin-right: 20px;
  }

  .back-btn {
    padding: 8px 20px;
    background: #f1f3f5;
    border-radius: 30px;
    color: #555;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    font-size: 0.9rem;
  }

  .back-btn:hover {
    background: #e9ecef;
    color: #333;
    transform: translateX(-3px);
  }

  /* --- TABS --- */
  .events-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    justify-content: center;
  }

  .tab-btn {
    padding: 8px 24px;
    border-radius: 30px;
    background: #fff;
    border: 1px solid #e0e0e0;
    color: #555;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    font-size: 0.9rem;
  }

  .tab-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .tab-btn.active {
    background: #66bd9e;
    color: #fff;
    border-color: #66bd9e;
    box-shadow: 0 4px 12px rgba(102, 189, 158, 0.3);
  }

  /* --- EVENTS GRID --- */
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 25px;
  }

  /* --- EVENT CARD --- */
  .event-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    border: 1px solid #f0f0f0;
    height: 100%;
  }

  .event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.08);
    border-color: #e0e0e0;
  }

  .card-img-wrapper {
    height: 150px; 
    overflow: hidden;
    position: relative;
    background: #f0f0f0; /* Placeholder color while loading */
  }

  /* FIX: Target the class explicitly passed to ProtectedImage */
  .event-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    display: block;
  }

  .event-card:hover .event-img {
    transform: scale(1.05);
  }

  .card-body {
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 12px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0 0 15px 0;
    flex: 1;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    color: #636e72;
    font-size: 0.85rem;
  }

  .info-item i {
    width: 16px;
    text-align: center;
    color: #66bd9e;
  }

  .view-btn {
    width: 100%;
    padding: 10px;
    background: #f8f9fa;
    color: #2d3436;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .view-btn:hover {
    background: #66bd9e;
    color: #fff;
  }

  .no-events {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    background: #fff;
    border-radius: 16px;
    color: #b2bec3;
    border: 2px dashed #f0f0f0;
  }

  .no-events i {
    font-size: 3rem;
    margin-bottom: 15px;
    display: block;
    color: #dfe6e9;
  }

  @media (max-width: 900px) {
    .events-header-card {
      flex-direction: column;
      text-align: center;
      padding: 25px 20px;
      gap: 20px;
    }
    .events-header-card::before {
      width: 100%;
      height: 6px;
    }
    .header-actions {
      flex-direction: column-reverse;
    }
    .header-img {
      margin: 0;
      height: 100px;
    }
  }
`;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const closeModal = () => setModal(false);
  const [event, setEvent] = useState({});
  const [showEvent, setShowEvent] = useState([]);
  const [type, setType] = useState("All");
  const nav = useNavigate();

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const getEvents = () => {
    axios({
      method: "get",
      url: `${WEB_URL}/api/getEvents`,
    })
      .then((Response) => {
        setEvents(Response.data.data);
        setShowEvent(Response.data.data);
        setType("All");
      })
      .catch((error) => {
        toast.error("Something Went Wrong");
      });
  };

  useEffect(() => {
    getEvents();
  }, []);

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { hour: "numeric", minute: "numeric", timeZone: "Asia/Kolkata" };
    const formattedTime = date.toLocaleTimeString("en-US", options);
    return formattedTime.replace(/(\+|-)\d+:\d+/, "");
  };

  useEffect(() => {
    const currentDate = new Date();
    setShowEvent(events.filter(event => {
      const eventDate = new Date(event.date);
      if (type === "All") return true;
      else if (type === "Upcomming") return eventDate > currentDate;
      else return eventDate < currentDate;
    }));
  }, [type, events]);

  return (
    <>
      <div className="events-page-wrapper">
        <div className="events-container">
          <div className="events-header-card">
            <div className="header-content"><h1>Events</h1><p>Discover, Connect, and Experience</p></div>
            <div className="header-actions">
              <img src="/images/Events-amico.png" alt="Events Illustration" className="header-img" loading="lazy" />
              <button className="back-btn" onClick={() => nav("/home")}><i className="fa-solid fa-arrow-left"></i> Back to Home</button>
            </div>
          </div>

          <div className="events-tabs">
            <button className={`tab-btn ${type === "All" ? "active" : ""}`} onClick={() => setType("All")}>All</button>
            <button className={`tab-btn ${type === "Upcomming" ? "active" : ""}`} onClick={() => setType("Upcomming")}>Upcoming</button>
            <button className={`tab-btn ${type === "Past" ? "active" : ""}`} onClick={() => setType("Past")}>Past</button>
          </div>

          <div className="events-grid">
            {showEvent.length > 0 ? (
              showEvent.map((elem) => (
                <div key={elem._id} className="event-card">
                  
                  {/* FIX: Keep wrapper, add ProtectedImage with proper class */}
                  <div className="card-img-wrapper">
                    <ProtectedImage 
                      imgSrc={elem.photos && elem.photos[0]} 
                      defaultImage="images/event1.png" 
                      alt={elem.title}
                      className="event-img" 
                    />
                  </div>

                  <div className="card-body">
                    <h2 className="card-title" title={elem.title}>{elem.title}</h2>
                    <ul className="info-list">
                      <li className="info-item"><i className="fa-regular fa-calendar-days"></i><span>{formatDate(elem.date)}</span></li>
                      <li className="info-item"><i className="fa-regular fa-clock"></i><span>{formatTime(elem.date)}</span></li>
                      <li className="info-item"><i className="fa-solid fa-location-dot"></i><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={elem.venue}>{elem.venue}</span></li>
                    </ul>
                    <button className="view-btn" onClick={() => { setModal(true); setEvent(elem); }}>View</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events"><i className="fa-regular fa-calendar-xmark"></i><h3>No Events Found</h3><p>Check back later.</p></div>
            )}
          </div>
        </div>
      </div>
      {modal && <EventModal closeModal={closeModal} event={event} getEvents={getEvents} />}
    </>
  );
}