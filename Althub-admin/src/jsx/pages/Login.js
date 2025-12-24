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

            <style dangerouslySetInnerHTML={{
                __html: `
                .soft-login-wrapper {
                    background: #f4f7fa;
                    background-image: radial-gradient(#d1d9e6 1px, transparent 1px);
                    background-size: 20px 20px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }

                .login-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 45px;
                    width: 100%;
                    max-width: 420px;
                    border: 1px solid #e1e8f0;
                }

                .brand-logo { height: 45px; margin-bottom: 15px; }
                .dau-brand { color: #1a202c; font-weight: 700; font-size: 24px; }
                .admin-light { color: #3182ce; font-weight: 400; }
                .login-hint { color: #718096; font-size: 14px; }

                .input-field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .input-wrapper { position: relative; }
                .icon-left { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #a0aec0; }

                /* EYE BUTTON STYLE */
                .password-toggle-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #a0aec0;
                    cursor: pointer;
                    padding: 5px;
                    transition: color 0.2s;
                    outline: none !important;
                }
                .password-toggle-btn:hover { color: #3182ce; }

                .input-field input {
                    width: 100%;
                    padding: 12px 15px 12px 42px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    font-size: 15px;
                    outline: none;
                }

                .input-field input:focus {
                    border-color: #3182ce;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                .has-error input { border-color: #e53e3e; }
                .custom-check { display: flex; align-items: center; font-size: 13px; color: #718096; cursor: pointer; }
                .custom-check input { margin-right: 8px; }
                .link-btn { background: none; border: none; color: #3182ce; font-size: 13px; font-weight: 600; cursor: pointer; }

                .submit-btn {
                    width: 100%;
                    background: #2b6cb0;
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                }
                .submit-btn:hover { background: #2c5282; transform: translateY(-1px); }
                .card-footer-text { margin-top: 30px; text-align: center; font-size: 11px; color: black; text-transform: uppercase; }
            `}} />
        </div>
    )
}

export default Login;