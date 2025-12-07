import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// --- NEW UI STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .fb-wrapper {
    min-height: 100vh;
    width: 100%;
    background-color: #f8f9fa; /* Matches SearchProfile bg */
    background-image: radial-gradient(#e0e7ff 1px, transparent 1px);
    background-size: 24px 24px;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .fb-card {
    margin-top:-30px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    width: 100%;
    max-width: 550px;
    border-radius: 24px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.03);
    padding: 40px;
    text-align: center;
    position: relative;
    border: 1px solid #fff;
  }

  .fb-header {
    margin-bottom: 30px;
  }

  .fb-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 8px;
  }

  .fb-subtitle {
    color: #636e72;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* Star Rating */
  .fb-rating-group {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 30px;
    background: #f1f3f5;
    padding: 15px;
    border-radius: 50px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }

  .star-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 2rem;
    color: #dcdde1;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    padding: 0 5px;
  }

  .star-btn:hover,
  .star-btn.active {
    color: #f1c40f;
    transform: scale(1.2);
  }

  /* Text Area */
  .fb-input-group {
    position: relative;
    margin-bottom: 25px;
    text-align: left;
  }

  .fb-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 8px;
    display: block;
    margin-left: 5px;
  }

  .fb-textarea {
    width: 100%;
    min-height: 140px;
    padding: 16px;
    border-radius: 16px;
    border: 2px solid #f1f2f6;
    background: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    color: #2d3436;
    resize: none;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .fb-textarea::placeholder {
    color: #b2bec3;
  }

  .fb-textarea:focus {
    border-color: #66bd9e;
    box-shadow: 0 0 0 4px rgba(102, 189, 158, 0.15);
  }

  /* Actions */
  .fb-actions {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }

  .btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .btn-submit {
    background-color: #66bd9e;
    color: #fff;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
  }

  .btn-submit:hover {
    background-color: #57a88a;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 189, 158, 0.4);
  }

  .btn-cancel {
    background-color: #fff;
    color: #636e72;
    border: 1px solid #dfe6e9;
  }

  .btn-cancel:hover {
    background-color: #f8f9fa;
    color: #2d3436;
  }

  /* Success Animation Placeholder */
  .success-message {
    color: #66bd9e;
    font-weight: 600;
    margin-top: 15px;
    display: block;
  }

  @media (max-width: 480px) {
    .fb-card { padding: 25px; }
    .fb-title { font-size: 1.5rem; }
    .star-btn { font-size: 1.6rem; }
  }
`;

export default function Feedback() {
    const [feedback, setFeedback] = useState("");
    const [rate, setRate] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            toast.error("Please provide a rating or message!");
            return;
        }

        setIsSubmitting(true);

        axios({
            url: `${WEB_URL}/api/addFeedback`,
            method: 'post',
            data: {
                userid: userID,
                message: feedback,
                rate: rate
            }
        }).then((Response) => {
            setIsSubmitting(false);
            toast.success("Thank you for your feedback!");
            // Optional: Delay navigation to show success state
            setTimeout(() => nav("/home"), 1000); 
        }).catch((error) => {
            setIsSubmitting(false);
            toast.error("Submission Failed. Please try again.");
        })
    }

    return (
        <div className="fb-wrapper">
            <div className="fb-card">
                
                <div className="fb-header">
                    <img src="/images/Logo1.jpeg" alt="Logo" style={{width: '150px', marginBottom:'15px'}} />
                    <h1 className="fb-title">Your opinion matters</h1>
                    <p className="fb-subtitle">
                        How was your experience with Student Connect? <br/>
                        Your feedback helps us improve.
                    </p>
                </div>

                {/* Star Rating Section */}
                <div className="fb-rating-group">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            type="button"
                            className={`star-btn ${rate >= star ? 'active' : ''}`}
                            onClick={() => setRate(star)}
                            title={`${star} stars`}
                        >
                            <i className={rate >= star ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                        </button>
                    ))}
                </div>

                {/* Text Area Section */}
                <div className="fb-input-group">
                    <label className="fb-label">Additional Feedback (Optional)</label>
                    <textarea
                        className="fb-textarea"
                        placeholder="Tell us what you liked or what we can do better..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="fb-actions">
                    <button className="btn btn-cancel" onClick={() => nav("/home")}>
                        Cancel
                    </button>
                    <button 
                        className="btn btn-submit" 
                        onClick={handleFeedBack}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : "Submit Feedback"}
                    </button>
                </div>

            </div>
        </div>
    );
}