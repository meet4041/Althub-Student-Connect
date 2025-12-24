import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../service/axios';

const Register = () => {
    const navigate = useNavigate();

    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        masterKey: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // 1. Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        // 2. STRONG PASSWORD VALIDATION
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            return toast.error("Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number.");
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/registerInstitute', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                masterKey: formData.masterKey
            });

            if (response.data.success) {
                toast.success("Institute Registered Successfully!");
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        // Apply body background for the auth page
        document.body.style.backgroundColor = '#F1F5F9';

        return () => {
            document.body.style.backgroundColor = '';
        }
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
            <ToastContainer />

            <div className="login-container" style={{ width: '100%', maxWidth: '500px', padding: '20px' }}>
                {/* Header / Logo Section */}
                <div className="text-center mb-4">
                    <div className="d-flex justify-content-center align-items-center mb-2">
                        <img src="Logo1.jpeg" alt="Logo" style={{ width: '40px', borderRadius: '6px', marginRight: '10px' }} />
                        <h2 className="mb-0 font-weight-bold" style={{ color: themeColor }}>Althub</h2>
                    </div>
                    <h5 className="text-muted font-weight-normal">Secure Institute Registration</h5>
                </div>

                {/* White Card */}
                <div className="card border-0 shadow-lg" style={{ borderRadius: '15px', backgroundColor: '#ffffff' }}>
                    <div className="card-body p-5">
                        <form onSubmit={submitHandler}>

                            <div className="form-group mb-3">
                                <label className="small font-weight-bold text-muted">INSTITUTE NAME</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control form-control-lg"
                                    placeholder="e.g. Springfield University"
                                    onChange={handleInput}
                                    required
                                    style={{ fontSize: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-6 form-group mb-3">
                                    <label className="small font-weight-bold text-muted">EMAIL ADDRESS</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control form-control-lg"
                                        placeholder="admin@institute.edu"
                                        onChange={handleInput}
                                        required
                                        style={{ fontSize: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                                <div className="col-md-6 form-group mb-3">
                                    <label className="small font-weight-bold text-muted">PHONE NUMBER</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="form-control form-control-lg"
                                        placeholder="+1 234 567 890"
                                        onChange={handleInput}
                                        required
                                        style={{ fontSize: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 form-group mb-3">
                                    <label className="small font-weight-bold text-muted">PASSWORD</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        placeholder="Create password"
                                        onChange={handleInput}
                                        required
                                        style={{ fontSize: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                                <div className="col-md-6 form-group mb-3">
                                    <label className="small font-weight-bold text-muted">CONFIRM</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control form-control-lg"
                                        placeholder="Repeat password"
                                        onChange={handleInput}
                                        required
                                        style={{ fontSize: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                            </div>

                            {/* Master Key Section - Styled for attention but professional */}
                            <div className="form-group mb-4">
                                <label className="small font-weight-bold" style={{ color: themeColor }}>
                                    <i className="fa fa-key mr-1"></i> SECURITY MASTER KEY
                                </label>
                                <input
                                    type="password"
                                    name="masterKey"
                                    className="form-control form-control-lg"
                                    style={{
                                        border: `2px solid ${themeColor}40`, // Transparent blue border
                                        backgroundColor: '#EFF6FF', // Very light blue bg
                                        color: '#1E293B',
                                        fontSize: '15px'
                                    }}
                                    placeholder="Enter authorization key"
                                    onChange={handleInput}
                                    required
                                />
                                <small className="text-muted">This key is required to authorize new institute accounts.</small>
                            </div>

                            <div className="login-buttons">
                                <button type="submit" className="btn btn-block btn-lg shadow-sm font-weight-bold text-white"
                                    disabled={loading}
                                    style={{ backgroundColor: themeColor, border: 'none', borderRadius: '8px' }}>
                                    {loading ? (
                                        <span><i className="fa fa-spinner fa-spin mr-2"></i> Registering...</span>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </div>

                            <div className="m-t-20 text-center mt-4">
                                <span className="text-muted">Already registered? </span>
                                <Link to="/login" className="font-weight-bold" style={{ color: themeColor }}>
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center mt-3 text-muted small">
                    &copy; 2025 Althub Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Register;