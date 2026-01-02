import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";
import "../styles/Scholarship.css"; // <--- New CSS Import

const Scholarship = () => {
  const [aids, setAids] = useState([]);
  const nav = useNavigate();

  const getAids = useCallback(() => {
    axios
      .get(`${WEB_URL}/api/getFinancialAid`)
      .then((response) => {
        if (response.data && response.data.data) {
          setAids(response.data.data);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const calWidth = (aid, claimed) => {
    const ans = (Number(claimed) / Number(aid)) * 100;
    return ans > 100 ? "100%" : `${ans.toFixed(2)}%`;
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    getAids();
  }, [getAids]);

  return (
    <div className="scholarship-wrapper">
      <div className="scholarship-container">
        
        {/* --- HEADER --- */}
        <div className="scholarship-header">
          <div className="header-content">
            <h1>
              <i className="fa-solid fa-hand-holding-dollar" style={{color: '#66bd9e'}}></i>
              Financial Aid
            </h1>
            <p>Explore funding opportunities and scholarship programs available for you.</p>
          </div>
          <button className="back-btn" onClick={() => nav("/home")}>
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </div>

        {/* --- GRID CONTENT --- */}
        <div className="scholarship-grid">
          {aids && aids.length > 0 ? (
            aids.map((elem) => (
              <div className="aid-card" key={elem._id}>
                
                {/* Card Top: Image & Title */}
                <div className="aid-top">
                  <img
                    src={elem.image ? `${WEB_URL}${elem.image}` : "images/profile1.png"}
                    className="aid-img"
                    alt="Scholarship Logo"
                  />
                  <div className="aid-info">
                    <div className="aid-name">{elem.name}</div>
                    <div className="aid-due">
                      <i className="fa-regular fa-clock" style={{marginRight: '5px'}}></i>
                      Due: {formatDate(elem.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="aid-desc">
                  {elem.description}
                </div>

                {/* Progress Bar Area */}
                <div className="aid-progress-container">
                  <div className="progress-header">
                    <span>Funds Used</span>
                    <span style={{color: '#66bd9e'}}>{calWidth(elem.aid, elem.claimed)}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: calWidth(elem.aid, elem.claimed) }}
                    ></div>
                  </div>
                  <div className="aid-stats">
                    <span>Claimed: <b>₹{elem.claimed}</b></span>
                    <span>Total: <b>₹{elem.aid}</b></span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="no-aid">
              <i className="fa-regular fa-folder-open"></i>
              <h3>No Scholarships Available</h3>
              <p>We couldn't find any active financial aid programs at the moment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Scholarship;