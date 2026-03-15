/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { ALTHUB_API_URL } from "../config/baseURL";
import axiosInstance from '../service/axios';

// COMPANY STANDARD: Import external CSS files
import '../styles/login.css';    // Shared split-screen layout
import '../styles/password.css'; // Page-specific styles

function NewPassword() {
    const queryParameters = new URLSearchParams(window.location.search)
    const token = queryParameters.get("token")
    const navigate = useNavigate();
    const [changepass, setChangePass] = useState({
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const validatePasswordStrength = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

    const validate = () => {
        let input = changepass;
        let errors = {};
        let isValid = true;
        if (!input["password"]) {
            isValid = false;
            errors["new_password_err"] = "Please Enter New Password";
        } else if (!validatePasswordStrength(input["password"])) {
            isValid = false;
            errors["new_password_err"] = "8+ chars with uppercase, lowercase, and number.";
        }
        if (!input["confirm_password"]) {
            isValid = false;
            errors["confirm_password_err"] = "Please Enter Confirm Password";
        }
        if (input["password"] !== input["confirm_password"]) {
            isValid = false;
            errors["confirm_password_err"] = "Password Doesn't Match";
        }
        setErrors(errors);
        return isValid;
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const myurl = `${ALTHUB_API_URL}/api/instituteResetPassword?token=${token}`;
            axiosInstance({
                method: "post",
                url: myurl,
                data: {
                    password: changepass.password
                },
            }).then((response) => {
                if (response.data.success === true) {
                    setDisable(false);
                    toast.success(response.data.msg);
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response.data.msg);
            })
        }
    };

    const handleChange = (e) => {
        const newPass = { ...changepass };
        newPass[e.target.name] = e.target.value;
        setChangePass(newPass);
    };

    return (
        <>
            <ToastContainer theme="colored" position="top-right" />

            <div className="auth-main-wrapper">
                <div className="auth-split-container">

                    {/* LEFT SIDE: BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', display: 'inline-block', marginBottom: '25px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '70px', borderRadius: '6px' }} />
                            </div>
                            <h1 className="title-text">Althub <span className="text-highlight">Admin</span></h1>
                            <p className="subtitle-text">Create a strong new password to keep your account secure.</p>
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-shield-alt mr-2"></i> Secure Reset</span>
                                <span className="badge-pill-custom"><i className="fa fa-lock mr-2"></i> Encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: RESET FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            {/* Mobile Logo View */}
                            <div className="mobile-header d-lg-none text-center mb-4">
                                <img src='Logo1.jpeg' alt="logo" style={{ height: '55px', borderRadius: '8px', marginBottom: '10px' }} />
                                <h3 className="font-weight-bold text-navy">Althub Admin</h3>
                            </div>

                            <div className="form-heading mb-4">
                                <h2 className="font-weight-bold text-navy">Set New Password</h2>
                                <p className="text-muted">Enter and confirm your new password</p>
                            </div>

                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">New Password</label>
                                    <div className={`input-wrapper-modern ${errors.new_password_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-lock icon-left"></i>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            name="password"
                                            onChange={handleChange}
                                            value={changepass.password}
                                        />
                                    </div>
                                    {errors.new_password_err && <div className="error-msg-modern">{errors.new_password_err}</div>}
                                </div>

                                <div className="modern-form-group">
                                    <label className="label-modern">Confirm Password</label>
                                    <div className={`input-wrapper-modern ${errors.confirm_password_err ? 'error-border' : ''}`}>
                                        <i className="fa fa-lock icon-left"></i>
                                        <input
                                            type="password"
                                            placeholder="Re-enter password"
                                            name="confirm_password"
                                            onChange={handleChange}
                                            value={changepass.confirm_password}
                                        />
                                    </div>
                                    {errors.confirm_password_err && <div className="error-msg-modern">{errors.confirm_password_err}</div>}
                                </div>

                                <button type="submit" className="btn-modern-submit" disabled={disable}>
                                    {disable ? "PROCESSING..." : "UPDATE PASSWORD"}
                                </button>

                                <div className="text-center mt-3">
                                    <p className="text-muted">
                                        Remember credentials?
                                        <Link to="/" className="back-to-login-link ml-1">
                                            Back to Login
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NewPassword;
