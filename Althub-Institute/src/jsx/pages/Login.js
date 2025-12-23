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

    // --- YOUR EXISTING LOGIC (UNTOUCHED) ---
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

            <style>{`
                :root {
                    --brand-blue: #0052cc;
                    --brand-navy: #091e42;
                    --brand-light-blue: #deebff;
                    --bg-soft: #f4f5f7;
                    --text-main: #172b4d;
                }

                .auth-main-wrapper {
                    height: 100vh;
                    width: 100vw;
                    background: #fff;
                    font-family: 'Inter', -apple-system, sans-serif;
                    overflow: hidden;
                }

                .auth-split-container {
                    display: flex;
                    height: 100%;
                }

                /* Left Side */
                .auth-visual-side {
                    flex: 1.3;
                    position: relative;
                    background: var(--brand-navy);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px;
                    overflow: hidden;
                }

                .mesh-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(at 0% 0%, #0747a6 0px, transparent 50%),
                                radial-gradient(at 100% 100%, #0052cc 0px, transparent 50%);
                    opacity: 0.6;
                }

                .visual-inner { position: relative; z-index: 5; color: white; max-width: 500px; }
                .main-logo-glow { width: 100px; border-radius: 20px; box-shadow: 0 0 30px rgba(0, 82, 204, 0.5); margin-bottom: 40px; }
                .title-text { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; letter-spacing: -1px; }
                .text-highlight { color: #4c9aff; }
                .subtitle-text { font-size: 1.1rem; line-height: 1.6; color: #b3bac5; }

                .badge-pill-custom {
                    background: rgba(255,255,255,0.1);
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 13px;
                    margin-right: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                /* Right Side */
                .auth-form-side {
                    flex: 1;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .form-card-inner { width: 100%; max-width: 420px; }
                .text-navy { color: var(--brand-navy); }

                /* Modern Inputs */
                .modern-form-group { margin-bottom: 24px; position: relative; }
                .label-modern { font-weight: 700; font-size: 13px; color: var(--brand-navy); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }
                
                .input-wrapper-modern {
                    display: flex;
                    align-items: center;
                    background: var(--bg-soft);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }

                .input-wrapper-modern:focus-within {
                    background: #fff;
                    border-color: var(--brand-blue);
                    box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1);
                }

                .input-wrapper-modern input {
                    width: 100%;
                    padding: 14px 14px 14px 0;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 15px;
                    color: var(--text-main);
                }

                .icon-left { padding: 0 18px; color: #6b778c; font-size: 18px; }
                .error-border { border-color: #ff5630 !important; }
                .error-msg-modern { color: #ff5630; font-size: 12px; margin-top: 5px; font-weight: 600; }

                /* Checkbox & Button */
                .checkbox-container-modern {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 14px;
                    color: #5e6c84;
                    position: relative;
                    padding-left: 28px;
                }

                .checkbox-container-modern input { display: none; }
                .checkmark {
                    position: absolute;
                    left: 0;
                    height: 20px;
                    width: 20px;
                    background-color: var(--bg-soft);
                    border-radius: 6px;
                    border: 2px solid #dfe1e6;
                }

                .checkbox-container-modern input:checked ~ .checkmark { background-color: var(--brand-blue); border-color: var(--brand-blue); }
                .checkbox-container-modern input:checked ~ .checkmark:after {
                    content: ""; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px;
                    border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
                }

                .forgot-pass-link { color: var(--brand-blue); font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: none; }

                .btn-modern-submit {
                    width: 100%;
                    padding: 16px;
                    background: var(--brand-blue);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3);
                    cursor: pointer;
                }

                .btn-modern-submit:hover:not(:disabled) {
                    background: var(--brand-navy);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(9, 30, 66, 0.4);
                }

                .btn-modern-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                .mobile-logo { width: 70px; border-radius: 12px; margin-bottom: 10px; border: 2px solid var(--brand-blue); }

                @media (max-width: 991px) {
                    .auth-form-side { background: var(--bg-soft); }
                    .form-card-inner { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                }
            `}</style>
        </Fragment>
    )
}

export default Login;