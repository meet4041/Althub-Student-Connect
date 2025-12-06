import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// --- INJECTED STYLES FOR CENTERED CARD UI ---
const styles = `
  /* Full Screen Centered Layout */
  .feedback-page-wrapper {
    height: 100vh;
    width: 100vw;
    background-color: #f3f2ef; /* Matches Home/Events bg */
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow: hidden; /* Prevents scroll */
  }

  /* --- MAIN CARD --- */
  .feedback-card {
    background: #fff;
    width: 100%;
    max-width: 1100px;
    height: 90vh; /* Occupies most of the screen */
    max-height: 700px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.05);
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* --- LEFT SIDE (Form) --- */
  .fb-left {
    flex: 1.2;
    padding: 40px 50px;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Allow scroll inside form if needed on small screens */
  }

  /* Header Area inside Card */
  .fb-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
  }

  .header-text h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin: 0 0 5px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-text p {
    color: #b2bec3;
    font-size: 0.95rem;
    margin: 0;
  }

  .back-btn {
    padding: 8px 16px;
    background: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 20px;
    color: #555;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: #e9ecef;
    color: #333;
    transform: translateX(-2px);
  }

  /* Rating Section */
  .rating-container {
    margin-bottom: 30px;
    text-align: center;
    background: #fcfcfc;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #f1f2f6;
  }

  .rating-title {
    font-size: 1rem;
    font-weight: 600;
    color: #636e72;
    margin-bottom: 15px;
    display: block;
  }

  .star-row {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .star-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 2.5rem;
    color: #e0e0e0;
    transition: transform 0.2s, color 0.2s;
    padding: 0;
  }

  .star-btn.active {
    color: #ffca28; /* Gold */
  }

  .star-btn:hover {
    transform: scale(1.2);
    color: #ffca28;
  }

  /* Input Area */
  .input-group {
    margin-bottom: 25px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .fb-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 10px;
  }

  .fb-textarea {
    flex: 1;
    width: 100%;
    padding: 20px;
    font-size: 1rem;
    border: 2px solid #f1f2f6;
    border-radius: 16px;
    background-color: #fff;
    resize: none;
    font-family: inherit;
    transition: all 0.3s;
    outline: none;
  }

  .fb-textarea:focus {
    border-color: #66bd9e;
    background-color: #fff;
    box-shadow: 0 4px 20px rgba(102, 189, 158, 0.1);
  }

  /* Submit Button */
  .submit-btn {
    width: 100%;
    padding: 15px;
    background: #66bd9e;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 8px 20px rgba(102, 189, 158, 0.3);
  }

  .submit-btn:hover {
    background: #479378;
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(102, 189, 158, 0.4);
  }

  /* --- RIGHT SIDE (Image) --- */
  .fb-right {
    flex: 1;
    background: linear-gradient(135deg, #f0f9f6 0%, #d4efe7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Decorative Shapes */
  .fb-right::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: #fff;
    opacity: 0.4;
    border-radius: 50%;
    top: -100px;
    right: -100px;
  }

  .fb-right::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    background: #66bd9e;
    opacity: 0.1;
    border-radius: 50%;
    bottom: 50px;
    left: 50px;
  }

  .fb-img {
    width: 85%;
    max-width: 400px;
    height: auto;
    z-index: 2;
    filter: drop-shadow(0 15px 30px rgba(0,0,0,0.08));
  }

  /* Responsive */
  @media (max-width: 900px) {
    .feedback-page-wrapper {
      height: auto;
      overflow-y: auto;
    }
    .feedback-card {
      flex-direction: column-reverse;
      height: auto;
      max-height: none;
    }
    .fb-right {
      height: 250px;
    }
    .fb-img {
      max-width: 200px;
    }
    .fb-left {
      padding: 30px 20px;
    }
  }
`;

export default function Feedback() {
    const [feedback, setFeedback] = useState("");
    const [rate, setRate] = useState(0);
    const nav = useNavigate();

    // Inject Styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    const handleFeedBack = () => {
        const userID = localStorage.getItem("Althub_Id");
        
        if (!feedback && rate === 0) {
            toast.error("Please provide a rating or description!");
            return;
        }

        axios({
            url: `${WEB_URL}/api/addFeedback`,
            method: 'post',
            data: {
                userid: userID,
                message: feedback,
                rate: rate
            }
        }).then((Response) => {
            toast.success("Thank you for your feedback!");
            setFeedback("");
            setRate(0);
            nav("/home");
        }).catch((error) => {
            toast.error("Submission Failed");
        })
    }

    return (
        <div className="feedback-page-wrapper">
            <div className="feedback-card">
                
                {/* Left: Form Content */}
                <div className="fb-left">
                    
                    {/* Header inside card */}
                    <div className="fb-header-row">
                        <div className="header-text">
                            <h1>Feedback</h1>
                            <p>We'd love to hear your thoughts.</p>
                        </div>
                        <button className="back-btn" onClick={() => nav("/home")}>
                            <i className="fa-solid fa-arrow-left"></i> Back to Home
                        </button>
                    </div>

                    {/* Rating */}
                    <div className="rating-container">
                        <label className="rating-title">Rate your experience</label>
                        <div className="star-row">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    className={`star-btn ${rate >= star ? 'active' : ''}`}
                                    onClick={() => setRate(star)}
                                    type="button"
                                >
                                    <i className={rate >= star ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Area */}
                    <div className="input-group">
                        <label className="fb-label">Tell us more</label>
                        <textarea
                            className="fb-textarea"
                            placeholder="What did you like? What can we improve?"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <button className="submit-btn" onClick={handleFeedBack}>
                        Submit Feedback
                    </button>
                </div>

                {/* Right: Visual */}
                <div className="fb-right">
                    <img 
                        src="images/feedback-animate.svg" 
                        alt="Feedback Illustration" 
                        className="fb-img" 
                    />
                </div>

            </div>
        </div>
    )
}