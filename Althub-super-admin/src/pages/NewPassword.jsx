import React, { useState, Fragment, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../services/axios';

import '../styles/login.css';

const NewPassword = () => {
    const navigate = useNavigate();
    const queryParameters = new URLSearchParams(window.location.search);
    const token = queryParameters.get('token');

    const [form, setForm] = useState({ password: '', confirm_password: '' });
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const validatePasswordStrength = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

    const validate = () => {
        const nextErrors = {};
        if (!form.password) nextErrors.password = 'Please enter a new password';
        else if (!validatePasswordStrength(form.password)) nextErrors.password = '8+ chars with uppercase, lowercase, and number.';
        if (!form.confirm_password) nextErrors.confirm_password = 'Please confirm your password';
        if (form.password && form.confirm_password && form.password !== form.confirm_password) {
            nextErrors.confirm_password = 'Passwords do not match';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('Reset token missing. Please request a new link.');
            return;
        }
        if (validate()) {
            setDisable(true);
            axiosInstance.post(`/api/resetpassword?token=${token}`, {
                password: form.password,
            }).then((response) => {
                if (response.data.success === true) {
                    toast.success(response.data.msg || 'Password reset successful');
                    setTimeout(() => navigate('/', { replace: true }), 2000);
                } else {
                    setDisable(false);
                    toast.error(response.data.msg || 'Password reset failed');
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.msg || 'Password reset failed');
            });
        }
    };

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
    }, []);

    return (
        <Fragment>
            <ToastContainer autoClose={2500} hideProgressBar theme="colored" />
            <div className="auth-main-wrapper">
                <div className="auth-split-container">
                    {/* LEFT SIDE: BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div className="glass-logo-box">
                                <img src='Logo1.png' alt="Althub Logo" style={{ height: '60px', borderRadius: '8px' }} />
                            </div>
                            <h1 className="title-text">Reset <br /> <span className="text-highlight">password.</span></h1>
                            <p className="subtitle-text">Create a strong new password for your super admin account.</p>
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-shield-alt mr-2"></i> Secure Reset</span>
                                <span className="badge-pill-custom"><i className="fa fa-lock mr-2"></i> Encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: RESET FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Set New Password</h2>
                                <p className="text-muted">Enter and confirm your new password</p>
                            </div>

                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">New Password</label>
                                    <div className={`input-wrapper-modern ${errors.password ? 'error-border' : ''}`}>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                </div>

                                <div className="modern-form-group">
                                    <label className="label-modern">Confirm Password</label>
                                    <div className={`input-wrapper-modern ${errors.confirm_password ? 'error-border' : ''}`}>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            placeholder="Re-enter password"
                                            value={form.confirm_password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.confirm_password && <small className="text-danger">{errors.confirm_password}</small>}
                                </div>

                                <button type="submit" className="btn-modern-submit mt-2" disabled={disable}>
                                    {disable ? 'PROCESSING...' : 'UPDATE PASSWORD'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0 text-muted small font-weight-bold">
                                    Remembered your credentials?{' '}
                                    <Link to='/' className="text-primary text-decoration-none">
                                        <b>Sign In</b>
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default NewPassword;
