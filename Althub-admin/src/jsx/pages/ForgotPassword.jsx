import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { ALTHUB_API_URL } from '../baseURL';
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
        </div>
    )
}

export default ForgotPassword;