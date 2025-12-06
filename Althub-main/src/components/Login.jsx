import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { WEB_URL } from "../baseURL";

// --- INJECTED STYLES FOR MODERN LOGIN UI ---
const styles = `
  .login-page-wrapper {
    min-height: 100vh;
    display: flex;
    font-family: 'Poppins', sans-serif;
    background-color: #fff;
  }

  /* --- LEFT SIDE (Illustration) --- */
  .login-visual {
    flex: 1;
    background: linear-gradient(135deg, #e3fdf5 0%, #ffe6fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .login-visual::before {
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

  .login-img {
    width: 80%;
    max-width: 600px;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
  }

  /* --- RIGHT SIDE (Form) --- */
  .login-form-section {
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
  .login-box {
    width: 100%;
    max-width: 420px;
    text-align: center;
  }

  .app-logo {
    width: 200px;
    border-radius: 12px;
  }

  .login-title h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3436;
    margin-bottom: 10px;
  }

  .login-title p {
    color: #b2bec3;
    margin-bottom: 40px;
  }

  /* Inputs */
  .input-group {
    margin-bottom: 20px;
    text-align: left;
  }

  .input-field {
    width: 100%;
    padding: 15px 20px;
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

  /* Button */
  .login-btn {
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
    margin-top: 10px;
    box-shadow: 0 4px 15px rgba(102, 189, 158, 0.3);
  }

  .login-btn:hover {
    background: #479378;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 189, 158, 0.4);
  }

  /* Links */
  .login-options {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    font-size: 0.9rem;
    color: #636e72;
  }

  .forgot-link {
    color: #66bd9e;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s;
  }

  .forgot-link:hover {
    text-decoration: underline;
  }

  .signup-link span {
    color: #66bd9e;
    font-weight: 600;
    cursor: pointer;
    margin-left: 5px;
  }

  .signup-link span:hover {
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .login-page-wrapper { flex-direction: column; }
    .login-visual { min-height: 300px; flex: none; order: -1; }
    .login-img { width: 60%; margin-top: 20px; }
    .login-form-section { padding: 40px 20px; }
  }
`;

export default function Login() {
  const nav = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let input = user;
    let isValid = true;

    if (!input["email"]) {
      isValid = false;
      toast.error("Please Enter Email");
    }
    if (!input["password"]) {
      isValid = false;
      toast.error("Please Enter Password");
    }
    return isValid;
  };

  const handleLogin = () => {
    if (validate()) {
      axios({
        method: "post",
        data: {
          email: user.email,
          password: user.password,
        },
        url: `${WEB_URL}/api/userLogin`
      }).then((response) => {
        toast.success("Login Successful");
        localStorage.setItem("Althub_Id", response.data.data._id);
        setTimeout(() => {
          nav("/home");
        })
      }).catch((err) => {
        toast.error("Invalid Credentials");
      })
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Althub_Id") !== null) {
      nav('/home');
    }
  }, [nav]);

  return (
    <div className="login-page-wrapper">
      
      {/* Left Side: Visuals */}
      <div className="login-visual">
        <img src="images/register-animate.svg" alt="Welcome" className="login-img" />
      </div>

      {/* Right Side: Form */}
      <div className="login-form-section">
        
        {/* Back to Main Button */}
        <button className="back-btn" onClick={() => nav("/")}>
          <i className="fa-solid fa-arrow-left"></i> Back to Main
        </button>

        <div className="login-box">
          <img src="images/Logo1.jpeg" alt="Logo" className="app-logo" />
          
          <div className="login-title">
            <h1>Welcome Back</h1>
            <p>Please enter your details to sign in</p>
          </div>

          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Email Address"
              value={user.email}
              onChange={handleChange}
              name="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
              name="password"
            />
          </div>

          <input
            type="submit"
            className="login-btn"
            value="Login"
            onClick={handleLogin}
          />

          <div className="login-options">
            <div className="forgot-link" onClick={() => nav("/forget-password")}>
              Forgot Password?
            </div>
            
            <div className="signup-link">
              Don't have an account? 
              <span onClick={() => nav("/register")}>Sign Up</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}