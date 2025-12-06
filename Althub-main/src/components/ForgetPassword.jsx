import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// --- INJECTED STYLES FOR MODERN UI ---
const styles = `
  .forgot-page-wrapper {
    min-height: 100vh;
    display: flex;
    font-family: 'Poppins', sans-serif;
    background-color: #fff;
  }

  /* --- LEFT SIDE (Visuals) --- */
  .fp-visual-section {
    flex: 1;
    background: linear-gradient(135deg, #e3fdf5 0%, #ffe6fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .fp-visual-section::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: #fff;
    opacity: 0.3;
    border-radius: 50%;
    top: -150px;
    right: -150px;
  }

  .fp-img {
    width: 80%;
    max-width: 500px;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
  }

  /* --- RIGHT SIDE (Form) --- */
  .fp-form-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    position: relative;
    background: #fff;
  }

  /* Back Button */
  .back-btn {
    position: absolute;
    top: 30px;
    left: 30px;
    padding: 10px 20px;
    background: #f8f9fa;
    border: none;
    border-radius: 30px;
    color: #666;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn:hover {
    background: #e9ecef;
    color: #333;
    transform: translateX(-3px);
  }

  /* Form Container */
  .fp-box {
    width: 100%;
    max-width: 450px;
    text-align: center;
  }

  .fp-title h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 10px;
  }

  .fp-title p {
    color: #b2bec3;
    margin-bottom: 40px;
    font-size: 1rem;
  }

  /* Input Group */
  .input-group {
    position: relative;
    margin-bottom: 25px;
    text-align: left;
  }

  .input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #b2bec3;
    font-size: 1.1rem;
    pointer-events: none;
  }

  .input-field {
    width: 100%;
    padding: 15px 20px 15px 45px; /* Padding left for icon */
    background: #f8f9fa;
    border: 2px solid #f1f2f6;
    border-radius: 12px;
    font-size: 1rem;
    color: #333;
    outline: none;
    transition: all 0.3s;
  }

  .input-field:focus {
    border-color: #66bd9e;
    background: #fff;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.1);
  }
  
  .input-field:focus + .input-icon {
    color: #66bd9e; /* Icon changes color on focus */
  }

  /* Button */
  .reset-btn {
    width: 100%;
    padding: 15px;
    background: #66bd9e;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
  }

  .reset-btn:hover {
    background: #479378;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 189, 158, 0.4);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .forgot-page-wrapper { flex-direction: column; }
    .fp-visual-section { min-height: 300px; flex: none; order: -1; padding: 40px; }
    .fp-img { width: 60%; }
    .fp-form-section { padding: 40px 20px; }
  }
`;

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const nav = useNavigate();

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleForgotPassword = () => {
    if (email !== "") {
      axios({
        url: `${WEB_URL}/api/userForgetPassword`,
        data: {
          email: email,
        },
        method: 'post',
      }).then((response) => {
        toast.success(response.data.msg);
        setEmail("");
        nav('/login');
      }).catch((error) => {
        console.log(error);
        toast.error("Something went wrong. Please try again.");
      })
    } else {
        toast.error("Please enter your email address");
    }
  }

  return (
    <div className="forgot-page-wrapper">
      
      {/* Left Side: Visual */}
      <div className="fp-visual-section">
        <img src="images/Forgot password-amico.svg" alt="Forgot Password Illustration" className="fp-img" />
      </div>

      {/* Right Side: Form */}
      <div className="fp-form-section">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => nav("/login")}>
          <i className="fa-solid fa-arrow-left"></i> Back to Login
        </button>

        <div className="fp-box">
          <div className="fp-title">
            <h1>Forgot Password?</h1>
            <p>Don't worry! Enter your email address below and we'll help you reset it.</p>
          </div>

          <div className="input-group">
            <input 
                type="email" 
                className="input-field" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <i className="fa-solid fa-envelope input-icon"></i>
          </div>

          <button className="reset-btn" onClick={handleForgotPassword}>
            Reset Password
          </button>
        </div>

      </div>

    </div>
  )
}

export default ForgetPassword;