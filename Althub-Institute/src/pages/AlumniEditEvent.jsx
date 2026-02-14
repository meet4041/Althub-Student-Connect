/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/edit-event.css';

const AlumniEditEvent = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        id: "",
        title: "",
        description: "",
        date: "",
        venue: "",
    });
    const location = useLocation();

    const geteventData = () => {
        if (location.state && location.state.data) {
            const state = location.state.data;
            setData({
                id: state._id,
                title: state.title,
                description: state.description,
                date: state.date,
                venue: state.venue,
            });
        }
    };

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        geteventData();
    }, []);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const [fileList, setFileList] = useState(null);
    const files = fileList ? [...fileList] : [];
    const imgChange = (e) => { setFileList(e.target.files); };

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const body = new FormData();
            body.append("id", data.id);
            body.append("title", data.title);
            body.append("description", data.description);
            body.append("date", data.date);
            body.append("venue", data.venue);

            files.forEach((file) => {
                body.append(`photos`, file, file.name);
            });

            const token = localStorage.getItem('token');

            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/editEvent`,
                data: body,
                headers: {
                    "content-type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            }).then(() => {
                setDisable(false);
                toast.success("Changes saved successfully");
                setTimeout(() => navigate('/alumni-events'), 1200);
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.msg || "Update failed");
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

    const getFormattedDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split('T')[0];
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
                                <h1 className="page-header edit-event-title mb-0">Edit Alumni Event</h1>
                                <p className="text-muted small mb-0">Modify the fields below to update your event listing</p>
                            </div>
                            <Link to="/alumni-events" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back to Events
                            </Link>
                        </div>

                        <div className="event-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="form-body-scroll">
                                    <div className="row h-100">
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Event Title</label>
                                                <input type="text" className="form-control form-control-modern" name="title" value={data.title} onChange={handleChange} placeholder="Enter Title" />
                                                {errors.name_err && <small className="text-danger font-weight-bold">{errors.name_err}</small>}
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Scheduled Date</label>
                                                    <input type='date' className="form-control form-control-modern" name="date" value={getFormattedDate(data.date)} onChange={handleChange} />
                                                    {errors.date_err && <small className="text-danger font-weight-bold">{errors.date_err}</small>}
                                                </div>
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Venue</label>
                                                    <input type="text" className="form-control form-control-modern" name="venue" value={data.venue} onChange={handleChange} placeholder="e.g. Hall A" />
                                                    {errors.venue_err && <small className="text-danger font-weight-bold">{errors.venue_err}</small>}
                                                </div>
                                            </div>

                                            <div className="form-group mb-0">
                                                <label className="form-label-modern">Full Description</label>
                                                <textarea className="form-control form-control-modern" rows="7" name="description" value={data.description} onChange={handleChange} style={{ resize: 'none' }} placeholder="Provide event details..." />
                                                {errors.description_err && <small className="text-danger font-weight-bold">{errors.description_err}</small>}
                                            </div>
                                        </div>

                                        <div className="col-md-7 pl-md-4">
                                            <label className="form-label-modern">Media & Photos Update</label>
                                            <div className="upload-drop-zone">
                                                <input type='file' multiple className="d-none" id="editImgUploadAlumni" onChange={imgChange} />
                                                <label htmlFor="editImgUploadAlumni" className="text-center cursor-pointer mb-0">
                                                    <i className="fa fa-cloud-upload-alt fa-2x text-primary mb-2 opacity-50"></i>
                                                    <p className="mb-0 font-weight-bold">Click to replace or add photos</p>
                                                    <small className="text-muted">Maximum file size: 10MB (JPG, PNG)</small>
                                                </label>

                                                {files.length > 0 && (
                                                    <div className="preview-grid">
                                                        {files.map((elem, index) => (
                                                            <img key={index} src={window.URL.createObjectURL(elem)} className="preview-thumbnail" alt="preview" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 p-3 bg-light rounded edit-event-note">
                                                <small className="text-muted"><i className="fa fa-info-circle mr-2"></i> Note: Uploading new images will override previous ones for this event.</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-footer-sticky">
                                    <Link to="/alumni-events" className="btn btn-link text-muted mr-3 font-weight-bold">Discard Changes</Link>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm edit-event-save-btn" disabled={disable}>
                                        {disable ? 'Saving Changes...' : 'Update Event Listing'}
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

export default AlumniEditEvent;
