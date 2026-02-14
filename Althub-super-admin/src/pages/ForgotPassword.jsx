import React, { useState, useEffect, Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { ALTHUB_API_URL } from '../config/baseURL';
import axios from 'axios';

// SHARED LOGIN STYLES
import '../styles/login.css';

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
            setErr("Registered Email is required");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            isValid = false;
            setErr("Please enter a valid administrative email");
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
                toast.error(error.response?.data?.msg || "Recovery attempt failed");
            })
        }
    }

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
                    
                    {/* LEFT SIDE: SHARED BRAND VISUALS */}
                    <div className="auth-visual-side d-none d-lg-flex">
                        <div className="mesh-overlay"></div>
                        <div className="visual-inner">
                            <div className="glass-logo-box">
                                <img src='Logo1.png' alt="Althub Logo" style={{ height: '60px', borderRadius: '8px' }} />
                            </div>
                            <h1 className="title-text">Secure <br /> <span className="text-highlight">Recovery.</span></h1>
                            <p className="subtitle-text">Administrative account recovery protocol. Enter your registered email to receive a secure reset link.</p>
                            <div className="feature-badges mt-5">
                                <span className="badge-pill-custom"><i className="fa fa-envelope-open mr-2"></i> Verified Dispatch</span>
                                <span className="badge-pill-custom"><i className="fa fa-key mr-2"></i> Access Rotation</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: RECOVERY FORM */}
                    <div className="auth-form-side">
                        <div className="form-card-inner">
                            <div className="form-heading mb-5">
                                <h2 className="font-weight-bold text-navy">Recover Password</h2>
                                <p className="text-muted small">Authentication credentials lost? Initiate recovery below.</p>
                            </div>

                            <form onSubmit={submitHandler}>
                                <div className="modern-form-group">
                                    <label className="label-modern">Administrative Email</label>
                                    <div className="input-wrapper-modern">
                                        <input 
                                            type="email" 
                                            name="email" 
                                            placeholder="admin@althub.com" 
                                            value={email} 
                                            onChange={InputEvent} 
                                        />
                                    </div>
                                    {err && <small className="text-danger font-weight-bold" style={{fontSize: '11px'}}>{err}</small>}
                                </div>

                                <button type="submit" className="btn-modern-submit mt-3" disabled={disable}>
                                    {disable ? (
                                        <span><i className="fa fa-spinner fa-spin mr-2"></i> DISPATCHING...</span>
                                    ) : (
                                        <>SEND RESET LINK <i className="fa fa-paper-plane ml-2"></i></>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-5">
                                <p className="mb-0 text-muted small font-weight-bold">
                                    RECALLED YOUR CREDENTIALS?{' '}
                                    <Link to='/' className="text-primary text-decoration-none">
                                        <b>SIGN IN</b>
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-5 pt-5 text-center opacity-50">
                                <p className="small font-weight-bold text-uppercase letter-spacing-1">
                                    Protected by Althub Security Protocol
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