/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/add-post.css';

const AlumniAddPost = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        setInstitute_Id(localStorage.getItem("AlmaPlus_institute_Id"));
    }, []);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        description: "",
    });

    const [fileList, setFileList] = useState([]);

    const imgChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFileList(selectedFiles.filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i)));
    };

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate() && institute_Id) {
            setDisable(true);
            const body = new FormData();
            body.append("userid", institute_Id);
            body.append("description", data.description);
            fileList.forEach(file => body.append(`photos`, file));

            axios.post(`${ALTHUB_API_URL}/api/addPost`, body, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            })
            .then((res) => {
                if(res.data.success) {
                    toast.success("Post Published Successfully");
                    setTimeout(() => navigate('/alumni-posts'), 1200);
                }
            }).catch(() => {
                setDisable(false);
                toast.error("Submission failed. Check if you are logged in.");
            });
        }
    };

    const validate = () => {
        let errs = {};
        if (!data.description) errs.description_err = "Description is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content add-post-wrapper">
                    <div className="add-post-container">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header edit-event-title mb-0">Create Alumni Post</h1>
                                <p className="text-muted small mb-0">Share updates and announcements with alumni</p>
                            </div>
                            <Link to="/alumni-posts" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        </div>

                        <div className="post-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="post-body-scroll">
                                    <div className="row">
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group mb-0">
                                                <label className="form-label-saas">Post Description</label>
                                                <textarea className="form-control form-control-saas" rows="10" name="description" value={data.description} onChange={handleChange} />
                                                {errors.description_err && <small className="text-danger">{errors.description_err}</small>}
                                            </div>
                                        </div>

                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-saas">Post Media</label>
                                            <div className="post-upload-zone">
                                                <input type='file' multiple className="d-none" id="alumniAddPostFile" onChange={imgChange} />
                                                <label htmlFor="alumniAddPostFile" className="cursor-pointer mb-0">
                                                    <i className="fa fa-cloud-upload-alt fa-2x text-primary mb-2 opacity-50"></i>
                                                    <p className="mb-0 font-weight-bold text-dark">Add photos</p>
                                                </label>
                                                <div className="post-preview-grid">
                                                    {fileList.map((elem, index) => (
                                                        <img key={index} src={window.URL.createObjectURL(elem)} className="post-preview-img" alt="preview" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="post-footer-actions">
                                    <button type="submit" className="btn btn-primary px-5 edit-event-save-btn" disabled={disable}>
                                        {disable ? 'Publishing...' : 'Publish Post'}
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

export default AlumniAddPost;
