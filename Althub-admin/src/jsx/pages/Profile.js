import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../services/axios';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

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

    // States for password visibility toggles
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [disable2, setDisable2] = useState(false);

    const getData = useCallback(() => {
        if (!admin_Id) return;
        const myurl = `/api/getAdminById/${admin_Id}`;

        axiosInstance.get(myurl).then((response) => {
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
                    toast.success('Password Updated. System logging out...');
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

        // Regex for strong password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!input["oldpassword"]) {
            isValid = false;
            errors["oldpassword_err"] = "Please Enter Old Password";
        }

        if (!input["newpassword"]) {
            isValid = false;
            errors["newpassword_err"] = "Please Enter New Password";
        } else if (!passwordRegex.test(input["newpassword"])) {
            // NEW: Validation Check
            isValid = false;
            errors["newpassword_err"] = "Password must be 8+ chars with 1 Uppercase, 1 Lowercase, & 1 Number";
        }

        if (!input["confirmpassword"]) {
            isValid = false;
            errors["confirmpassword_err"] = "Please Enter Confirm Password";
        }

        if (input["newpassword"] && input["confirmpassword"] && input["newpassword"] !== input["confirmpassword"]) {
            isValid = false;
            errors["confirmpassword_err"] = "Password Doesn't Match";
        }

        if (input["newpassword"] && input["oldpassword"] && input["newpassword"] === input["oldpassword"]) {
            isValid = false;
            errors["newpassword_err"] = "New Password should be different from old one";
        }

        setErrors(errors);
        return isValid;
    };

    useEffect(() => {
        if (document.getElementById('page-loader')) document.getElementById('page-loader').style.display = 'none';
        var element = document.getElementById("page-container");
        if (element) element.classList.add("show");
    }, []);

    return (
        <>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Profile</li>
                    </ol>
                    <h1 className="page-header text-dark font-weight-bold">Admin Profile</h1>

                    <div className="row">
                        {/* GENERAL INFO */}
                        <div className="col-xl-6">
                            <div className="panel panel-inverse border-0 shadow-sm rounded-lg">
                                <div className="panel-heading bg-white border-bottom py-3">
                                    <h4 className="panel-title text-dark">General Information</h4>
                                </div>
                                <div className="panel-body">
                                    <form onSubmit={submitHandler}>
                                        <div className="form-group mb-3">
                                            <label className="font-weight-600">Full Name</label>
                                            <input type="text" className="form-control" name="name" value={profileInfo.name} onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="font-weight-600">Phone Number</label>
                                            <input type="number" className="form-control" name="phone" value={profileInfo.phone} onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label className="font-weight-600">Email Address</label>
                                            <input type="email" className="form-control" name="email" value={profileInfo.email} onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} required />
                                        </div>
                                        <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={disable}>
                                            {disable ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD SECTION */}
                        <div className="col-xl-6">
                            <div className="panel panel-inverse border-0 shadow-sm rounded-lg">
                                <div className="panel-heading bg-white border-bottom py-3">
                                    <h4 className="panel-title text-dark">Change Password</h4>
                                </div>
                                <div className="panel-body">
                                    <form onSubmit={submitHandlerTwo}>
                                        {/* OLD PASSWORD */}
                                        <div className="form-group mb-3">
                                            <label className="font-weight-600">Old Password</label>
                                            <div className="input-group-custom">
                                                <input
                                                    type={showOld ? "text" : "password"}
                                                    className={`form-control ${errors.oldpassword_err ? 'is-invalid' : ''}`}
                                                    name="oldpassword"
                                                    onChange={handleChange}
                                                    value={changepass.oldpassword}
                                                />
                                                <button type="button" className="eye-btn" onClick={() => setShowOld(!showOld)}>
                                                    <i className={`fa ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.oldpassword_err && <small className="text-danger">{errors.oldpassword_err}</small>}
                                        </div>

                                        {/* NEW PASSWORD */}
                                        <div className="form-group mb-3">
                                            <label className="font-weight-600">New Password</label>
                                            <div className="input-group-custom">
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    className={`form-control ${errors.newpassword_err ? 'is-invalid' : ''}`}
                                                    name="newpassword"
                                                    onChange={handleChange}
                                                    value={changepass.newpassword}
                                                />
                                                <button type="button" className="eye-btn" onClick={() => setShowNew(!showNew)}>
                                                    <i className={`fa ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.newpassword_err && <small className="text-danger">{errors.newpassword_err}</small>}
                                        </div>

                                        {/* CONFIRM PASSWORD */}
                                        <div className="form-group mb-4">
                                            <label className="font-weight-600">Confirm New Password</label>
                                            <div className="input-group-custom">
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    className={`form-control ${errors.confirmpassword_err ? 'is-invalid' : ''}`}
                                                    name="confirmpassword"
                                                    onChange={handleChange}
                                                    value={changepass.confirmpassword}
                                                />
                                                <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                                                    <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.confirmpassword_err && <small className="text-danger">{errors.confirmpassword_err}</small>}
                                        </div>

                                        <button type="submit" className="btn btn-success px-4 shadow-sm" disabled={disable2}>
                                            {disable2 ? 'Processing...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .font-weight-600 { font-weight: 600; font-size: 13px; color: #4a5568; }
                .input-group-custom { position: relative; }
                .form-control { border-radius: 8px; padding: 10px 15px; background: #f8fafc; border: 1px solid #e2e8f0; }
                .form-control:focus { background: #fff; border-color: #3182ce; box-shadow: none; }
                
                .eye-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #a0aec0;
                    cursor: pointer;
                    z-index: 10;
                    outline: none !important;
                }
                .eye-btn:hover { color: #3182ce; }
            `}} />
        </>
    );
};

export default Profile;