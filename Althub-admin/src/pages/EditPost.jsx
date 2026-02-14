/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import axiosInstance from '../service/axios';

import Loader from '../layouts/Loader.jsx'
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

// Import the specific Posts CSS for split-screen layout
import '../styles/add-post.css';

const EditPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const themeColor = '#2563EB';

    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        id: "",
        description: "",
    });
    
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newFiles, setNewFiles] = useState([]);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");

        if (location.state && location.state.post) {
            const post = location.state.post;
            setData({
                id: post._id,
                description: post.description || "",
            });
            if (post.photos && post.photos.length > 0) {
                setExistingPhotos(post.photos);
            }
        } else {
            toast.error("No post data found. Redirecting...");
            setTimeout(() => navigate('/posts'), 2000);
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const imgChange = (e) => {
        setNewFiles([...e.target.files]);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!data.description) {
            toast.error("Description is required");
            return;
        }

        setDisable(true);
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("description", data.description);
        
        if (newFiles.length > 0) {
            newFiles.forEach((file) => {
                formData.append('photos', file);
            });
        }

        try {
            await axiosInstance.post('/api/editPost', formData);
            
            toast.success("Post Updated Successfully");
            setTimeout(() => navigate('/posts'), 1200);

        } catch (error) {
            setDisable(false);
            const errMsg = error.response?.data?.msg || "Failed to update post";
            toast.error(errMsg);
        }
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content add-post-wrapper">
                    <div className="add-post-container">
                        
                        {/* Header Section */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header edit-event-title mb-0">Edit Post Details</h1>
                                <p className="text-muted small mb-0">Modify content or add new media to your community post</p>
                            </div>
                            <Link to="/posts" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back to Feed
                            </Link>
                        </div>

                        <div className="post-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="post-body-scroll">
                                    <div className="row h-100">
                                        
                                        {/* LEFT COLUMN: Content Editor */}
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group h-100 d-flex flex-column">
                                                <label className="form-label-saas">Post Description</label>
                                                <textarea 
                                                    className="form-control form-control-saas flex-grow-1" 
                                                    rows="10" 
                                                    name="description" 
                                                    value={data.description} 
                                                    onChange={handleChange} 
                                                    style={{ resize: 'none', minHeight: '300px' }}
                                                    required
                                                />
                                                <div className="mt-3 p-3 bg-light rounded edit-event-note">
                                                    <small className="text-muted"><i className="fa fa-info-circle mr-2"></i> Note: Editing this post will update it for all users in the feed instantly.</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: Media Gallery & Upload */}
                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-saas">Manage Media</label>
                                            
                                            {/* Existing Photos Display */}
                                            {existingPhotos.length > 0 && (
                                                <div className="mb-4 p-3 bg-light rounded border">
                                                    <small className="text-muted font-weight-bold d-block mb-2">Current Post Photos:</small>
                                                    <div className="post-preview-grid">
                                                        {existingPhotos.map((photoUrl, index) => (
                                                            <img 
                                                                key={index} 
                                                                src={getImageUrl(photoUrl, FALLBACK_IMAGES.post)} 
                                                                className="post-preview-img"
                                                                alt="existing"
                                                                onError={getImageOnError(FALLBACK_IMAGES.post)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload New Photos Zone */}
                                            <div className="post-upload-zone">
                                                <input 
                                                    type='file' multiple className="d-none" id="editPostFile" 
                                                    accept="image/*" onChange={imgChange} 
                                                />
                                                <label htmlFor="editPostFile" className="cursor-pointer mb-0">
                                                    <i className="fa fa-cloud-upload-alt fa-2x text-primary mb-2 opacity-50"></i>
                                                    <p className="mb-0 font-weight-bold text-dark">Add more photos</p>
                                                    <small className="text-muted">Files will append to the current list</small>
                                                </label>

                                                {/* New Selection Preview */}
                                                {newFiles.length > 0 && (
                                                    <div className="post-preview-grid">
                                                        {newFiles.map((file, i) => (
                                                            <img 
                                                                key={i} 
                                                                src={URL.createObjectURL(file)} 
                                                                className="post-preview-img" 
                                                                alt="preview" 
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* STICKY FOOTER ACTIONS */}
                                <div className="post-footer-actions">
                                    <Link to="/posts" className="btn btn-link text-muted mr-3 font-weight-bold">Discard Changes</Link>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-5 shadow-sm edit-event-save-btn" 
                                        disabled={disable} 
                                    >
                                        {disable ? 'Updating Feed...' : 'Save & Update Post'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default EditPost;
