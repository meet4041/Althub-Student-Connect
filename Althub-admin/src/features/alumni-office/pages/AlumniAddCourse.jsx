import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../service/axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../../../layouts/Loader.jsx';
import Menu from '../../../layouts/Menu.jsx';
import Footer from '../../../layouts/Footer.jsx';
import AlumniPageShell from '../components/AlumniPageShell.jsx';

import '../../../styles/alumni-pages.css';
import '../../../styles/add-post.css';

const AlumniAddCourse = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [stream, setStream] = useState('');
    const [duration, setDuration] = useState('');
    const [disable, setDisable] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedStream = stream.trim();
        const durationValue = duration ? Number(duration) : undefined;
        const nextErrors = {};

        if (!trimmedName) nextErrors.name = "Course name is required";
        if (duration && (!Number.isFinite(durationValue) || durationValue < 0)) nextErrors.duration = "Duration must be 0 or more";

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const instituteid = localStorage.getItem("AlmaPlus_institute_Id");
        if (!instituteid) {
            toast.error("Institute not found. Please log in again.");
            return;
        }

        setDisable(true);
        try {
            await axiosInstance.post('/api/addCourse', {
                instituteid,
                name: trimmedName,
                stream: trimmedStream,
                duration: durationValue
            });
            toast.success("Course added successfully");
            navigate('/alumni-members');
        } catch (err) {
            setDisable(false);
            toast.error(err.response?.data?.msg || "Failed to add course");
        }
    };

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content alumni-content-wrapper">
                    <AlumniPageShell
                        title="Add Course"
                        breadcrumb="Add Course"
                        subtitle="Create a course and specialization for alumni grouping."
                        action={(
                            <Link to="/alumni-members" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        )}
                    >

                        <div className="post-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="post-body-scroll">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label-saas">Course Name</label>
                                                <input
                                                    className="form-control form-control-saas"
                                                    value={name}
                                                    onChange={(e) => {
                                                        setName(e.target.value);
                                                        setErrors((prev) => ({ ...prev, name: '' }));
                                                    }}
                                                    placeholder="e.g. MSCIT"
                                                    required
                                                />
                                                {errors.name && <small className="text-danger">{errors.name}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group mb-4">
                                                <label className="form-label-saas">Specialization</label>
                                                <input
                                                    className="form-control form-control-saas"
                                                    value={stream}
                                                    onChange={(e) => setStream(e.target.value)}
                                                    placeholder="e.g. Information Technology"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group mb-0">
                                                <label className="form-label-saas">Duration (Years)</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-saas"
                                                    value={duration}
                                                    onChange={(e) => {
                                                        setDuration(e.target.value);
                                                        setErrors((prev) => ({ ...prev, duration: '' }));
                                                    }}
                                                    placeholder="e.g. 2"
                                                    min="0"
                                                />
                                                {errors.duration && <small className="text-danger">{errors.duration}</small>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="post-footer-actions">
                                    <Link to="/alumni-members" className="btn btn-link text-muted mr-3 font-weight-bold">Cancel</Link>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm edit-event-save-btn" disabled={disable}>
                                        {disable ? 'Saving...' : 'Save Course'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </AlumniPageShell>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default AlumniAddCourse;
