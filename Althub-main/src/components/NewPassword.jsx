import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// --- INJECTED STYLES FOR MODERN UI ---
const styles = `
  .reset-page-wrapper {
    min-height: 100vh;
    display: flex;
    font-family: 'Poppins', sans-serif;
    background-color: #fff;
  }

  /* --- LEFT SIDE (Visuals) --- */
  .rp-visual-section {
    flex: 1;
    background: linear-gradient(135deg, #e3fdf5 0%, #ffe6fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .rp-visual-section::before {
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

  .rp-img {
    width: 80%;
    max-width: 500px;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
  }

  /* --- RIGHT SIDE (Form) --- */
  .rp-form-section {
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
  .rp-box {
    width: 100%;
    max-width: 420px;
    text-align: center;
  }

  .rp-title h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 10px;
  }

  .rp-title p {
    color: #b2bec3;
    margin-bottom: 40px;
    font-size: 1rem;
  }

  /* Input Group */
  .input-group {
    position: relative;
    margin-bottom: 20px;
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
    color: #66bd9e;
  }

  .error-msg {
    color: #ff4757;
    font-size: 0.8rem;
    margin-top: 5px;
    margin-left: 5px;
    display: block;
  }

  /* Button */
  .reset-btn {
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
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
    margin-top: 10px;
  }

  .reset-btn:hover {
    background: #479378;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 189, 158, 0.4);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .reset-page-wrapper { flex-direction: column; }
    .rp-visual-section { min-height: 300px; flex: none; order: -1; padding: 40px; }
    .rp-img { width: 60%; }
    .rp-form-section { padding: 40px 20px; }
  }
`;

function NewPassword() {
  const queryParameters = new URLSearchParams(window.location.search)
  const token = queryParameters.get("token")
  const [password, setPassword] = useState({
    new: "",
    confirm: ""
  });
  const [errors, setErrors] = useState({});
  const nav = useNavigate();

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const validate = () => {
    let input = password;
    let errors = {};
    let isValid = true;
    if (!input["new"]) {
      isValid = false;
      errors["new_password_err"] = "Please enter a new password";
    }
    if (!input["confirm"]) {
      isValid = false;
      errors["confirm_password_err"] = "Please confirm your password";
    }
    if (input["new"] && input["confirm"] && input["new"] !== input["confirm"]) {
      isValid = false;
      errors["confirm_password_err"] = "Passwords do not match";
    }
    setErrors(errors);
    return isValid;
  };

  const handleResetPassword = () => {
    if (validate()) {
      axios({
        url: `${WEB_URL}/api/userResetPassword?token=${token}`,
        data: {
          password: password.new
        },
        method: 'post',
      }).then((response) => {
        console.log(response);
        toast.success(response.data.msg);
        nav('/login');
      }).catch((error) => {
        console.log(error);
        toast.error("Failed to reset password.");
      })
    }
  }

  const handleChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  }

  return (
    <div className="reset-page-wrapper">
      
      {/* Left Side: Visual */}
      <div className="rp-visual-section">
        <img src="images/Forgot password-amico.svg" alt="Reset Password Illustration" className="rp-img" />
      </div>

      {/* Right Side: Form */}
      <div className="rp-form-section">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => nav("/login")}>
          <i className="fa-solid fa-arrow-left"></i> Back to Login
        </button>

        <div className="rp-box">
          <div className="rp-title">
            <h1>Set New Password</h1>
            <p>Your new password must be different from previously used passwords.</p>
          </div>

          <div className="input-group">
            <input 
                type="password" 
                className="input-field" 
                placeholder="New Password" 
                value={password.new} 
                onChange={handleChange} 
                name='new' 
            />
            <i className="fa-solid fa-lock input-icon"></i>
            {errors.new_password_err && <span className="error-msg">{errors.new_password_err}</span>}
          </div>

          <div className="input-group">
            <input 
                type="password" 
                className="input-field" 
                placeholder="Confirm Password" 
                value={password.confirm} 
                onChange={handleChange} 
                name='confirm' 
            />
            <i className="fa-solid fa-lock input-icon"></i>
            {errors.confirm_password_err && <span className="error-msg">{errors.confirm_password_err}</span>}
          </div>

          <button className="reset-btn" onClick={handleResetPassword}>
            Reset Password
          </button>
        </div>

      </div>

    </div>
  )
}

export default NewPassword;