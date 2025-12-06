import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WEB_URL } from "../baseURL";

// --- INJECTED STYLES FOR FULL-WIDTH MODERN UI ---
const styles = `
  /* General Page Layout */
  .scholarship-wrapper {
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 40px 20px;
    font-family: 'Poppins', sans-serif;
  }

  .scholarship-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* --- HEADER SECTION --- */
  .scholarship-header {
    background: #fff;
    padding: 30px 40px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
  }

  .scholarship-header::before {
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
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-content p {
    font-size: 1rem;
    color: #636e72;
    margin: 0;
  }

  .back-btn {
    padding: 10px 20px;
    background: #f1f3f5;
    border-radius: 30px;
    color: #555;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
  }

  .back-btn:hover {
    background: #e9ecef;
    color: #333;
    transform: translateX(-3px);
  }

  /* --- SCHOLARSHIP GRID --- */
  .scholarship-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
  }

  /* --- AID CARD --- */
  .aid-card {
    background: #fff;
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    border: 1px solid #f0f0f0;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .aid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.08);
    border-color: #e0e0e0;
  }

  .aid-top {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .aid-img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .aid-info {
    flex: 1;
  }

  .aid-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .aid-due {
    font-size: 0.8rem;
    color: #888;
    background: #f8f9fa;
    padding: 4px 10px;
    border-radius: 20px;
    display: inline-block;
  }

  .aid-desc {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
    margin-bottom: 25px;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Progress Bar Styling */
  .aid-progress-container {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #f1f1f1;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-fill {
    height: 100%;
    background: #66bd9e;
    border-radius: 10px;
    transition: width 0.5s ease;
  }

  .aid-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #888;
  }

  .aid-stats b {
    color: #333;
  }

  /* Empty State */
  .no-aid {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px;
    background: #fff;
    border-radius: 20px;
    color: #b2bec3;
    border: 2px dashed #f0f0f0;
  }

  .no-aid i {
    font-size: 3.5rem;
    margin-bottom: 20px;
    color: #dfe6e9;
    display: block;
  }

  @media (max-width: 768px) {
    .scholarship-header {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }
    .scholarship-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const Scholarship = () => {
  const [aids, setAids] = useState([]);
  const nav = useNavigate();

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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