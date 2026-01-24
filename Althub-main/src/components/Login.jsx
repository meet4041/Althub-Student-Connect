import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import { WEB_URL } from "../baseURL";
import "../styles/Login.css"; // Ensure this points to your correct CSS file

export default function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState({ email: "", password: "" });

  useEffect(() => {
    if (localStorage.getItem("Althub_Id")) {
      nav('/home');
    }
  }, [nav]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!user.email) {
      toast.error("Please Enter Email");
      return false;
    }
    if (!user.password) {
      toast.error("Please Enter Password");
      return false;
    }
    return true;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      axios({
        method: "post",
        data: {
          email: user.email,
          password: user.password,
        },
        url: `${WEB_URL}/api/userLogin`,
        withCredentials: true
      }).then((response) => {
        toast.success("Welcome back!");
        localStorage.setItem("Althub_Id", response.data.data._id);
        setUser({ email: "", password: "" });
        setTimeout(() => nav("/home"), 1000);
      }).catch((err) => {
        setLoading(false);
        const msg = err.response ? err.response.data.msg : "Login Failed";
        toast.error(msg);
      })
    }
  };

  return (
    <div className="login-wrapper">

      {/* --- LEFT SIDE (Visual) --- */}
      <div className="login-visual-side">
        {/* Blobs */}
        <div className="visual-blob bg-brand-300 top-0 left-0 w-96 h-96"></div>
        <div className="visual-blob bg-secondary-300 bottom-0 right-0 w-96 h-96 animation-delay-2000"></div>

        <div className="visual-content">
          <img
            src="images/register-animate.svg"
            alt="Welcome Illustration"
            className="w-full max-w-md mx-auto drop-shadow-2xl mb-8"
          />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Althub</h2>
          <p className="text-slate-600 text-lg">Your gateway to the alumni network.</p>
        </div>
      </div>

      {/* --- RIGHT SIDE (Form) --- */}
      <div className="login-form-side">

        <button onClick={() => nav("/")} className="back-home-btn">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="form-container">

          <div className="form-header">
            <div className="inline-flex justify-center mb-6">
              <img src="images/Logo1.jpeg" alt="Logo" className="h-16 rounded-2xl shadow-sm" />
            </div>
            <h1 className="form-title">Sign in to your account</h1>
            <p className="form-subtitle">Enter your details below to continue</p>
          </div>

          <form className="input-group" onSubmit={handleLogin}>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="custom-input"
                  value={user.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => nav("/forget-password")}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"} // Dynamic Type
                  name="password"
                  placeholder="••••••••"
                  className="custom-input pr-12" // Added extra right padding for the eye icon
                  value={user.password}
                  onChange={handleChange}
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => nav("/register")} className="auth-link">
              Sign up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}