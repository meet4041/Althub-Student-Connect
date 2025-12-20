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
                    toast.success('Login Successfully');
                    
                    // --- CRITICAL FIX: Save Token and Details ---
                    // Many dashboards check for 'token' or 'userDetails' specifically
                    localStorage.setItem('token', response.data.token); 
                    localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                    
                    localStorage.setItem('AlmaPlus_institute_Id', response.data.data._id);
                    localStorage.setItem('AlmaPlus_institute_Name', response.data.data.name);
                    
                    // Set default header for future requests in this session
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                    if (check) {
                        localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Enabled');
                        localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                        localStorage.setItem('AlmaPlus_Admin_Password', loginInfo.password);
                    } else {
                        localStorage.setItem('AlmaPlus_admin_Remember_Me', 'Disabled');
                    }
                    
                    setDisable(false);
                    // Use replace to prevent back-button looping
                    navigate('/dashboard', { replace: true });
                } else {
                    setDisable(false);
                    toast.error('Incorrect Credentials');
                }
            }).catch((error) => {
                setDisable(false);
                console.error("Login Error:", error);
                if (error.response && error.response.data && error.response.data.msg) {
                    toast.error(error.response.data.msg);
                } else {
                    toast.error("Login Failed. Please check server connection.");
                }
            })
        }
    }

    const validate = () => {
        let errors = {};
        let isValid = true;
        if (!loginInfo.email) {
            isValid = false;
            errors["email_err"] = "Please Enter Email";
        }
        if (!loginInfo.password) {
            isValid = false;
            errors["password_err"] = "Please Enter Password";
        }
        setErrors(errors);
        return isValid;
    }

    useEffect(() => {
        // If we already have a token or ID, go to dashboard
        if (localStorage.getItem("AlmaPlus_institute_Id") || localStorage.getItem("token")) {
            navigate('/dashboard');
        }
        
        // Clean up UI loader
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
            <div id="page-loader" className="fade show">
                <span className="spinner"></span>
            </div>
            <div className="login-cover">
                <div className="login-cover-image" style={{ backgroundImage: "url(assets/img/login-bg/login-bg-11.jpg)" }} data-id="login-cover-image"></div>
                <div className="login-cover-bg"></div>
            </div>
            <div id="page-container" className="fade">
                <div className="login login-v2" data-pageload-addclassname="animated fadeIn">
                    <div className="login-header">
                        <div className="brand">
                            <img src='Logo1.jpeg' style={{ width: '150px', height: '70px', borderRadius: "8px" }} alt="logo" />
                            <b>Institute</b> 
                            <small>Login for Althub Institute panel</small>
                        </div>
                        <div className="icon">
                            <i className="fa fa-lock"></i>
                        </div>
                    </div>
                    <div className="login-content">
                        <form onSubmit={submitHandler}>
                            <div className="form-group m-b-20">
                                <input type="text" className="form-control form-control-lg" placeholder="Email Address" name="email" onChange={InputEvent} value={loginInfo.email} />
                                <div className="text-danger">{errors.email_err}</div>
                            </div>
                            <div className="form-group m-b-20">
                                <input type="password" className="form-control form-control-lg my-3" placeholder="Password" name="password" onChange={InputEvent} value={loginInfo.password} />
                                <a onClick={() => navigate('/forgot-password')} style={{ color: "white", marginLeft: "243px", textDecoration: "underline", cursor: "pointer" }}>Forgot Password</a>
                                <div className="text-danger">{errors.password_err}</div>
                            </div>
                            <div className="form-group m-b-20">
                                <input type='checkbox' checked={check} onChange={handleRememberMe} /> Remember Me
                            </div>
                            <div className="login-buttons">
                                <button type="submit" className="btn btn-success btn-block btn-lg" disabled={disable}>{disable ? 'Processing...' : 'Sign In'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Login;