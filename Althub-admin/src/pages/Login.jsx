/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import axiosInstance from '../service/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import '../styles/login.css';

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const InputEvent = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    }

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleRememberMeChange = (e) => setRememberMe(e.target.checked);

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            axiosInstance.post('/api/instituteLogin', { email: loginInfo.email.trim().toLowerCase(), password: loginInfo.password })
                .then((response) => {
                    if (response.data.success === true) {
                        toast.success('Login Successful!');
                        
                        const responseData = response.data.data;
                        localStorage.setItem('userDetails', JSON.stringify(responseData));
                        localStorage.setItem('userRole', responseData.role); 

                        localStorage.setItem('AlmaPlus_institute_Id', responseData._id);
                        localStorage.setItem('AlmaPlus_institute_Name', responseData.name);

                        if (rememberMe) {
                            localStorage.setItem('althub_remembered_email', loginInfo.email);
                            localStorage.setItem('althub_remember_me_status', 'true');
                        } else {
                            localStorage.removeItem('althub_remembered_email');
                            localStorage.setItem('althub_remember_me_status', 'false');
                        }

                        setTimeout(() => {
                            setDisable(false);
                            if (responseData.role === 'alumni_office') {
                                navigate('/dashboard'); 
                            } else if (responseData.role === 'placement_cell') {
                                navigate('/dashboard'); 
                            } else {
                                navigate('/dashboard');
                            }
                        }, 1000);

                    } else {
                        setDisable(false);
                        toast.error('Invalid Email or Password');
                    }
                }).catch((error) => {
                    setDisable(false);
                    console.error("Login Error:", error);
                    toast.error(error.response?.data?.msg || "Login Failed.");
                })
        }
    }

    const validate = () => {
        let errors = {};
        let isValid = true;
        if (!loginInfo.email) { isValid = false; errors["email_err"] = "Email Address is required"; }
        if (!loginInfo.password) { isValid = false; errors["password_err"] = "Password is required"; }
        setErrors(errors);
        return isValid;
    }

    useEffect(() => {
        if (localStorage.getItem("token") && localStorage.getItem("userDetails")) {
            navigate('/dashboard');
        }
        
        const savedStatus = localStorage.getItem('althub_remember_me_status');
        if (savedStatus === 'true') {
            setRememberMe(true);
            setLoginInfo((prev) => ({
                ...prev,
                email: localStorage.getItem('althub_remembered_email') || ''
            }));
        }
    }, [navigate]);

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-right" />

            <div className="auth-main-wrapper">
                <div className="auth-split-container">
                    
                    {/* --- UPDATED LEFT SIDE: BRAND VISUALS --- */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div className="glass-logo-box">
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '65px', borderRadius: '8px' }} />
                            </div>
                            
                            <h1 className="title-text">Welcome <br /> to <span className="text-highlight">Althub.</span></h1>
                            
                            <p className="subtitle-text">
                                The unified ecosystem for modern Institutions, Alumni Offices, and Placement Cells.
                            </p>
                            
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-university mr-2"></i> Campus</span>
                                <span className="badge-pill-custom"><i className="fa fa-users mr-2"></i> Alumni</span>
                                <span className="badge-pill-custom"><i className="fa fa-briefcase mr-2"></i> Placement</span>
                            </div>
                        </div>
                    </div>
                    {/* ---------------------------------------- */}

                    {/* RIGHT SIDE: FORM (UNCHANGED) */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '55px', borderRadius: '8px', marginBottom: '10px' }} />
                                <h3 className="font-weight-bold text-navy">Althub Portal</h3>
                            </div>
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Login to Althub</h2>
                                <p className="text-muted">Enter your departmental credentials to continue</p>
                            </div>
                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">Email Address</label>
                                    <div className={`input-wrapper-modern ${errors.email_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-envelope-open icon-left"></i>
                                        <input type="email" placeholder="eg@edu.com" name="email" onChange={InputEvent} value={loginInfo.email} autoComplete="email" />
                                    </div>
                                    {errors.email_err && <div className="error-msg-modern">{errors.email_err}</div>}
                                </div>
                                <div className="modern-form-group">
                                    <label className="label-modern">Password</label>
                                    <div className={`input-wrapper-modern ${errors.password_err ? 'error-border' : ''}`} style={{ position: 'relative' }}>
                                        <i className="fa fa-shield-alt icon-left"></i>
                                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" name="password" onChange={InputEvent} value={loginInfo.password} style={{ paddingRight: '45px' }} autoComplete="current-password" />
                                        <span onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                    {errors.password_err && <div className="error-msg-modern">{errors.password_err}</div>}
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                                    <label className="custom-checkbox-container">
                                        <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} />
                                        <div className="checkmark-box"></div> Remember Me
                                    </label>
                                    <a onClick={() => navigate('/forgot-password')} className="forgot-pass-link" style={{ cursor: 'pointer', color: '#002b5b', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
                                </div>
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? 'VERIFYING...' : 'ACCESS DASHBOARD'}
                                </button>
                                
                                <div className="signup-redirect-wrapper">
                                    <p className="signup-text">New to Althub?</p>
                                    <button 
                                        type="button" 
                                        className="btn-signup-link" 
                                        onClick={() => navigate('/register')}
                                    >
                                        Create a new account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default Login;
