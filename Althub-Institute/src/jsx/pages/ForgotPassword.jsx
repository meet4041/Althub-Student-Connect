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
        if (loader) loader.style.display = 'none';

        const container = document.getElementById("page-container");
        if (container) container.classList.add("show");
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
        </Fragment>
    )
}

export default ForgotPassword;