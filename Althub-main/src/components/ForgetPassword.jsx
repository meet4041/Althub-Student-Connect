import apiClient from "../api/client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "../styles/ForgetPassword.css";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    apiClient({
        url: `/api/userForgetPassword`,
        data: { email: trimmedEmail },
        method: 'post',
      }).then((response) => {
        toast.success(response.data.msg);
        setEmail("");
        nav('/login');
      }).catch((error) => {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      }).finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="forgot-page-wrapper">
      
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

          <button className="reset-btn" onClick={handleForgotPassword} disabled={loading}>
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </div>

      </div>

    </div>
  );
}

export default ForgetPassword;
