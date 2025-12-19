import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../services/axios'; 
import { ALTHUB_API_URL } from '../../baseURL';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const Profile = () => {
    const admin_Id = localStorage.getItem("AlmaPlus_admin_Id");
    
    const [changepass, setChangePass] = useState({
        admin_id: admin_Id || '',
        oldpassword: '',
        newpassword: '',
        confirmpassword: ''
    });

    const [profileInfo, setProfileInfo] = useState({
        name: "",
        email: "",
        phone: "",
        profilepic: ""
    });

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
                    phone: data.phone || "",
                    profilepic: data.profilepic || ""
                });
                localStorage.setItem('AlmaPlus_admin_Name', data.name);
            }
        }).catch(err => {
            console.error("Profile Fetch Error:", err);
        });
    }, [admin_Id]);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleImg = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        var body = new FormData();
        body.append('profilepic', file);
        
        axiosInstance.post('/api/uploadAdminImage', body, {
            headers: { 'Content-Type': "multipart/form-data" },
        }).then((response) => {
            if (response.data.success === true) {
                const newUrl = response.data.data.url;
                setProfileInfo(prev => ({
                    ...prev,
                    profilepic: newUrl
                }));
                toast.info("Image selected. Click 'Update Profile' to save.");
            }
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        
        // NO VALIDATION NEEDED FOR PARTIAL UPDATES
        setDisable(true);
        axiosInstance.post('/api/adminUpdate', {
            id: admin_Id,
            name: profileInfo.name,
            phone: profileInfo.phone,
            email: profileInfo.email,
            profilepic: profileInfo.profilepic
        }).then((response) => {
            if (response.data.success === true) {
                toast.success('Profile Updated Successfully');
                localStorage.setItem('AlmaPlus_admin_Name', profileInfo.name);
                setDisable(false);
                setErrors({});
            } else {
                setDisable(false);
                toast.error('Something went wrong');
            }
        }).catch((error) => {
            setDisable(false);
            toast.error("Error updating profile");
        })
    }

    const handleChange = (e) => {
        setChangePass({ ...changepass, [e.target.name]: e.target.value });
    }

    const submitHandlerTwo = (e) => {
        e.preventDefault();
        // Validation for password stays compulsory for security
        if (validateTwo()) {
            setDisable2(true);
            axiosInstance.post('/api/updatepassword', {
                admin_id: admin_Id,
                oldpassword: changepass.oldpassword,
                newpassword: changepass.newpassword
            }).then((response) => {
                if (response.data.success === true) {
                    toast.success('Password Updated Successfully');
                    setDisable2(false);
                    setChangePass({
                        oldpassword: '',
                        newpassword: '',
                        confirmpassword: ''
                    });
                    setErrors({});
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
        let errors = {};
        let isValid = true;
        if (!changepass.oldpassword) { isValid = false; errors["oldpassword_err"] = "Please Enter Old Password"; }
        if (!changepass.newpassword) { isValid = false; errors["newpassword_err"] = "Please Enter New Password"; }
        if (changepass.newpassword !== changepass.confirmpassword) { isValid = false; errors["confirmpassword_err"] = "Password Doesn't Match"; }
        setErrors(errors);
        return isValid;
    };

    useEffect(() => {
        if(document.getElementById('page-loader')) document.getElementById('page-loader').style.display = 'none';
        var element = document.getElementById("page-container");
        if(element) element.classList.add("show");
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
                    <h1 className="page-header">Profile</h1>
                    <div className="row">
                        <div className="col-xl-6">
                            <div className="panel panel-inverse">
                                <div className="panel-heading">
                                    <h4 className="panel-title">Profile Setting</h4>
                                </div>
                                <div className="panel-body">
                                    <form onSubmit={submitHandler}>
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <input type="text" className="form-control" name="name" value={profileInfo.name} onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number:</label>
                                            <input type="number" className="form-control" name="phone" value={profileInfo.phone} onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email:</label>
                                            <input type="text" className="form-control" name="email" value={profileInfo.email} onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Profile Pic:</label>
                                            <input type="file" className="form-control" onChange={handleImg} />
                                            {profileInfo.profilepic && (
                                                <img src={`${ALTHUB_API_URL}${profileInfo.profilepic}`} className="m-t-10" style={{ width: "84px", height: "84px", borderRadius: "50%", objectFit: 'cover' }} alt='profile' />
                                            )}
                                        </div>
                                        <button type="submit" className="btn btn-success" disabled={disable}>
                                            {disable ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6">
                            <div className="panel panel-inverse">
                                <div className="panel-heading">
                                    <h4 className="panel-title">Change Password</h4>
                                </div>
                                <div className="panel-body">
                                    <form onSubmit={submitHandlerTwo}>
                                        <div className="form-group">
                                            <label>Old Password:</label>
                                            <input type="password" className="form-control" name="oldpassword" onChange={handleChange} value={changepass.oldpassword} />
                                            <div className="text-danger">{errors.oldpassword_err}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>New Password:</label>
                                            <input type="password" className="form-control" name="newpassword" onChange={handleChange} value={changepass.newpassword} />
                                            <div className="text-danger">{errors.newpassword_err}</div>
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Password:</label>
                                            <input type="password" className="form-control" name="confirmpassword" onChange={handleChange} value={changepass.confirmpassword} />
                                            <div className="text-danger">{errors.confirmpassword_err}</div>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={disable2}>{disable2 ? 'Updating...' : 'Change Password'}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Profile;