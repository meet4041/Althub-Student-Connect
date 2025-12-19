import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { ALTHUB_API_URL } from '../../baseURL';
import axios from 'axios';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [err, setErr] = useState('');
    const [disable, setDisable] = useState(false);

    const InputEvent = (e) => {
        setEmail(e.target.value);
        if (err) setErr("");
    }

    const validate = () => {
        let isValid = true;
        if (!email) {
            isValid = false;
            setErr("Username or Email is required");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            isValid = false;
            setErr("Please enter a valid email address");
        }
        return isValid;
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const myurl = `${ALTHUB_API_URL}/api/forgetpassword`;
            axios({
                method: "post",
                url: myurl,
                data: { email: email },
            }).then((response) => {
                if (response.data.success === true) {
                    setDisable(false);
                    toast.success("Recovery instructions sent to your email");
                    setTimeout(() => {
                        navigate('/');
                    }, 2500);
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.message || "Recovery attempt failed");
            })
        }
    }

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
    }, []);

    return (
        <div className="soft-login-wrapper">
            <ToastContainer autoClose={2000} hideProgressBar />
            
            <div className="login-card shadow-lg">
                <div className="login-header text-center">
                    <img src='Logo1.png' alt="Logo" className="brand-logo" />
                    <h2 className="dau-brand">DAU <span className="admin-light">ADMIN</span></h2>
                    <p className="login-hint">Account Recovery System</p>
                </div>

                <div className="alert alert-info py-2 px-3 mb-4" style={{ fontSize: '12px', borderRadius: '10px', backgroundColor: '#ebf8ff', border: '1px solid #bee3f8', color: '#2b6cb0' }}>
                    <i className="fa fa-info-circle mr-2"></i>
                    Enter your email to receive a password reset link.
                </div>

                <form onSubmit={submitHandler} className="login-form">
                    <div className={`input-field ${err ? 'has-error' : ''}`}>
                        <label>Registered Email</label>
                        <div className="input-wrapper">
                            <i className="fa fa-envelope icon-left"></i>
                            <input 
                                type="text" 
                                name="email" 
                                value={email} 
                                onChange={InputEvent} 
                                placeholder="name@example.com" 
                            />
                        </div>
                        {err && <small className="text-danger mt-1 d-block font-weight-bold" style={{ fontSize: '11px' }}>{err}</small>}
                    </div>

                    <button type="submit" className="submit-btn mt-4" disabled={disable}>
                        {disable ? (
                            <><i className="fa fa-spinner fa-spin mr-2"></i> Sending...</>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="mb-0" style={{ color: '#718096', fontSize: '14px' }}>
                        Remember your credentials?{' '}
                        <Link to='/' className="link-btn text-decoration-none">
                            <b>Sign In</b>
                        </Link>
                    </p>
                </div>

                <div className="card-footer-text">
                    <p>Protected by Althub Security Protocol</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
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

                .brand-logo {
                    height: 45px;
                    margin-bottom: 15px;
                }

                .dau-brand {
                    color: #1a202c;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    margin-bottom: 5px;
                    font-size: 24px;
                }

                .admin-light {
                    color: #3182ce;
                    font-weight: 400;
                }

                .login-hint {
                    color: #718096;
                    font-size: 14px;
                    margin-bottom: 25px;
                }

                .input-field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-wrapper {
                    position: relative;
                }

                .icon-left {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #a0aec0;
                }

                .input-field input {
                    width: 100%;
                    padding: 12px 15px 12px 42px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .input-field input:focus {
                    border-color: #3182ce;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                .has-error input { border-color: #e53e3e; }

                .link-btn {
                    color: #3182ce;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .link-btn:hover { color: #2c5282; }

                .submit-btn {
                    width: 100%;
                    background: #2b6cb0;
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .submit-btn:hover {
                    background: #2c5282;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(44, 82, 130, 0.2);
                }

                .submit-btn:disabled {
                    background: #a0aec0;
                    cursor: not-allowed;
                }

                .card-footer-text {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 11px;
                    color: black;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}} />
        </div>
    )
}

export default ForgotPassword;