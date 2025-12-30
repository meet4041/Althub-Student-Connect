/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const EditPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Theme Constant
    const themeColor = '#2563EB';

    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        id: "",
        description: "",
    });
    
    // State to hold existing photos from the database
    const [existingPhotos, setExistingPhotos] = useState([]);
    
    // State to hold NEW files selected by the user
    const [newFiles, setNewFiles] = useState([]);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        // 1. Check if post data was passed from the Posts page
        if (location.state && location.state.post) {
            const post = location.state.post;
            setData({
                id: post._id,
                description: post.description || "",
            });
            
            // Set existing photos for preview
            if (post.photos && post.photos.length > 0) {
                setExistingPhotos(post.photos);
            }
        } else {
            // Fallback: If someone goes to this page directly without clicking Edit
            toast.error("No post data found. Redirecting...");
            setTimeout(() => navigate('/posts'), 2000);
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    // Handle selection of NEW images
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
        
        // 1. Append Text Data
        formData.append("id", data.id);
        formData.append("description", data.description);
        
        // 2. Append New Photos (using 'photos' key to match backend)
        if (newFiles.length > 0) {
            newFiles.forEach((file) => {
                formData.append('photos', file);
            });
        }

        // 3. Get Token
        const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user')).token);

        try {
            await axios.post(`${ALTHUB_API_URL}/api/editPost`, formData, {
                headers: {
                    "content-type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });
            
            toast.success("Post Updated Successfully");
            setDisable(false);
            
            // Redirect back to posts page after short delay
            setTimeout(() => {
                navigate('/posts');
            }, 1200);

        } catch (error) {
            setDisable(false);
            console.error("Edit Error:", error);
            const errMsg = error.response?.data?.msg || "Failed to update post";
            toast.error(errMsg);
        }
    };

    return (
        <Fragment>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    
                    {/* Breadcrumb */}
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                        <li className="breadcrumb-item"><Link to="/posts" style={{color: themeColor}}>Posts</Link></li>
                        <li className="breadcrumb-item active">Edit Post</li>
                    </ol>
                    
                    <h1 className="page-header">Edit Post</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                                    <h4 className="card-title mb-0 text-dark">Update Post Details</h4>
                                    <Link to="/posts" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-times mr-1"></i> Cancel
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <fieldset>
                                            {/* Description Field */}
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold">Description <span className="text-danger">*</span></label>
                                                <textarea 
                                                    className="form-control" 
                                                    rows="6" 
                                                    name="description" 
                                                    value={data.description} 
                                                    onChange={handleChange} 
                                                    required
                                                />
                                            </div>

                                            {/* Photos Section */}
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold">Photos</label>
                                                
                                                {/* 1. Show Existing Photos */}
                                                {existingPhotos.length > 0 && (
                                                    <div className="mb-3 p-3 bg-light rounded border">
                                                        <small className="text-muted d-block mb-2">Current Photos (Saved on Server):</small>
                                                        <div className="d-flex flex-wrap">
                                                            {existingPhotos.map((photoUrl, index) => (
                                                                <div key={index} className="mr-2 mb-2 position-relative">
                                                                    <img 
                                                                        src={`${ALTHUB_API_URL}${photoUrl}`} 
                                                                        alt={`existing-${index}`} 
                                                                        style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd'}} 
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 2. Upload New Photos */}
                                                <label className="d-block text-muted small mt-2">Add New Photos (these will append to existing ones):</label>
                                                <div className="custom-file">
                                                    <input 
                                                        type="file" 
                                                        className="custom-file-input" 
                                                        id="customFile" 
                                                        multiple 
                                                        accept="image/*"
                                                        onChange={imgChange}
                                                    />
                                                    <label className="custom-file-label" htmlFor="customFile">
                                                        {newFiles.length > 0 ? `${newFiles.length} files selected` : "Choose files..."}
                                                    </label>
                                                </div>

                                                {/* 3. Preview New Photos */}
                                                {newFiles.length > 0 && (
                                                    <div className="mt-3">
                                                        <small className="text-muted">New Upload Preview:</small>
                                                        <div className="d-flex flex-wrap mt-2">
                                                            {newFiles.map((file, i) => (
                                                                <img 
                                                                    key={i} 
                                                                    src={URL.createObjectURL(file)} 
                                                                    alt="preview" 
                                                                    className="mr-2 mb-2"
                                                                    style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="d-flex justify-content-end mt-4">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary px-4 btn-lg shadow-sm" 
                                                    disabled={disable}
                                                    style={{backgroundColor: themeColor, borderColor: themeColor, minWidth: '140px'}}
                                                >
                                                    {disable ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-save mr-2"></i> Update Post
                                                        </>
                                                    )}
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
        </Fragment>
    );
};

export default EditPost;