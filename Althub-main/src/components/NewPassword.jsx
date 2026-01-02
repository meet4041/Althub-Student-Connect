import axios from 'axios';
import React, { useState } from 'react';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "../styles/NewPassword.css"; // <--- New CSS Import

function NewPassword() {
  const queryParameters = new URLSearchParams(window.location.search);
  const token = queryParameters.get("token");
  const [password, setPassword] = useState({
    new: "",
    confirm: ""
  });
  const [errors, setErrors] = useState({});
  const nav = useNavigate();

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
        toast.success(response.data.msg);
        nav('/login');
      }).catch((error) => {
        console.error(error);
        toast.error("Failed to reset password.");
      });
    }
  };

  const handleChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  return (
    <div className="reset-page-wrapper">
      
      {/* Left Side: Visual */}
      <div className="rp-visual-section">
        <img 
            src="images/Forgot password-amico.svg" 
            alt="Reset Password Illustration" 
            className="rp-img" 
        />
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
  );
}

export default NewPassword;