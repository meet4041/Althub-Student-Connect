import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'; 
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

// --- STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .fb-wrapper {
    min-height: 100vh;
    width: 100%;
    background-color: #f8f9fa;
    background-image: radial-gradient(#e0e7ff 1px, transparent 1px);
    background-size: 24px 24px;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .fb-card {
    margin-top: -30px;
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

  .fb-header { margin-bottom: 30px; }
  .fb-title { font-size: 1.8rem; font-weight: 700; color: #2d3436; margin-bottom: 8px; }
  .fb-subtitle { color: #636e72; font-size: 0.95rem; line-height: 1.5; }

  .fb-input-group { position: relative; margin-bottom: 25px; text-align: left; }
  .fb-label { font-size: 0.85rem; font-weight: 600; color: #2d3436; margin-bottom: 8px; display: block; margin-left: 5px; }

  .fb-textarea {
    width: 100%; min-height: 140px; padding: 16px; border-radius: 16px;
    border: 2px solid #f1f2f6; background: #fff; font-family: 'Poppins', sans-serif;
    font-size: 0.95rem; color: #2d3436; resize: none; outline: none;
  }
  .fb-textarea:focus { border-color: #66bd9e; box-shadow: 0 0 0 4px rgba(102, 189, 158, 0.15); }

  .fb-rating-group { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; background: #f1f3f5; padding: 15px; border-radius: 50px; width: fit-content; margin: 0 auto 30px auto; }
  .star-btn { background: none; border: none; cursor: pointer; font-size: 2rem; color: #dcdde1; padding: 0 5px; }
  .star-btn.active { color: #f1c40f; transform: scale(1.2); }

  .fb-actions { display: flex; gap: 15px; margin-top: 10px; }
  .btn { flex: 1; padding: 14px; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; border: none; }
  .btn-submit { background-color: #66bd9e; color: #fff; }
  .btn-cancel { background-color: #fff; color: #636e72; border: 1px solid #dfe6e9; }
`;

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderRadius: '16px',
        border: state.isFocused ? '2px solid #66bd9e' : '2px solid #f1f2f6',
        boxShadow: state.isFocused ? '0 0 0 4px rgba(102, 189, 158, 0.15)' : 'none',
        padding: '5px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '0.95rem',
        '&:hover': { borderColor: '#66bd9e' }
    }),
    option: (provided, state) => ({
        ...provided,
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: state.isSelected ? '#66bd9e' : state.isFocused ? '#e0f2ec' : '#fff',
        color: state.isSelected ? '#fff' : '#2d3436',
    }),
};

export default function Feedback() {
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [rate, setRate] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const nav = useNavigate();
    const location = useLocation();

    // Inject Styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    // Fetch Users and Handle Pre-selection
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${WEB_URL}/api/getUsers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((res) => {
            if(res.data.success) {
                // Modified: Include degree in label if it exists
                const formattedOptions = res.data.data.map(user => ({
                    value: user._id,
                    label: `${user.fname} ${user.lname} ${user.degree ? `(${user.degree})` : ""}`
                }));
                setUserList(formattedOptions);

                if (location.state && location.state.selectedUserId) {
                    const targetId = location.state.selectedUserId;
                    const preSelected = formattedOptions.find(opt => opt.value === targetId);
                    if (preSelected) {
                        setSelectedUser(preSelected);
                    }
                }
            }
        }).catch(err => console.error("Failed to fetch users", err));
    }, [location.state]);

    const handleFeedBack = () => {
        const userID = localStorage.getItem("Althub_Id");
        
        if (!selectedUser) {
            toast.error("Please select a user to review!");
            return;
        }

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
                selected_user_id: selectedUser.value,
                message: feedback,
                rate: rate
            }
        }).then((Response) => {
            setIsSubmitting(false);
            toast.success("Feedback submitted successfully!");
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
                    <p className="fb-subtitle">Share your experience about a specific user.</p>
                </div>

                <div className="fb-input-group">
                    <label className="fb-label">Select User (Compulsory)</label>
                    <Select
                        options={userList}
                        value={selectedUser}
                        onChange={setSelectedUser}
                        placeholder="Search for a user..."
                        isSearchable={true}
                        styles={customSelectStyles}
                    />
                </div>

                <div className="fb-rating-group">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            type="button"
                            className={`star-btn ${rate >= star ? 'active' : ''}`}
                            onClick={() => setRate(star)}
                        >
                            <i className={rate >= star ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                        </button>
                    ))}
                </div>

                <div className="fb-input-group">
                    <label className="fb-label">Feedback Message</label>
                    <textarea
                        className="fb-textarea"
                        placeholder="Type your message here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </div>

                <div className="fb-actions">
                    <button className="btn btn-cancel" onClick={() => nav("/home")}>Cancel</button>
                    <button className="btn btn-submit" onClick={handleFeedBack} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Submit Feedback"}
                    </button>
                </div>

            </div>
        </div>
    );
}