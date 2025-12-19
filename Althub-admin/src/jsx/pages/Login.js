import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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
        setLoginInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleRememberMe = (e) => {
        setCheck(e.target.checked);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);

            var bodyFormData = new URLSearchParams();
            bodyFormData.append('auth_code', "Althub");
            bodyFormData.append('email', loginInfo.email);
            bodyFormData.append('password', loginInfo.password);

            axiosInstance.post('/api/adminLogin', bodyFormData)
                .then((response) => {
                    if (response.data.success === true && response.data.data) {
                        toast.success('Login Successfully');

                        const adminData = response.data.data;

                        // FIX: Store ALL necessary fields to prevent 'undefined' crashes in Menu/Header
                        localStorage.setItem('AlmaPlus_admin_Id', adminData._id);
                        localStorage.setItem('AlmaPlus_admin_Email', adminData.email);
                        localStorage.setItem('AlmaPlus_admin_Name', adminData.name || 'Admin');
                        localStorage.setItem('AlmaPlus_admin_Pic', adminData.profilepic || '');
                        localStorage.setItem('AlmaPlus_admin_Token', response.data.token);

                        if (check === true) {
                            localStorage.setItem('AlmaPlus_Admin_Remember_Me', 'Enabled');
                            localStorage.setItem('AlmaPlus_Admin_Email', loginInfo.email);
                        } else {
                            localStorage.setItem('AlmaPlus_Admin_Remember_Me', 'Disabled');
                        }

                        setDisable(false);
                        // Using replace: true prevents the user from going back to login page
                        navigate('/dashboard', { replace: true });
                    } else {
                        setDisable(false);
                        toast.error(response.data.msg || 'Incorrect Credentials');
                    }
                })
                .catch((error) => {
                    setDisable(false);
                    console.error("Login Error:", error);
                    toast.error(error.response?.data?.msg || 'Login Failed');
                });
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
        if (localStorage.getItem("AlmaPlus_admin_Id")) {
            navigate('/dashboard');
        }

        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        var element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        if (localStorage.getItem('AlmaPlus_Admin_Remember_Me') === 'Enabled') {
            setCheck(true);
            const savedEmail = localStorage.getItem('AlmaPlus_Admin_Email');
            if (savedEmail) {
                setLoginInfo(prev => ({ ...prev, email: savedEmail }));
            }
        }
    }, [navigate]);

    return (
        <>
            <ToastContainer />
            <div id="page-loader" className="fade show">
                <span className="spinner"></span>
            </div>
            <div className="login-cover">
                <div className="login-cover-image" style={{ backgroundImage: "url(assets/img/login-bg/login-bg-13.jpg)" }} data-id="login-cover-image"></div>
                <div className="login-cover-bg"></div>
            </div>
            <div id="page-container" className="fade">
                <div className="login login-v2" data-pageload-addclassname="animated fadeIn">
                    <div className="login-header">
                        <div className="brand">
                            <img src='Logo1.png' style={{ width: '150px', height: '70px', borderRadius: "8px" }} alt="logo" />
                            <b>Admin</b>
                            <small>Login for Althub Admin panel</small>
                        </div>
                        <div className="icon">
                            <i className="fa fa-lock"></i>
                        </div>
                    </div>
                    <div className="login-content">
                        <form onSubmit={submitHandler} >
                            <div className="form-group m-b-20">
                                <input type="text" className="form-control form-control-lg" placeholder="Email Address" name="email" onChange={InputEvent} value={loginInfo.email} />
                                <div className="text-danger">{errors.email_err}</div>
                            </div>
                            <div className="form-group m-b-20">
                                <input type="password" className="form-control form-control-lg my-3" placeholder="Password" name="password" onChange={InputEvent} value={loginInfo.password} />

                                <div className="text-danger">{errors.password_err}</div>
                            </div>
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="form-group m-b-20">
                                <label className="text-white">
                                    <input type='checkbox' checked={check} onChange={handleRememberMe} /> Remember Me
                                </label>
                            </div>
                            <div className="login-buttons">
                                <button type="submit" className="btn btn-success btn-block btn-lg" disabled={disable}>
                                    {disable ? 'Processing...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;