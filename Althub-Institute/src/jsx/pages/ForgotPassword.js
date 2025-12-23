/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [err, setErr] = useState('');
    const [disable, setDisable] = useState(false);

    const InputEvent = (e) => {
        setEmail(e.target.value);
    }

    const validate = () => {
        let isValid = true;
        if (!email) {
            isValid = false;
            setErr("Please Enter Email Address");
        } else {
            setErr("");
        }
        return isValid;
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const myurl = `${ALTHUB_API_URL}/api/instituteForgetPassword`;
            axios({
                method: "post",
                url: myurl,
                data: { email: email },
            }).then((response) => {
                if (response.data.success === true) {
                    setDisable(false);
                    toast.success(response.data.msg || "Reset link sent successfully!");
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.message || "Something went wrong");
            })
        }
    }

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if(loader) loader.style.display = 'none';
        
        const container = document.getElementById("page-container");
        if(container) container.classList.add("show");
    }, []);

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-center" />
            
            <div className="auth-main-wrapper">
                <div className="auth-split-container">
                    
                    {/* LEFT SIDE: BRAND VISUALS (Consistent with Login) */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <img src='Logo1.jpeg' className="main-logo-glow" alt="logo" />
                            <h1 className="title-text">Account <span className="text-highlight">Recovery</span></h1>
                            <p className="subtitle-text">Don't worry, it happens. Enter your registered email and we'll send you instructions to reset your password.</p>
                            
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-envelope-open mr-2"></i> Recovery Email</span>
                                <span className="badge-pill-custom"><i className="fa fa-user-shield mr-2"></i> Verified Admin</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: FORGOT PASSWORD FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' className="mobile-logo" alt="logo" />
                                <h3 className="font-weight-bold text-navy">Althub Institute</h3>
                            </div>

                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Forgot Password?</h2>
                                <p className="text-muted">Enter the email associated with your account</p>
                            </div>

                            <form onSubmit={submitHandler}>
                                {/* Email Field */}
                                <div className="modern-form-group">
                                    <label className="label-modern">Registered Email</label>
                                    <div className={`input-wrapper-modern ${err ? 'error-border' : ''}`}>
                                        <i className="fa fa-shield-alt icon-left"></i> {/* Using your requested security icon */}
                                        <input 
                                            type="email" 
                                            placeholder="your@institute.com" 
                                            name="email" 
                                            onChange={InputEvent} 
                                            value={email} 
                                        />
                                    </div>
                                    {err && <div className="error-msg-modern">{err}</div>}
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? (
                                        <><i className="fa fa-spinner fa-spin mr-2"></i> PROCESSING...</>
                                    ) : (
                                        'SEND RESET LINK'
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-muted">
                                        Remember your credentials?{" "}
                                        <Link to="/" className="back-to-login">
                                            Back to Login
                                        </Link>
                                    </p>
                                </div>
                            </form>

                            <div className="footer-notice text-center mt-5">
                                <p className="text-muted small">
                                    <i className="fa fa-info-circle mr-2"></i>
                                    Security Check: Protocol v2.0 Active
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

                .auth-split-container { display: flex; height: 100%; }

                /* Left Side Styles */
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

                /* Right Side Styles */
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

                /* Modern Input Styling */
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

                .icon-left { min-width: 50px; text-align: center; color: var(--brand-blue) !important; font-size: 1.2rem; }
                .error-border { border-color: #ff5630 !important; }
                .error-msg-modern { color: #ff5630; font-size: 12px; margin-top: 5px; font-weight: 600; }

                /* Back Link & Button */
                .back-to-login { color: var(--brand-blue); font-weight: 700; text-decoration: none; border-bottom: 2px solid transparent; transition: all 0.3s; }

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
                }

                .mobile-logo { width: 70px; border-radius: 12px; margin-bottom: 10px; border: 2px solid var(--brand-blue); }

                @media (max-width: 991px) {
                    .auth-form-side { background: var(--bg-soft); }
                    .form-card-inner { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                }
            `}</style>
        </Fragment>
    )
}

export default ForgotPassword;