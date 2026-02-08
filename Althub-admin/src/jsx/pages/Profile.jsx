/* admin/src/jsx/pages/Profile.jsx */

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../services/axios';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// IMPORT NEW STYLES
import '../styles/profile.css';

const Profile = () => {
    const admin_Id = localStorage.getItem("AlmaPlus_admin_Id");
    const navigate = useNavigate();

    const [changepass, setChangePass] = useState({
        admin_id: admin_Id || '',
        oldpassword: '',
        newpassword: '',
        confirmpassword: ''
    });

    const [profileInfo, setProfileInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [disable2, setDisable2] = useState(false);

    const getData = useCallback(() => {
        if (!admin_Id) return;
        axiosInstance.get(`/api/getAdminById/${admin_Id}`).then((response) => {
            if (response.data.success === true && response.data.data?.[0]) {
                const data = response.data.data[0];
                setProfileInfo({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || ""
                });
                localStorage.setItem('AlmaPlus_admin_Name', data.name);
            }
        }).catch(err => console.error("Profile Fetch Error:", err));
    }, [admin_Id]);

    useEffect(() => {
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getData();
    }, [getData]);

    const submitHandler = (e) => {
        e.preventDefault();
        setDisable(true);
        axiosInstance.post('/api/adminUpdate', {
            id: admin_Id,
            name: profileInfo.name,
            phone: profileInfo.phone,
            email: profileInfo.email
        }).then((response) => {
            if (response.data.success === true) {
                toast.success('Profile Updated Successfully');
                localStorage.setItem('AlmaPlus_admin_Name', profileInfo.name);
                setDisable(false);
                setErrors({});
            } else {
                setDisable(false);
                toast.error('Update failed');
            }
        }).catch(() => {
            setDisable(false);
            toast.error("Error updating profile");
        })
    }

    const handleChange = (e) => {
        setChangePass({ ...changepass, [e.target.name]: e.target.value });
    }

    const submitHandlerTwo = (e) => {
        e.preventDefault();
        if (validateTwo()) {
            setDisable2(true);
            axiosInstance.post('/api/updatepassword', {
                admin_id: admin_Id,
                oldpassword: changepass.oldpassword,
                newpassword: changepass.newpassword
            }).then((response) => {
                if (response.data.success === true) {
                    toast.success('Password Updated. Logging out...');
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/');
                    }, 2000);
                } else {
                    setDisable2(false);
                    toast.error(response.data.msg || 'Update Failed');
                }
            }).catch(() => {
                setDisable2(false);
                toast.error("Network Error");
            })
        }
    }

    const validateTwo = () => {
        let input = changepass;
        let errors = {};
        let isValid = true;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!input["oldpassword"]) {
            isValid = false;
            errors["oldpassword_err"] = "Old Password is required";
        }
        if (!input["newpassword"]) {
            isValid = false;
            errors["newpassword_err"] = "New Password is required";
        } else if (!passwordRegex.test(input["newpassword"])) {
            isValid = false;
            errors["newpassword_err"] = "8+ chars with Uppercase, Lowercase & Number";
        }
        if (!input["confirmpassword"]) {
            isValid = false;
            errors["confirmpassword_err"] = "Confirm Password is required";
        }
        if (input["newpassword"] && input["confirmpassword"] && input["newpassword"] !== input["confirmpassword"]) {
            isValid = false;
            errors["confirmpassword_err"] = "Passwords do not match";
        }
        if (input["newpassword"] && input["oldpassword"] && input["newpassword"] === input["oldpassword"]) {
            isValid = false;
            errors["newpassword_err"] = "New password must be different";
        }
        setErrors(errors);
        return isValid;
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content profile-wrapper">
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <div>
                            <h1 className="page-header mb-0">Admin Profile</h1>
                            <small className="text-muted">Manage your personal information and security settings</small>
                        </div>
                        <ol className="breadcrumb p-0 m-0">
                            <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                            <li className="breadcrumb-item active">Profile</li>
                        </ol>
                    </div>

                    <div className="row">
                        {/* GENERAL INFO PANEL */}
                        <div className="col-xl-6">
                            <div className="profile-panel">
                                <div className="profile-panel-header">
                                    <h4 className="profile-panel-title">General Information</h4>
                                </div>
                                <div className="profile-panel-body">
                                    <form onSubmit={submitHandler}>
                                        <div className="profile-form-group">
                                            <label className="profile-label">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="profile-input" 
                                                value={profileInfo.name} 
                                                onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="profile-form-group">
                                            <label className="profile-label">Phone Number</label>
                                            <input 
                                                type="text" 
                                                className="profile-input" 
                                                value={profileInfo.phone} 
                                                onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })} 
                                            />
                                        </div>
                                        <div className="profile-form-group mb-4">
                                            <label className="profile-label">Email Address</label>
                                            <input 
                                                type="email" 
                                                className="profile-input" 
                                                value={profileInfo.email} 
                                                onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <button type="submit" className="btn-save-profile" disabled={disable}>
                                            {disable ? 'SAVING...' : 'UPDATE PROFILE'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD CHANGE PANEL */}
                        <div className="col-xl-6">
                            <div className="profile-panel">
                                <div className="profile-panel-header">
                                    <h4 className="profile-panel-title">Security Settings</h4>
                                </div>
                                <div className="profile-panel-body">
                                    <form onSubmit={submitHandlerTwo}>
                                        <div className="profile-form-group">
                                            <label className="profile-label">Old Password</label>
                                            <div className="password-input-container">
                                                <input
                                                    type={showOld ? "text" : "password"}
                                                    className="profile-input"
                                                    name="oldpassword"
                                                    onChange={handleChange}
                                                    value={changepass.oldpassword}
                                                />
                                                <button type="button" className="eye-toggle-btn" onClick={() => setShowOld(!showOld)}>
                                                    <i className={`fa ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.oldpassword_err && <span className="error-text">{errors.oldpassword_err}</span>}
                                        </div>

                                        <div className="profile-form-group">
                                            <label className="profile-label">New Password</label>
                                            <div className="password-input-container">
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    className="profile-input"
                                                    name="newpassword"
                                                    onChange={handleChange}
                                                    value={changepass.newpassword}
                                                />
                                                <button type="button" className="eye-toggle-btn" onClick={() => setShowNew(!showNew)}>
                                                    <i className={`fa ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.newpassword_err && <span className="error-text">{errors.newpassword_err}</span>}
                                        </div>

                                        <div className="profile-form-group mb-4">
                                            <label className="profile-label">Confirm Password</label>
                                            <div className="password-input-container">
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    className="profile-input"
                                                    name="confirmpassword"
                                                    onChange={handleChange}
                                                    value={changepass.confirmpassword}
                                                />
                                                <button type="button" className="eye-toggle-btn" onClick={() => setShowConfirm(!showConfirm)}>
                                                    <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.confirmpassword_err && <span className="error-text">{errors.confirmpassword_err}</span>}
                                        </div>

                                        <button type="submit" className="btn-update-password" disabled={disable2}>
                                            {disable2 ? 'PROCESSING...' : 'UPDATE PASSWORD'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default Profile;