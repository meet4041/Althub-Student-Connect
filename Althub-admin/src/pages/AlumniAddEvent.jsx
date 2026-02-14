/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axiosInstance from '../service/axios';
import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/edit-event.css';

const AlumniAddEvent = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const navigate = useNavigate();

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
        title: "",
        description: "",
        date: "",
        venue: "",
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
            body.append("organizerid", institute_Id);
            body.append("title", data.title);
            body.append("description", data.description);
            body.append("date", data.date);
            body.append("venue", data.venue);
            fileList.forEach(file => body.append(`photos`, file));

            axiosInstance.post(`${ALTHUB_API_URL}/api/addEvent`, body, {
                headers: {
                                        'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    if (res.data.success) {
                        toast.success("Event Published Successfully");
                        setTimeout(() => navigate('/alumni-events'), 1200);
                    }
                }).catch(() => {
                    setDisable(false);
                    toast.error("Submission failed. Check if you are logged in.");
                });
        }
    };

    const validate = () => {
        let errs = {};
        if (!data.title) errs.name_err = "Title is required";
        if (!data.description) errs.description_err = "Description is required";
        if (!data.date) errs.date_err = "Date is required";
        if (!data.venue) errs.venue_err = "Venue is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content edit-event-wrapper">
                    <div className="edit-event-container">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header edit-event-title mb-0">Create Alumni Event</h1>
                                <p className="text-muted small mb-0">Fill in the details to publish a new alumni event</p>
                            </div>
                            <Link to="/alumni-events" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        </div>

                        <div className="event-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="form-body-scroll">
                                    <div className="row">
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Event Title</label>
                                                <input type="text" className="form-control form-control-modern" name="title" value={data.title} onChange={handleChange} />
                                                {errors.name_err && <small className="text-danger">{errors.name_err}</small>}
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Date & Time</label>
                                                    <input type='datetime-local' className="form-control form-control-modern" name="date" value={data.date} onChange={handleChange} />
                                                </div>
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Venue</label>
                                                    <input type="text" className="form-control form-control-modern" name="venue" value={data.venue} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="form-group mb-0">
                                                <label className="form-label-modern">Full Description</label>
                                                <textarea className="form-control form-control-modern" rows="7" name="description" value={data.description} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-modern">Event Media</label>
                                            <div className="upload-drop-zone">
                                                <input type='file' multiple className="d-none" id="addImgUploadAlumni" onChange={imgChange} />
                                                <label htmlFor="addImgUploadAlumni" className="text-center cursor-pointer mb-0">
                                                    <div className="mb-3"><i className="fa fa-images fa-3x text-primary opacity-25"></i></div>
                                                    <h6 className="font-weight-bold">Click to upload photos</h6>
                                                </label>
                                                <div className="preview-grid">
                                                    {fileList.map((elem, index) => (
                                                        <img key={index} src={window.URL.createObjectURL(elem)} className="preview-thumbnail" alt="preview" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 bg-light rounded edit-event-note">
                                                <small className="text-muted"><i className="fa fa-info-circle mr-2"></i> Tip: Upload high-quality images for better visibility.</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-footer-sticky">
                                    <button type="submit" className="btn btn-primary px-5 edit-event-save-btn" disabled={disable}>
                                        {disable ? 'Publishing...' : 'Publish Event Now'}
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

export default AlumniAddEvent;
