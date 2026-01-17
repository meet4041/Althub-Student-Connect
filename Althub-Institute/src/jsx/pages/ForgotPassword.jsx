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

    const InputEvent = (e) => setEmail(e.target.value);

    const validate = () => {
        if (!email) { setErr("Please Enter Email Address"); return false; }
        setErr(""); return true;
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            axios.post(`${ALTHUB_API_URL}/api/instituteForgetPassword`, { email })
                .then((response) => {
                    if (response.data.success) {
                        toast.success(response.data.msg || "Reset link sent!");
                        setTimeout(() => navigate('/'), 2000);
                    }
                }).catch((error) => {
                    setDisable(false);
                    toast.error(error.response?.data?.message || "Something went wrong");
                })
        }
    }

    return (
        <Fragment>
            <ToastContainer theme="colored" position="top-right" />
            <div className="auth-main-wrapper">
                <div className="auth-split-container">

                    {/* LEFT SIDE: BRAND VISUALS (Identical to Login) */}
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

                    {/* RIGHT SIDE: FORGOT PASSWORD FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '55px', borderRadius: '8px', marginBottom: '10px' }} />
                                <h3 className="font-weight-bold text-navy">Althub Institute</h3>
                            </div>
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Forgot Password?</h2>
                                <p className="text-muted">Enter the email associated with your account</p>
                            </div>
                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">Registered Email</label>
                                    <div className={`input-wrapper-modern ${err ? 'error-border' : ''}`}>
                                        <i className="fa fa-envelope-open icon-left"></i>
                                        <input type="email" placeholder="your@institute.com" value={email} onChange={InputEvent} />
                                    </div>
                                    {err && <div className="error-msg-modern">{err}</div>}
                                </div>
                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? 'PROCESSING...' : 'SEND RESET LINK'}
                                </button>
                                <div className="text-center mt-4">
                                    <p className="text-muted">Remember credentials? <Link to="/" style={{ fontWeight: '600', color: '#004e92', textDecoration: 'none' }}>Back to Login</Link></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default ForgotPassword;