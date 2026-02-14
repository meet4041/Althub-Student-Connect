import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../service/axios';
import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/alumni-pages.css';
import '../styles/add-post.css';

const AlumniAddCourse = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [stream, setStream] = useState('');
    const [duration, setDuration] = useState('');
    const [disable, setDisable] = useState(false);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const instituteid = localStorage.getItem("AlmaPlus_institute_Id");
        setDisable(true);
        try {
            await axiosInstance.post('/api/addCourse', {
                instituteid,
                name: name.trim(),
                stream: stream.trim(),
                duration: duration ? Number(duration) : undefined
            });
            navigate('/alumni-members');
        } catch (err) {
            setDisable(false);
        }
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content alumni-content-wrapper">
                    <div className="alumni-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 alumni-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/alumni-members" className="alumni-breadcrumb-link">Home</Link></li>
                                        <li className="breadcrumb-item active">Add Course</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header alumni-header mb-0">Add Course</h1>
                            </div>
                            <Link to="/alumni-members" className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        </div>

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
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="e.g. MSCIT"
                                                    required
                                                />
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
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="e.g. 2"
                                                    min="0"
                                                />
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
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default AlumniAddCourse;
