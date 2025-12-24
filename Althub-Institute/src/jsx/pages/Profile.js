/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const Profile = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);

    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const [changepass, setChangePass] = useState({
        oldpassword: '',
        newpassword: '',
        confirmpassword: ''
    });
    const [profileInfo, setProfileInfo] = useState({
        name: '',
        email: '',
        phone: '',
        image: ''
    });
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [disable2, setDisable2] = useState(false);

    const getData = () => {
        if (!institute_Id) return;
        const myurl = `${ALTHUB_API_URL}/api/getInstituteById/${institute_Id}`;
        axios({
            method: "get",
            url: myurl,
        }).then((response) => {
            if (response.data.success === true) {
                setProfileInfo({
                    name: response.data.data.name,
                    email: response.data.data.email,
                    phone: response.data.data.phone,
                    image: response.data.data.image
                })
            }
        });
    };

    useEffect(() => {
        if (institute_Id) {
            getData();
        }
    }, [institute_Id])

    const handleImg = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation Logic
        if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            toast.error("Invalid file type. Only .jpg, .jpeg, .png, .gif allowed.");
            e.target.value = null; // Reset input
            return;
        }

        // Proceed if valid
        var body = new FormData();
        body.append('image', file);
        // ... rest of your axios call
        axios({
            method: "post",
            url: `${ALTHUB_API_URL}/api/uploadInstituteImage`,
            data: body,
            headers: { 'Content-Type': "multipart/form-data" },
        }).then((response) => {
            if (response.data.success === true) {
                setProfileInfo({
                    ...profileInfo,
                    image: response.data.data.url
                })
            }
        });
    };

    const handleProfileReset = () => {
        getData();
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/instituteUpdate`,
                data: {
                    id: institute_Id,
                    name: profileInfo.name,
                    phone: profileInfo.phone,
                    email: profileInfo.email,
                    image: profileInfo.image
                },
            }).then((response) => {
                if (response.data.success === true) {
                    toast.success('Profile Updated Successfully')
                    setTimeout(() => window.location.reload(), 1500);
                    setDisable(false);
                    setErrors({});
                } else {
                    setDisable(false);
                    toast.error('Something went wrong')
                }
            }).catch((error) => {
                setDisable(false);
                toast.error('Network error');
            })
        }
    }

    const handlePassReset = () => {
        setChangePass({
            ...changepass,
            oldpassword: '',
            newpassword: '',
            confirmpassword: ''
        })
    }

    const getPassData = () => {
        if (institute_Id) {
            setChangePass((prev) => ({
                ...prev,
                institute_id: institute_Id
            }))
        }
    }

    useEffect(() => {
        if (institute_Id) {
            getPassData();
        }
    }, [institute_Id])

    const handleChange = (e) => {
        setChangePass({ ...changepass, [e.target.name]: e.target.value });
    }

    const submitHandlerTwo = (e) => {
        e.preventDefault();
        if (validateTwo()) {
            setDisable2(true);
            const myurl = `${ALTHUB_API_URL}/api/instituteUpdatePassword`;
            axios({
                method: "post",
                url: myurl,
                data:
                {
                    institute_id: institute_Id,
                    oldpassword: changepass.oldpassword,
                    newpassword: changepass.newpassword
                },
            }).then((response) => {
                if (response.data.success === true) {
                    toast.success('Password Updated. Logging out...');
                    setTimeout(() => {
                        localStorage.removeItem("AlmaPlus_institute_Id");
                        localStorage.clear();
                        navigate('/');
                        setDisable2(false);
                    }, 2000);

                } else {
                    setDisable2(false);
                    toast.error(response.data.msg || 'Update Failed');
                    if (response.data.msg) {
                        setErrors({ ...errors, confirmpassword: response.data.msg });
                    }
                }
            }).catch((error) => {
                setDisable2(false);
                toast.error('Server error during password update');
            })
        }
    }

    const validate = () => {
        let input = profileInfo;
        let errors = {};
        let isValid = true;
        if (!input["name"]) {
            isValid = false;
            errors["name_err"] = "Please Enter Name";
        }
        if (!input["email"]) {
            isValid = false;
            errors["email_err"] = "Please Enter Email";
        }
        setErrors(errors);
        return isValid;
    };

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
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");

            const id = localStorage.getItem("AlmaPlus_institute_Id");
            setInstitute_Id(id);
        }
    }, []);

    return (
        <>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{ backgroundColor: '#F8FAFC' }}>
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor }}>Dashboard</Link></li>
                        <li className="breadcrumb-item active">Profile</li>
                    </ol>
                    <h1 className="page-header">Settings</h1>

                    <div className="row">
                        {/* Profile Settings Card */}
                        <div className="col-xl-6 mb-4">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-bottom p-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                    <h4 className="card-title mb-0 text-dark">Profile Information</h4>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={(e) => submitHandler(e)} >
                                        <fieldset>
                                            <div className="text-center mb-4">
                                                <div className="d-inline-block position-relative">
                                                    {profileInfo.image ?
                                                        <img src={`${ALTHUB_API_URL}${profileInfo.image}`}
                                                            className="rounded-circle shadow-sm"
                                                            style={{ width: "120px", height: "120px", objectFit: 'cover', border: `3px solid ${themeColor}` }}
                                                            alt='profile_img' />
                                                        :
                                                        <img src="assets/img/profile1.png"
                                                            className="rounded-circle shadow-sm"
                                                            style={{ width: "120px", height: "120px", objectFit: 'cover', border: `3px solid ${themeColor}` }}
                                                            alt='default' />
                                                    }
                                                    <div className="mt-2">
                                                        <label htmlFor="exampleInputImage" className="btn btn-sm btn-light shadow-sm" style={{ cursor: 'pointer' }}>
                                                            <i className="fa fa-camera mr-1"></i> Change Photo
                                                        </label>
                                                        <input type="file" className="d-none" id="exampleInputImage" onChange={handleImg} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputName">Institute Name</label>
                                                <input type="text" className="form-control" id="exampleInputName" placeholder="Enter name" name="name" value={profileInfo.name} onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.name_err}</div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold" htmlFor="exampleInputEmail">Email Address</label>
                                                <input type="text" className="form-control" id="exampleInputEmail" placeholder="Enter email" name="email" value={profileInfo.email} onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.email_err}</div>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <button type="reset" className="btn btn-light" onClick={handleProfileReset}>Reset</button>
                                                <button type="submit" className="btn btn-primary px-4" disabled={disable}
                                                    style={{ backgroundColor: themeColor, borderColor: themeColor }}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2"></span> Saving...</> : 'Update Profile'}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="col-xl-6 mb-4">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-bottom p-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                    <h4 className="card-title mb-0 text-dark">Security Settings</h4>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={(e) => submitHandlerTwo(e)} >
                                        <fieldset>
                                            <div className="alert alert-light mb-4 border-0 shadow-sm">
                                                <small className="text-muted"><i className="fa fa-info-circle mr-1"></i> Changing your password will sign you out of all devices.</small>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputOldPass">Current Password</label>
                                                <input type="password" className="form-control" id="exampleInputOldPass" placeholder="Enter current password" name="oldpassword" onChange={handleChange} value={changepass.oldpassword} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.oldpassword_err}</div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputNewPass">New Password</label>
                                                <input type="password" className="form-control" id="exampleInputNewPass" placeholder="Enter new password" name="newpassword" onChange={handleChange} value={changepass.newpassword} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.newpassword_err}</div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold" htmlFor="exampleInputConfirmPass">Confirm New Password</label>
                                                <input type="password" className="form-control" id="exampleInputConfirmPass" placeholder="Confirm new password" name="confirmpassword" onChange={handleChange} value={changepass.confirmpassword} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.confirmpassword_err}</div>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <button type="reset" className="btn btn-light" onClick={handlePassReset}>Clear</button>
                                                <button type="submit" className="btn btn-primary px-4" disabled={disable2}
                                                    style={{ backgroundColor: themeColor, borderColor: themeColor }}>
                                                    {disable2 ? <><span className="spinner-border spinner-border-sm mr-2"></span> Processing...</> : 'Change Password'}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Profile;