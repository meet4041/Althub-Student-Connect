import axios from 'axios';
import React, { useState } from 'react';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "../styles/ForgetPassword.css"; // <--- New CSS Import

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const nav = useNavigate();

  const handleForgotPassword = () => {
    if (email !== "") {
      axios({
        url: `${WEB_URL}/api/userForgetPassword`,
        data: { email: email },
        method: 'post',
      }).then((response) => {
        toast.success(response.data.msg);
        setEmail("");
        nav('/login');
      }).catch((error) => {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      });
    } else {
        toast.error("Please enter your email address");
    }
  };

  return (
    <div className="forgot-page-wrapper">
      
      {/* Left Side: Visual */}
      <div className="fp-visual-section">
        <img 
            src="images/Forgot password-amico.svg" 
            alt="Forgot Password Illustration" 
            className="fp-img" 
        />
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
  );
}

export default ForgetPassword;