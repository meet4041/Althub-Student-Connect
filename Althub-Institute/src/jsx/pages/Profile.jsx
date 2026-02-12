/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../service/axios';
import { ALTHUB_API_URL } from './baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// Import CSS
import '../../styles/profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [isDataLoading, setIsDataLoading] = useState(true);

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


    const getData = (id) => {
        if (!id) return;
        setIsDataLoading(true);
        axiosInstance.get(`/api/getInstituteById/${id}`).then((response) => {
            if (response.data.success === true) {
                const fetchedData = response.data.data;
                setProfileInfo({
                    // Priority given to 'institutename' and 'profilepic' keys per database schema
                    name: fetchedData.institutename || fetchedData.name || '',
                    email: fetchedData.email || '',
                    phone: fetchedData.phone || '',
                    image: fetchedData.profilepic || fetchedData.image || ''
                });
            }
            setIsDataLoading(false);
        }).catch(err => {
            console.error("Error fetching profile:", err);
            setIsDataLoading(false);
        });
    };

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        if (id) {
            setInstitute_Id(id);
            getData(id);
        }
    }, []);

    const handleImg = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            toast.error("Invalid file type.");
            return;
        }

        const body = new FormData();
        body.append('image', file);

        axiosInstance.post(`/api/uploadInstituteImage`, body, {
            headers: { 'Content-Type': "multipart/form-data" },
        }).then((response) => {
            if (response.data.success === true) {
                const newPath = response.data.data?.url || response.data.data;
                setProfileInfo({ ...profileInfo, image: newPath });
                toast.info("Logo uploaded successfully. Click Save to finalize.");
            }
        }).catch(() => toast.error("Image upload failed"));
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            axiosInstance.post(`/api/instituteUpdate`, {
                id: institute_Id,
                name: profileInfo.name,
                phone: profileInfo.phone,
                email: profileInfo.email,
                image: profileInfo.image
            }).then((res) => {
                setDisable(false);
                if (res.data.success) {
                    toast.success('Profile Updated Successfully');
                    localStorage.setItem("AlmaPlus_institute_Name", profileInfo.name);
                }
            }).catch(() => setDisable(false));
        }
    };

    const submitHandlerTwo = (e) => {
        e.preventDefault();
        if (validateTwo()) {
            setDisable2(true);
            axiosInstance.post(`/api/instituteUpdatePassword`, {
                institute_id: institute_Id,
                oldpassword: changepass.oldpassword,
                newpassword: changepass.newpassword
            }).then((response) => {
                if (response.data.success) {
                    toast.success('Password Updated. Redirecting...');
                    setTimeout(() => { localStorage.clear(); navigate('/'); }, 2000);
                } else {
                    setDisable2(false);
                    toast.error(response.data.msg || 'Update Failed');
                }
            }).catch(() => setDisable2(false));
        }
    };

    const validate = () => {
        let errs = {};
        if (!profileInfo.name) errs.name_err = "Name required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateTwo = () => {
        let errs = {};
        if (!changepass.oldpassword) errs.oldpassword_err = "Current password required";
        if (changepass.newpassword.length < 6) errs.newpassword_err = "Minimum 6 characters";
        if (changepass.newpassword !== changepass.confirmpassword) errs.confirmpassword_err = "Passwords don't match";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content profile-content-wrapper">
                    <div className="profile-main-container">
                        
                        <div className="mb-4">
                            <h1 className="page-header mb-1" style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B' }}>Settings</h1>
                            <p className="text-muted small">Update your institute's public information and security settings</p>
                        </div>

                        <div className="settings-layout-box">
                            <div className="settings-nav-sidebar">
                                <div className={`settings-nav-link ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                                    <i className="fa fa-user-tie"></i> Institute Profile
                                </div>
                                <div className={`settings-nav-link ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                                    <i className="fa fa-shield-alt"></i> Security & Login
                                </div>
                            </div>

                            <div className="settings-detail-content">
                                {isDataLoading ? (
                                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                                ) : activeTab === 'general' ? (
                                    <div className="fade-in">
                                        <h3 className="section-title-premium">General Information</h3>
                                        <p className="section-subtitle-premium">This info will be visible to students across the platform.</p>
                                        
                                        <div className="avatar-master-wrapper">
                                            {/* IMAGE COMPONENT WITH FALLBACKS */}
                                            <img 
                                                src={getImageUrl(profileInfo.image, FALLBACK_IMAGES.profile)} 
                                                className="avatar-large-circle" 
                                                alt="logo" 
                                                onError={getImageOnError(FALLBACK_IMAGES.profile)}
                                            />
                                            <div>
                                                <input type="file" id="pImgUpload" className="d-none" onChange={handleImg} />
                                                <label htmlFor="pImgUpload" className="btn btn-primary btn-sm shadow-sm" style={{borderRadius:'8px', fontWeight:'700'}}>Change Logo</label>
                                                <p className="text-muted small mt-2 mb-0">Recommended size: 400x400px (JPG/PNG)</p>
                                            </div>
                                        </div>

                                        <form onSubmit={submitHandler}>
                                            <div className="row">
                                                <div className="col-md-6 form-group mb-4">
                                                    <label className="form-label-saas">Full Institute Name</label>
                                                    <input type="text" className="form-control form-control-saas" value={profileInfo.name} onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })} />
                                                    {errors.name_err && <small className="text-danger">{errors.name_err}</small>}
                                                </div>
                                                <div className="col-md-6 form-group mb-4">
                                                    <label className="form-label-saas">Contact Phone</label>
                                                    <input type="text" className="form-control form-control-saas" value={profileInfo.phone} onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })} />
                                                </div>
                                                <div className="col-12 form-group mb-4">
                                                    <label className="form-label-saas">Primary Email Address</label>
                                                    <input type="email" className="form-control form-control-saas" value={profileInfo.email} onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-top">
                                                <button type="submit" className="btn btn-primary px-5 py-2 font-weight-bold" disabled={disable} style={{ borderRadius: '10px' }}>
                                                    {disable ? 'Saving Changes...' : 'Save Profile Details'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="fade-in">
                                        <h3 className="section-title-premium">Security Credentials</h3>
                                        <p className="section-subtitle-premium">Keep your account safe by updating your password regularly.</p>
                                        
                                        <form onSubmit={submitHandlerTwo} style={{ maxWidth: '500px' }}>
                                            <div className="form-group mb-4">
                                                <label className="form-label-saas">Current Password</label>
                                                <input type="password" placeholder="••••••••" className="form-control form-control-saas" value={changepass.oldpassword} onChange={(e) => setChangePass({...changepass, oldpassword: e.target.value})} />
                                                {errors.oldpassword_err && <small className="text-danger">{errors.oldpassword_err}</small>}
                                            </div>
                                            <div className="form-group mb-4">
                                                <label className="form-label-saas">New Secure Password</label>
                                                <input type="password" placeholder="New Password" className="form-control form-control-saas" value={changepass.newpassword} onChange={(e) => setChangePass({...changepass, newpassword: e.target.value})} />
                                                {errors.newpassword_err && <small className="text-danger">{errors.newpassword_err}</small>}
                                            </div>
                                            <div className="form-group mb-4">
                                                <label className="form-label-saas">Confirm New Password</label>
                                                <input type="password" placeholder="Verify Password" className="form-control form-control-saas" value={changepass.confirmpassword} onChange={(e) => setChangePass({...changepass, confirmpassword: e.target.value})} />
                                                {errors.confirmpassword_err && <small className="text-danger">{errors.confirmpassword_err}</small>}
                                            </div>
                                            <div className="mt-4 pt-3 border-top">
                                                <button type="submit" className="btn btn-primary px-5 py-2 font-weight-bold" disabled={disable2} style={{ borderRadius: '10px' }}>
                                                    {disable2 ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
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