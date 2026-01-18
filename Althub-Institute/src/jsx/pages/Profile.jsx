/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// Import CSS
import '../../styles/profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);

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
        if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            toast.error("Invalid file type. Only .jpg, .jpeg, .png, .gif allowed.");
            return;
        }
        var body = new FormData();
        body.append('image', file);
        axios({
            method: "post",
            url: `${ALTHUB_API_URL}/api/uploadInstituteImage`,
            data: body,
            headers: { 'Content-Type': "multipart/form-data" },
        }).then((response) => {
            if (response.data.success === true) {
                setProfileInfo({ ...profileInfo, image: response.data.data.url })
            }
        });
    };

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
                setDisable(false);
                if (response.data.success === true) {
                    toast.success('Profile Updated Successfully')
                    setTimeout(() => window.location.reload(), 1500);
                }
            }).catch(() => setDisable(false))
        }
    }

    const submitHandlerTwo = (e) => {
        e.preventDefault();
        if (validateTwo()) {
            setDisable2(true);
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/instituteUpdatePassword`,
                data: {
                    institute_id: institute_Id,
                    oldpassword: changepass.oldpassword,
                    newpassword: changepass.newpassword
                },
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
            }).catch(() => setDisable2(false))
        }
    }

    const validate = () => {
        let errors = {};
        let isValid = true;
        if (!profileInfo.name) { isValid = false; errors["name_err"] = "Name required"; }
        if (!profileInfo.email) { isValid = false; errors["email_err"] = "Email required"; }
        setErrors(errors);
        return isValid;
    };

    const validateTwo = () => {
        let input = changepass;
        let errors = {};
        let isValid = true;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!input.oldpassword) { isValid = false; errors["oldpassword_err"] = "Enter current password"; }
        if (!input.newpassword) { isValid = false; errors["newpassword_err"] = "Enter new password"; }
        else if (!passwordRegex.test(input.newpassword)) { isValid = false; errors["newpassword_err"] = "Need 8+ chars, Uppercase & Number"; }
        if (input.newpassword !== input.confirmpassword) { isValid = false; errors["confirmpassword_err"] = "Passwords do not match"; }
        setErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        setInstitute_Id(localStorage.getItem("AlmaPlus_institute_Id"));
    }, []);

    return (
        <>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content profile-content-wrapper">
                    <div className="profile-container">
                        
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h1 className="page-header mb-0" style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B' }}>Account Settings</h1>
                                <p className="text-muted small mb-0">Manage your institutional profile and security credentials</p>
                            </div>
                        </div>

                        <div className="profile-scroll-area">
                            <div className="row h-100">
                                {/* Profile Card */}
                                <div className="col-xl-6 mb-4">
                                    <div className="card settings-card">
                                        <div className="p-4 border-bottom">
                                            <h5 className="mb-0 font-weight-bold">Institute Profile</h5>
                                        </div>
                                        <div className="card-body p-4">
                                            <form onSubmit={submitHandler}>
                                                <div className="text-center mb-5">
                                                    <div className="position-relative d-inline-block">
                                                        <img src={profileInfo.image ? `${ALTHUB_API_URL}${profileInfo.image}` : "assets/img/profile1.png"}
                                                            className="avatar-img" alt='profile' />
                                                        <label htmlFor="pImgUpload" className="btn btn-xs btn-primary position-absolute" style={{ bottom: 0, right: 0, borderRadius: '50%', width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                                                            <i className="fa fa-camera"></i>
                                                        </label>
                                                        <input type="file" className="d-none" id="pImgUpload" onChange={handleImg} />
                                                    </div>
                                                </div>

                                                <div className="form-group mb-4">
                                                    <label className="form-label-saas">Institute Name</label>
                                                    <input type="text" className="form-control form-control-saas" value={profileInfo.name} 
                                                        onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} />
                                                    <div className="text-danger small">{errors.name_err}</div>
                                                </div>

                                                <div className="form-group mb-4">
                                                    <label className="form-label-saas">Email Address</label>
                                                    <input type="text" className="form-control form-control-saas" value={profileInfo.email} 
                                                        onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} />
                                                    <div className="text-danger small">{errors.email_err}</div>
                                                </div>

                                                <button type="submit" className="btn btn-primary btn-block py-2 font-weight-bold" disabled={disable} style={{ borderRadius: '10px' }}>
                                                    {disable ? 'Processing...' : 'Update Profile Details'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Card */}
                                <div className="col-xl-6 mb-4">
                                    <div className="card settings-card">
                                        <div className="p-4 border-bottom">
                                            <h5 className="mb-0 font-weight-bold">Security Settings</h5>
                                        </div>
                                        <div className="card-body p-4">
                                            <form onSubmit={submitHandlerTwo}>
                                                <div className="form-group mb-4">
                                                    <label className="form-label-saas">Current Password</label>
                                                    <input type="password" name="oldpassword" className="form-control form-control-saas" 
                                                        onChange={(e) => setChangePass({...changepass, oldpassword: e.target.value})} value={changepass.oldpassword} />
                                                    <div className="text-danger small">{errors.oldpassword_err}</div>
                                                </div>

                                                <div className="form-group mb-4">
                                                    <label className="form-label-saas">New Password</label>
                                                    <input type="password" name="newpassword" className="form-control form-control-saas" 
                                                        onChange={(e) => setChangePass({...changepass, newpassword: e.target.value})} value={changepass.newpassword} />
                                                    <div className="text-danger small">{errors.newpassword_err}</div>
                                                </div>

                                                <div className="form-group mb-4">
                                                    <label className="form-label-saas">Confirm Password</label>
                                                    <input type="password" name="confirmpassword" className="form-control form-control-saas" 
                                                        onChange={(e) => setChangePass({...changepass, confirmpassword: e.target.value})} value={changepass.confirmpassword} />
                                                    <div className="text-danger small">{errors.confirmpassword_err}</div>
                                                </div>

                                                <button type="submit" className="btn btn-outline-primary btn-block py-2 font-weight-bold" disabled={disable2} style={{ borderRadius: '10px', borderWidth: '2px' }}>
                                                    {disable2 ? 'Updating...' : 'Change Secure Password'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
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