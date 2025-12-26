import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [check, setCheck] = useState(false);
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    // NEW STATE: Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const InputEvent = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({ ...prev, [name]: value }));
        if (errors[`${name}_err`]) setErrors(prev => ({ ...prev, [`${name}_err`]: null }));
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const bodyFormData = new URLSearchParams();
            bodyFormData.append('auth_code', "Althub");
            bodyFormData.append('email', loginInfo.email);
            bodyFormData.append('password', loginInfo.password);

            axiosInstance.post('/api/adminLogin', bodyFormData)
                .then((response) => {
                    if (response.data.success === true) {
                        toast.success('Authentication Successful');
                        
                        // SECURITY FIX: The token is nested inside response.data.data
                        const adminData = response.data.data;
                        
                        localStorage.setItem('AlmaPlus_admin_Id', adminData._id);
                        localStorage.setItem('AlmaPlus_admin_Name', adminData.name || 'Admin');
                        
                        // CORRECTED: Use adminData.token instead of response.data.token
                        // This prevents "undefined" from being saved to LocalStorage
                        if (adminData.token) {
                            localStorage.setItem('AlmaPlus_admin_Token', adminData.token);
                        } else {
                            console.error("Security Warning: Token missing in response");
                        }

                        if (check) {
                            localStorage.setItem('AlmaPlus_Admin_Remember_Me', 'Enabled');
                            localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                        }
                        
                        // Navigate to dashboard after success
                        setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
                    } else {
                        setDisable(false);
                        toast.error(response.data.msg || 'Invalid Credentials');
                    }
                })
                .catch(() => {
                    setDisable(false);
                    toast.error('Invalid Credentials');
                });
        }
    }

    const validate = () => {
        let errors = {};
        if (!loginInfo.email) errors["email_err"] = "Username required";
        if (!loginInfo.password) errors["password_err"] = "Password required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    useEffect(() => {
        if (localStorage.getItem("AlmaPlus_admin_Id")) navigate('/dashboard');
        const savedEmail = localStorage.getItem('AlmaPlus_Admin_Email');
        if (localStorage.getItem('AlmaPlus_Admin_Remember_Me') === 'Enabled' && savedEmail) {
            setCheck(true);
            setLoginInfo(prev => ({ ...prev, email: savedEmail }));
        }
    }, [navigate]);

    return (
        <div className="soft-login-wrapper">
            <ToastContainer autoClose={2000} />

            <div className="login-card shadow-lg">
                <div className="login-header text-center">
                    <img src='Logo1.png' alt="Logo" className="brand-logo" />
                    <h2 className="dau-brand">DAU <span className="admin-light">ADMIN</span></h2>
                    <p className="login-hint">Please enter your account details</p>
                </div><br></br>

                <form onSubmit={submitHandler} className="login-form">
                    <div className={`input-field ${errors.email_err ? 'has-error' : ''}`}>
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <i className="fa fa-envelope icon-left"></i>
                            <input
                                type="text"
                                name="email"
                                value={loginInfo.email}
                                onChange={InputEvent}
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className={`input-field mt-3 ${errors.password_err ? 'has-error' : ''}`}>
                        <label>Password</label>
                        <div className="input-wrapper">
                            <i className="fa fa-lock icon-left"></i>
                            <input
                                // DYNAMIC TYPE: Switches between password and text
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={loginInfo.password}
                                onChange={InputEvent}
                                placeholder="••••••••"
                                style={{ paddingRight: '45px' }} // Space for the eye button
                            />
                            {/* EYE BUTTON */}
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="options-row d-flex justify-content-between align-items-center mt-3">
                        <label className="custom-check">
                            <input type="checkbox" checked={check} onChange={(e) => setCheck(e.target.checked)} />
                            <span>Stay logged in</span>
                        </label>
                        <button type="button" onClick={() => navigate('/forgot-password')} className="link-btn">
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="submit-btn mt-4" disabled={disable}>
                        {disable ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>

                <div className="card-footer-text">
                    <p>Protected by Althub Security Protocol</p>
                </div>
            </div>
        </div>
    )
}

export default Login;