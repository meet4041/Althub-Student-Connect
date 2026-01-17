/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

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
            const myurl = `${ALTHUB_API_URL}/api/instituteLogin`;
            axios.post(myurl, { email: loginInfo.email, password: loginInfo.password })
                .then((response) => {
                    if (response.data.success === true) {
                        toast.success('Login Successful!');
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                        localStorage.setItem('AlmaPlus_institute_Id', response.data.data._id);
                        localStorage.setItem('AlmaPlus_institute_Name', response.data.data.name);

                        if (rememberMe) {
                            localStorage.setItem('althub_remembered_email', loginInfo.email);
                            localStorage.setItem('althub_remembered_password', loginInfo.password);
                            localStorage.setItem('althub_remember_me_status', 'true');
                        } else {
                            localStorage.removeItem('althub_remembered_email');
                            localStorage.removeItem('althub_remembered_password');
                            localStorage.setItem('althub_remember_me_status', 'false');
                        }

                        setTimeout(() => {
                            setDisable(false);
                            navigate('/dashboard', { replace: true });
                        }, 1500);
                    } else {
                        setDisable(false);
                        toast.error('Invalid Email or Password');
                    }
                }).catch((error) => {
                    setDisable(false);
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
        if (localStorage.getItem("token")) navigate('/dashboard');
        const savedStatus = localStorage.getItem('althub_remember_me_status');
        if (savedStatus === 'true') {
            setRememberMe(true);
            setLoginInfo({
                email: localStorage.getItem('althub_remembered_email') || '',
                password: localStorage.getItem('althub_remembered_password') || ''
            });
        }
    }, [navigate]);

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-right" />
            <style>
                {`
                    .custom-checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; font-size: 14px; color: #555; }
                    .custom-checkbox-container input { display: none; }
                    .checkmark-box { height: 18px; width: 18px; background-color: #eee; border-radius: 4px; margin-right: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border: 1px solid #ddd; }
                    .custom-checkbox-container input:checked + .checkmark-box { background-color: #002b5b; border-color: #002b5b; }
                    .checkmark-box:after { content: ""; display: none; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }
                    .custom-checkbox-container input:checked + .checkmark-box:after { display: block; }
                `}
            </style>

            <div className="auth-main-wrapper">
                <div className="auth-split-container">
                    {/* LEFT SIDE: BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', display: 'inline-block', marginBottom: '25px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '70px', borderRadius: '6px' }} />
                            </div>
                            <h1 className="title-text">Althub <span className="text-highlight">Institute</span></h1>
                            <p className="subtitle-text">Empowering the next generation of educators with advanced analytics and seamless management.</p>
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-shield-alt mr-2"></i> Secure SSL</span>
                                <span className="badge-pill-custom"><i className="fa fa-check-circle mr-2"></i> Admin Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '55px', borderRadius: '8px', marginBottom: '10px' }} />
                                <h3 className="font-weight-bold text-navy">Althub Institute</h3>
                            </div>
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Institute Sign In</h2>
                                <p className="text-muted">Enter your registered institutional credentials</p>
                            </div>
                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">Email Address</label>
                                    <div className={`input-wrapper-modern ${errors.email_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-envelope-open icon-left"></i>
                                        <input type="email" placeholder="your@institute.com" name="email" onChange={InputEvent} value={loginInfo.email} />
                                    </div>
                                    {errors.email_err && <div className="error-msg-modern">{errors.email_err}</div>}
                                </div>
                                <div className="modern-form-group">
                                    <label className="label-modern">Password</label>
                                    <div className={`input-wrapper-modern ${errors.password_err ? 'error-border' : ''}`} style={{ position: 'relative' }}>
                                        <i className="fa fa-shield-alt icon-left"></i>
                                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" name="password" onChange={InputEvent} value={loginInfo.password} style={{ paddingRight: '45px' }} />
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
                                    <a onClick={() => navigate('/forgot-password')} className="forgot-pass-link" style={{ cursor: 'pointer', color: '#002b5b' }}>Forgot Password?</a>
                                </div>
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? 'AUTHENTICATING...' : 'SIGN IN TO ALTHUB INSTITUTE'}
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