/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../service/axios';

import '../styles/login.css';
import '../styles/register.css';

const Register = () => {
    const navigate = useNavigate();
    const [institutesList, setInstitutesList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'institute',
        parent_institute_id: '',
        masterKey: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch Institutes
    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                const res = await axiosInstance.get('/api/getInstitutes');
                if (res.data.success) {
                    setInstitutesList(res.data.data || []);
                }
            } catch (err) {
                console.error("API Error - Could not load institutes:", err);
            }
        };
        fetchInstitutes();
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;

        if (name === 'role') {
            let autoName = formData.name;
            if (value === 'alumni_office') autoName = 'Alumni Office';
            else if (value === 'placement_cell') autoName = 'Placement Cell';
            else if (value === 'institute') autoName = '';

            setFormData((prev) => ({
                ...prev,
                role: value,
                name: autoName,
                // Reset parent if switching to Main Institute
                parent_institute_id: value === 'institute' ? '' : prev.parent_institute_id
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validatePasswordStrength = (pwd) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }
        if (!validatePasswordStrength(formData.password)) {
            return toast.error("Password must be 8+ chars with uppercase, lowercase, and number.");
        }
        if (formData.role !== 'institute' && !formData.parent_institute_id) {
            return toast.error("Please select your Parent Institute from the list.");
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                email: (formData.email || '').trim().toLowerCase(),
                name: (formData.name || '').trim().slice(0, 200),
                phone: (formData.phone || '').trim().slice(0, 20)
            };
            delete payload.confirmPassword;
            const response = await axiosInstance.post('/api/registerInstitute', payload);

            if (response.data.success) {
                toast.success(`${formData.role.replace('_', ' ').toUpperCase()} Registered Successfully!`);
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            console.error("Register Error:", error);
            toast.error(error.response?.data?.msg || "Registration Failed.");
        } finally {
            setLoading(false);
        }
    };

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

                            <h1 className="title-text">Welcome <br /> to <span className="text-highlight">Althub Admin</span></h1>

                            <p className="subtitle-text">
                                Create your institutional profile and start managing your campus, alumni, and placements today.
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
                            <div className="form-heading mb-4">
                                <h2 className="font-weight-bold text-navy">Create Account</h2>
                                <p className="text-muted">Enter your departmental credentials</p>
                            </div>

                            <form onSubmit={submitHandler} className="registration-form-layout">
                                <div className="modern-form-group">
                                    <label className="label-modern">ACCOUNT TYPE</label>
                                    <div className="input-wrapper-modern">
                                        <i className="fa fa-building icon-left"></i>
                                        <select name="role" value={formData.role} onChange={handleInput} className="modern-select">
                                            <option value="institute">Institute</option>
                                            <option value="alumni_office">Alumni Office</option>
                                            <option value="placement_cell">Placement Cell</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.role !== 'institute' && (
                                    <div className="modern-form-group" style={{ animation: 'fadeIn 0.5s' }}>
                                        <label className="label-modern">SELECT PARENT INSTITUTE</label>
                                        <div className="input-wrapper-modern">
                                            <i className="fa fa-university icon-left"></i>
                                            <select
                                                name="parent_institute_id"
                                                value={formData.parent_institute_id}
                                                onChange={handleInput}
                                                className="modern-select"
                                                required
                                            >
                                                <option value="">
                                                    {institutesList.length > 0 ? "-- Select Your Institute --" : "Loading Institutes..."}
                                                </option>
                                                {institutesList.map((inst) => (
                                                    <option key={inst._id} value={inst._id}>
                                                        {inst.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {institutesList.length === 0 && (
                                            <small className="text-danger">
                                                No institutes found. Please register a Main Institute first.
                                            </small>
                                        )}
                                    </div>
                                )}

                                <div className="modern-form-group">
                                    <label className="label-modern">OFFICIAL NAME</label>
                                    <div className="input-wrapper-modern">
                                        <i className="fa fa-id-card icon-left"></i>
                                        <input type="text" name="name" value={formData.name} placeholder="Institute Name" onChange={handleInput} required />
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <div className="modern-form-group flex-1">
                                        <label className="label-modern">EMAIL</label>
                                        <div className="input-wrapper-modern">
                                            <input type="email" name="email" placeholder="eg@edu.com" onChange={handleInput} required />
                                        </div>
                                    </div>
                                    <div className="modern-form-group flex-1 ml-2">
                                        <label className="label-modern">PHONE</label>
                                        <div className="input-wrapper-modern">
                                            <input type="text" name="phone" placeholder="Contact" onChange={handleInput} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <div className="modern-form-group flex-1">
                                        <label className="label-modern">PASSWORD</label>
                                        <div className="input-wrapper-modern">
                                            <input type="password" name="password" placeholder="••••••••" onChange={handleInput} required />
                                        </div>
                                    </div>
                                    <div className="modern-form-group flex-1 ml-2">
                                        <label className="label-modern">CONFIRM</label>
                                        <div className="input-wrapper-modern">
                                            <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleInput} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="modern-form-group master-key-container">
                                    <label className="label-modern text-primary">SECURITY MASTER KEY</label>
                                    <div className="input-wrapper-modern master-input-wrapper">
                                        <i className="fa fa-key icon-left"></i>
                                        <input type="password" name="masterKey" placeholder="Authorization Key" onChange={handleInput} required />
                                    </div>
                                </div>

                                <button type="submit" className="btn-modern-submit mt-2" disabled={loading}>
                                    {loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
                                </button>

                                <div className="text-center mt-3">
                                    <p className="text-muted small mb-0">Already registered?</p>
                                    <a onClick={() => navigate('/login')} className="forgot-pass-link" style={{ cursor: 'pointer' }}>Sign In Here</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Register;
