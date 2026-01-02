/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [check, setCheck] = useState(false);
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const InputEvent = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleRememberMe = (e) => {
        setCheck(e.target.checked);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const myurl = `${ALTHUB_API_URL}/api/instituteLogin`;

            axios.post(myurl, {
                email: loginInfo.email,
                password: loginInfo.password
            })
                .then((response) => {
                    if (response.data.success === true) {
                        toast.success('Login Successful! Redirecting...');
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                        localStorage.setItem('AlmaPlus_institute_Id', response.data.data._id);
                        localStorage.setItem('AlmaPlus_institute_Name', response.data.data.name);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                        if (check) {
                            localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Enabled');
                            localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                            localStorage.setItem('AlmaPlus_Admin_Password', loginInfo.password);
                        } else {
                            localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Disabled');
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
                    toast.error(error.response?.data?.msg || "Login Failed. Check connection.");
                })
        }
    }

    const validate = () => {
        let errors = {};
        let isValid = true;
        if (!loginInfo.email) {
            isValid = false;
            errors["email_err"] = "Email Address is required";
        }
        if (!loginInfo.password) {
            isValid = false;
            errors["password_err"] = "Password is required";
        }
        setErrors(errors);
        return isValid;
    }

    useEffect(() => {
        if (localStorage.getItem("AlmaPlus_institute_Id") || localStorage.getItem("token")) {
            navigate('/dashboard');
        }

        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';

        const container = document.getElementById("page-container");
        if (container) container.classList.add("show");

        if (localStorage.getItem('AlmaPlus_Admin_Remember_Me') === 'Enabled') {
            setCheck(true);
            setLoginInfo({
                email: localStorage.getItem('AlmaPlus_Admin_Email') || '',
                password: localStorage.getItem('AlmaPlus_Admin_Password') || ''
            });
        }
    }, [navigate]);

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-center" />

            <div className="auth-main-wrapper">
                <div className="auth-split-container">

                    {/* LEFT SIDE: BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <img src='Logo1.jpeg' className="main-logo-glow" alt="logo" />
                            <h1 className="title-text">Althub <span className="text-highlight">Institute</span></h1>
                            <p className="subtitle-text">Empowering the next generation of educators with advanced analytics and seamless management.</p>

                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-shield-alt mr-2"></i> Secure SSL</span>
                                <span className="badge-pill-custom"><i className="fa fa-check-circle mr-2"></i> Admin Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: LOGIN FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' className="mobile-logo" alt="logo" />
                                <h3 className="font-weight-bold text-navy">Althub Institute</h3>
                            </div>

                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Institute Sign In</h2>
                                <p className="text-muted">Enter your registered institutional credentials</p>
                            </div>

                            <form onSubmit={submitHandler}>
                                {/* Email Field */}
                                <div className="modern-form-group">
                                    <label className="label-modern">Email Address</label>
                                    <div className={`input-wrapper-modern ${errors.email_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-envelope-open icon-left"></i>
                                        <input
                                            type="email"
                                            placeholder="test@institute.com"
                                            name="email"
                                            onChange={InputEvent}
                                            value={loginInfo.email}
                                        />
                                    </div>
                                    {errors.email_err && <div className="error-msg-modern">{errors.email_err}</div>}
                                </div>

                                {/* Password Field */}
                                <div className="modern-form-group">
                                    <label className="label-modern">Secure Password</label>
                                    <div className={`input-wrapper-modern ${errors.password_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-shield-alt icon-left"></i>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            name="password"
                                            onChange={InputEvent}
                                            value={loginInfo.password}
                                        />
                                    </div>
                                    {errors.password_err && <div className="error-msg-modern">{errors.password_err}</div>}
                                </div>

                                {/* Remember & Forgot Password */}
                                <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                                    <label className="checkbox-container-modern">
                                        <input type="checkbox" checked={check} onChange={handleRememberMe} />
                                        <span className="checkmark"></span>
                                        Remember Me
                                    </label>
                                    <a onClick={() => navigate('/forgot-password')} className="forgot-pass-link">
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? (
                                        <><i className="fa fa-circle-notch fa-spin mr-2"></i> AUTHENTICATING...</>
                                    ) : (
                                        'SIGN IN TO DASHBOARD'
                                    )}
                                </button>
                            </form>

                            <div className="footer-notice text-center mt-5">
                                <p className="text-muted small">
                                    <i className="fa fa-lock mr-2"></i>
                                    Althub Protocol v2.0 Secured Endpoint
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Login;