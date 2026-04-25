/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import axiosInstance from '../../../service/axios';
import Loader from '../../../layouts/Loader.jsx';
import Menu from '../../../layouts/Menu.jsx';
import Footer from '../../../layouts/Footer.jsx';

import '../../../styles/add-post.css';

const AlumniAddPost = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Data, setInstitute_Data] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        if (!id) {
            navigate('/login', { replace: true });
            return;
        }
        setInstitute_Id(id);

        axiosInstance.get(`${ALTHUB_API_URL}/api/getInstituteById/${id}`)
            .then((res) => {
                if (res.data.success) setInstitute_Data(res.data.data);
            })
            .catch(() => {});
    }, [navigate]);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        description: "",
    });

    const [fileList, setFileList] = useState([]);

    const imgChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
        setFileList(validFiles);
        if (validFiles.length !== selectedFiles.length) {
            toast.error("Only JPG, PNG, GIF, and WEBP files are allowed.");
        }
    };

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const submitHandler = (e) => {
        e.preventDefault();
        if (!institute_Id) {
            toast.error("Session expired. Please log in again.");
            navigate('/login', { replace: true });
            return;
        }
        if (!institute_Data) {
            toast.error("Institute profile is still loading. Please try again.");
            return;
        }
        if (validate()) {
            setDisable(true);
            const body = new FormData();
            body.append("senderid", institute_Id);
            body.append("userid", institute_Id);
            body.append("description", data.description);
            body.append("fname", institute_Data?.institutename || "Institute");
            body.append("companyname", institute_Data?.institutename || "");
            body.append("profilepic", institute_Data?.profilepic || "");
            body.append("title", "Update");
            fileList.forEach(file => body.append(`photos`, file));

            axiosInstance.post(`${ALTHUB_API_URL}/api/addPost`, body, {
                headers: { 
                    'Content-Type': 'multipart/form-data' 
                }
            })
            .then(() => {
                toast.success("Post published to community feed");
                setTimeout(() => navigate('/alumni-posts'), 1500);
            }).catch(() => {
                setDisable(false);
                toast.error("Failed to upload post. Please check your connection.");
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
                                <h1 className="page-header mb-0" style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Create Alumni Post</h1>
                                <p className="text-muted small mb-0">Posting as: <strong>{institute_Data?.institutename || "Loading..."}</strong></p>
                            </div>
                            <Link to="/alumni-posts" className="btn btn-light btn-sm font-weight-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                <i className="fa fa-arrow-left mr-1"></i> Back to Feed
                            </Link>
                        </div>

                        <div className="post-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="post-body-scroll">
                                    <div className="row h-100">
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group h-100 d-flex flex-column">
                                                <label className="form-label-saas">Post Content & Description</label>
                                                <textarea
                                                    className="form-control form-control-saas flex-grow-1"
                                                    placeholder="Share an update with your alumni..."
                                                    rows="10"
                                                    name="description"
                                                    value={data.description}
                                                    onChange={handleChange}
                                                    style={{ resize: 'none', minHeight: '300px' }}
                                                />
                                                {errors.description_err && <small className="text-danger font-weight-bold mt-2">{errors.description_err}</small>}
                                            </div>
                                        </div>

                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-saas">Media Attachments</label>
                                            <div className="post-upload-zone">
                                                <input type='file' multiple accept="image/jpeg,image/png,image/gif,image/webp" className="d-none" id="alumniAddPostFile" onChange={imgChange} />
                                                <label htmlFor="alumniAddPostFile" className="cursor-pointer">
                                                    <div className="mb-3"><i className="fa fa-images fa-3x text-primary opacity-25"></i></div>
                                                    <h6 className="font-weight-bold text-dark">Add photos to your post</h6>
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
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable} style={{ borderRadius: '10px', backgroundColor: '#2563EB', border: 'none', fontWeight: '700' }}>
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

export default AlumniAddPost;
