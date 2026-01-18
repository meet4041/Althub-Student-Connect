/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// Import the specific Posts CSS
import '../../styles/add-post.css';

const AddPost = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const navigate = useNavigate();
    const themeColor = '#2563EB';

    const [data, setData] = useState({ description: "" });
    const [fileList, setFileList] = useState(null);
    const [disable, setDisable] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        setInstitute_Id(localStorage.getItem("AlmaPlus_institute_Id"));
    }, []);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
    
    const imgChange = (e) => {
        const selected = Array.from(e.target.files);
        setFileList(selected.filter(f => f.name.match(/\.(jpg|jpeg|png|gif)$/i)));
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (!data.description) {
            setErrors({ desc: "Content description is required" });
            return;
        }

        setDisable(true);
        const body = new FormData();
        body.append("organizerid", institute_Id);
        body.append("description", data.description);
        if (fileList) {
            Array.from(fileList).forEach(file => body.append('photos', file));
        }

        axios.post(`${ALTHUB_API_URL}/api/addPost`, body)
            .then(() => {
                toast.success("Post published to community feed");
                setTimeout(() => navigate('/posts'), 1500);
            }).catch(() => {
                setDisable(false);
                toast.error("Failed to sync post");
            });
    };

    const files = fileList ? [...fileList] : [];

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content add-post-wrapper">
                    <div className="add-post-container">
                        
                        {/* Split Header */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header mb-0" style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Create Community Post</h1>
                                <p className="text-muted small mb-0">Share updates, news, or media with your institute members</p>
                            </div>
                            <Link to="/posts" className="btn btn-light btn-sm font-weight-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                <i className="fa fa-arrow-left mr-1"></i> Back to Feed
                            </Link>
                        </div>

                        <div className="post-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="post-body-scroll">
                                    <div className="row h-100">
                                        
                                        {/* LEFT: Content Editor */}
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group h-100 d-flex flex-column">
                                                <label className="form-label-saas">Post Content & Description</label>
                                                <textarea 
                                                    className="form-control form-control-saas flex-grow-1" 
                                                    placeholder="What's on your mind? Write a detailed update for your students and alumni..." 
                                                    name="description" 
                                                    value={data.description} 
                                                    onChange={handleChange}
                                                    style={{ resize: 'none', minHeight: '300px' }}
                                                />
                                                {errors.desc && <small className="text-danger font-weight-bold mt-2">{errors.desc}</small>}
                                                <div className="mt-3 p-3 bg-light rounded">
                                                    <small className="text-muted"><i className="fa fa-info-circle mr-2"></i> Be professional. Your posts are visible to the entire institutional network.</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Media Attachment */}
                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-saas">Media Attachments</label>
                                            <div className="post-upload-zone">
                                                <input type='file' multiple className="d-none" id="postImgUp" onChange={imgChange} />
                                                <label htmlFor="postImgUp" className="cursor-pointer">
                                                    <div className="mb-3"><i className="fa fa-images fa-3x text-primary opacity-25"></i></div>
                                                    <h6 className="font-weight-bold text-dark">Add photos to your post</h6>
                                                    <p className="text-muted small">Select multiple JPG or PNG files</p>
                                                </label>

                                                {files.length > 0 && (
                                                    <div className="post-preview-grid">
                                                        {files.map((file, idx) => (
                                                            <img key={idx} src={window.URL.createObjectURL(file)} className="post-preview-img" alt="p" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Persistent Footer */}
                                <div className="post-footer-actions">
                                    <button type="button" className="btn btn-link text-muted mr-3 font-weight-bold" onClick={() => setData({description:""})}>Clear Draft</button>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable} style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', fontWeight: '700' }}>
                                        {disable ? 'Uploading...' : 'Publish Post Now'}
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

export default AddPost;