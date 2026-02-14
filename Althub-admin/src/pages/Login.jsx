import React, { useState, useEffect, Fragment } from 'react';
import axiosInstance from '../services/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import '../styles/login.css'; 

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [check, setCheck] = useState(false);
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const InputEvent = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({ ...prev, [name]: value }));
        if (errors[`${name}_err`]) setErrors(prev => ({ ...prev, [`${name}_err`]: null }));
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            
            // Optimization: Use a standard object if your backend is configured for JSON, 
            // otherwise keep URLSearchParams for compatibility.
            const bodyFormData = new URLSearchParams();
            bodyFormData.append('email', loginInfo.email);
            bodyFormData.append('password', loginInfo.password);

            axiosInstance.post('/api/adminLogin', bodyFormData)
                .then((response) => {
                    if (response.data.success === true) {
                        toast.success('Access Granted!');
                        const adminData = response.data.data;
                        const serverToken = response.data.token; 

                        // Consolidate Storage Keys
                        localStorage.setItem('AlmaPlus_admin_Id', adminData._id);
                        localStorage.setItem('AlmaPlus_admin_Name', adminData.name || 'Admin');
                        localStorage.setItem('AlmaPlus_admin_Token', serverToken || adminData.token);

                        if (check) {
                            localStorage.setItem('AlmaPlus_Admin_Remember_Me', 'Enabled');
                            localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                        }
                        
                        // Use { replace: true } to prevent the user from going back to login via the back button
                        setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
                    } else {
                        setDisable(false);
                        toast.error(response.data.msg || 'Invalid Credentials');
                    }
                }).catch((err) => {
                    setDisable(false);
                    toast.error(err.response?.data?.msg || 'Authentication Failed');
                });
        }
    }

    const validate = () => {
        let errors = {};
        if (!loginInfo.email) errors["email_err"] = "Admin email required";
        if (!loginInfo.password) errors["password_err"] = "Password required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    useEffect(() => {
        // Prevent logged-in admins from seeing the login page
        if (localStorage.getItem("AlmaPlus_admin_Id") && localStorage.getItem("AlmaPlus_admin_Token")) {
            navigate('/dashboard', { replace: true });
        }

        // Auto-fill remembered email
        const savedEmail = localStorage.getItem('AlmaPlus_Admin_Email');
        if (localStorage.getItem('AlmaPlus_Admin_Remember_Me') === 'Enabled' && savedEmail) {
            setCheck(true);
            setLoginInfo(prev => ({ ...prev, email: savedEmail }));
        }
    }, [navigate]);

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-right" />
            <div className="auth-main-wrapper">
                <div className="auth-split-container">
                    
                    {/* LEFT SIDE: BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div className="glass-logo-box">
                                <img src='Logo1.png' alt="Althub Logo" style={{ height: '60px', borderRadius: '8px' }} />
                            </div>
                            <h1 className="title-text">Admin <br /> <span className="text-highlight">Control Center.</span></h1>
                            <p className="subtitle-text">Centralized management for system oversight, user directories, and global configurations.</p>
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-shield-alt mr-2"></i> Secure Access</span>
                                <span className="badge-pill-custom"><i className="fa fa-cog mr-2"></i> System Oversight</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: LOGIN FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Admin Login</h2>
                                <p className="text-muted">Enter your administrative credentials to continue</p>
                            </div>
                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">Email Address</label>
                                    <div className="input-wrapper-modern">
                                        <input 
                                            type="email" 
                                            placeholder="admin@althub.com" 
                                            name="email" 
                                            onChange={InputEvent} 
                                            value={loginInfo.email} 
                                        />
                                    </div>
                                    {errors.email_err && <small className="text-danger">{errors.email_err}</small>}
                                </div>
                                <div className="modern-form-group">
                                    <label className="label-modern">Password</label>
                                    <div className="input-wrapper-modern position-relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            name="password" 
                                            onChange={InputEvent} 
                                            value={loginInfo.password} 
                                            style={{ paddingRight: '45px'}} 
                                        />
                                        <span 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="password-toggle-icon"
                                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                        >
                                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                        </span>
                                    </div>
                                    {errors.password_err && <small className="text-danger">{errors.password_err}</small>}
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                                    <label className="checkbox-wrapper d-flex align-items-center">
                                        <input type="checkbox" checked={check} onChange={(e) => setCheck(e.target.checked)} />
                                        <span className="ml-2 text-muted small">Remember Me</span>
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => navigate('/forgot-password')} 
                                        className="btn btn-link p-0 text-navy font-weight-bold small"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? (
                                        <span><i className="fa fa-spinner fa-spin mr-2"></i> AUTHENTICATING...</span>
                                    ) : 'ACCESS CONSOLE'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Login;