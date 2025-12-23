/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [check, setCheck] = useState(false);
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const InputEvent = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleRememberMe = (e) => {
        setCheck(e.target.checked);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const myurl = `${ALTHUB_API_URL}/api/instituteLogin`;
            
            axios.post(myurl, {
                email: loginInfo.email,
                password: loginInfo.password
            })
            .then((response) => {
                if (response.data.success === true) {
                    toast.success('Login Successful! Redirecting...');
                    
                    // --- SECURITY: Store Token and session version ---
                    localStorage.setItem('token', response.data.token); 
                    localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                    localStorage.setItem('AlmaPlus_institute_Id', response.data.data._id);
                    localStorage.setItem('AlmaPlus_institute_Name', response.data.data.name);
                    
                    // Set global auth header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                    if (check) {
                        localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Enabled');
                        localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                        localStorage.setItem('AlmaPlus_Admin_Password', loginInfo.password);
                    } else {
                        localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Disabled');
                    }
                    
                    // Short delay for better UX
                    setTimeout(() => {
                        setDisable(false);
                        navigate('/dashboard', { replace: true });
                    }, 1500);
                } else {
                    setDisable(false);
                    toast.error('Invalid Email or Password');
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.msg || "Login Failed. Check connection.");
            })
        }
    }

    const validate = () => {
        let errors = {};
        let isValid = true;
        if (!loginInfo.email) {
            isValid = false;
            errors["email_err"] = "Email Address is required";
        }
        if (!loginInfo.password) {
            isValid = false;
            errors["password_err"] = "Password is required";
        }
        setErrors(errors);
        return isValid;
    }

    useEffect(() => {
        if (localStorage.getItem("AlmaPlus_institute_Id") || localStorage.getItem("token")) {
            navigate('/dashboard');
        }
        
        const loader = document.getElementById('page-loader');
        if(loader) loader.style.display = 'none';
        
        const container = document.getElementById("page-container");
        if(container) container.classList.add("show");

        if (localStorage.getItem('AlmaPlus_Admin_Remember_Me') === 'Enabled') {
            setCheck(true);
            setLoginInfo({
                email: localStorage.getItem('AlmaPlus_Admin_Email') || '',
                password: localStorage.getItem('AlmaPlus_Admin_Password') || ''
            });
        }
    }, [navigate]);

    return (
        <Fragment>
            <ToastContainer />
            {/* Background Layer */}
            <div className="login-cover">
                <div className="login-cover-image" style={{ backgroundImage: "url(assets/img/login-bg/login-bg-11.jpg)" }}></div>
                <div className="login-cover-bg"></div>
            </div>
            
            <div id="page-container" className="fade">
                <div className="login login-v2">
                    {/* Modern Glass Header */}
                    <div className="login-header" style={{ background: 'rgba(0,0,0,0.6)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '25px' }}>
                        <div className="brand">
                            <div className="d-flex align-items-center">
                                <img src='Logo1.jpeg' style={{ width: '100px', height: 'auto', borderRadius: "6px", border: '2px solid #28a745', marginRight: '15px' }} alt="logo" />
                                <div>
                                    <b className="text-white">Althub</b> <span className="text-success">Institute</span>
                                    <small className="text-white-50">Portal Authentication</small>
                                </div>
                            </div>
                        </div>
                        <div className="icon">
                            <i className="fa fa-university text-success"></i>
                        </div>
                    </div>

                    {/* Clean Content Area */}
                    <div className="login-content" style={{ background: '#ffffff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', padding: '40px' }}>
                        <form onSubmit={submitHandler} className="margin-bottom-0">
                            
                            <label className="control-label text-dark font-weight-bold">Registered Email <span className="text-danger">*</span></label>
                            <div className="m-b-20">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light border-right-0">
                                            <i className="fa fa-envelope text-success"></i>
                                        </span>
                                    </div>
                                    <input type="email" className="form-control form-control-lg border-left-0" placeholder="name@institute.com" name="email" onChange={InputEvent} value={loginInfo.email} style={{ borderLeft: 'none' }} />
                                </div>
                                <div className="text-danger small mt-1">{errors.email_err}</div>
                            </div>

                            <label className="control-label text-dark font-weight-bold">Security Password <span className="text-danger">*</span></label>
                            <div className="m-b-15">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light border-right-0">
                                            <i className="fa fa-key text-success"></i>
                                        </span>
                                    </div>
                                    <input type="password" core-index="1" className="form-control form-control-lg border-left-0" placeholder="••••••••" name="password" onChange={InputEvent} value={loginInfo.password} style={{ borderLeft: 'none' }} />
                                </div>
                                <div className="text-danger small mt-1">{errors.password_err}</div>
                            </div>

                            {/* Responsive Link Layout */}
                            <div className="d-flex justify-content-between align-items-center m-b-25">
                                <div className="checkbox checkbox-css checkbox-inline">
                                    <input type="checkbox" id="remember_me" checked={check} onChange={handleRememberMe} />
                                    <label htmlFor="remember_me" className="text-dark">Remember Me</label>
                                </div>
                                <a onClick={() => navigate('/forgot-password')} className="text-success font-weight-bold" style={{ cursor: "pointer", fontSize: '13px', textDecoration: 'none' }}>
                                    Forgot Password?
                                </a>
                            </div>

                            <div className="login-buttons">
                                <button type="submit" className="btn btn-success btn-block btn-lg font-weight-bold shadow-sm" disabled={disable} style={{ borderRadius: '8px' }}>
                                    {disable ? (
                                        <><i className="fa fa-circle-notch fa-spin m-r-10"></i> Securing Session...</>
                                    ) : (
                                        'LOGIN TO DASHBOARD'
                                    )}
                                </button>
                            </div>
                            
                            <hr className="bg-light m-t-30" />
                            
                            <div className="text-center">
                                <p className="text-muted small mb-0">
                                    <i className="fa fa-shield-alt m-r-5"></i> Protected by Althub Security Protocol v2.0
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Login;