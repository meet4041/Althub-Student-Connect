import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axios';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';

// IMPORT UPDATED TABLE STYLES
import '../styles/feedback.css';

const FeedBack = () => {
    const [feedback, setFeedBack] = useState([]);
    const [displayFeedBack, setDisplayFeedBack] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [deleteId, setDeleteId] = useState('');
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        // KILL INFINITE LOADER IMMEDIATELY
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getFeedBackData();
    }, []);

    const getFeedBackData = () => {
        setLoading(true);
        axiosInstance.get(`/api/getFeedback`).then((response) => {
            if (response.data.success === true) {
                setFeedBack(response.data.data);
                setDisplayFeedBack(response.data.data);
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching feedback:", err);
            setLoading(false);
        });
    };

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setSearchTerm(search);
        setDisplayFeedBack(feedback.filter(
            (elem) =>
                (elem.message && elem.message.toLowerCase().includes(search)) ||
                (elem.name && elem.name.toLowerCase().includes(search)) ||
                (elem.selected_user && elem.selected_user.toLowerCase().includes(search))
        ));
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeletePrompt(true);
    }

    const executeDeletion = () => {
        axiosInstance.delete(`/api/deleteFeedback/${deleteId}`).then((response) => {
            if (response.data.success === true) {
                setShowDeletePrompt(false);
                setShowSuccessAlert(true);
                getFeedBackData();
            }
        }).catch(() => setShowDeletePrompt(false));
    }

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={`fa fa-star ${i <= rating ? 'text-star-active' : 'text-star-muted'}`}></i>
            );
        }
        return stars;
    };

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content feedback-wrapper">

                    {/* PREMIUM HEADER */}
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="page-header mb-1">Sentiment Registry</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                Global Oversight: <span className="text-primary">{feedback.length}</span> Verified User Reviews
                            </p>
                        </div>
                        <div className="search-input-group-modern" style={{ minWidth: '350px', borderColor: '#2563eb' }}>
                            <i className="fa fa-search"></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search message"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : (
                        <div className="directory-container glass-effect">
                            <div className="table-responsive">
                                <table className="table althub-modern-table">
                                    <thead>
                                        <tr>
                                            <th>Identification</th>
                                            <th>Sent To</th>
                                            <th style={{ width: '40%' }}>Detailed Testimony</th>
                                            <th>Rate</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayFeedBack.length > 0 ? displayFeedBack.map((item, index) => (
                                            <tr key={item._id}>
                                                <td>
                                                    <div className="profile-identity">
                                                        <span className="index-number">{index + 1}</span>
                                                        <div className="feedback-avatar-sm">
                                                            {item.name ? item.name.charAt(0).toUpperCase() : 'A'}
                                                        </div>
                                                        <div>
                                                            <div className="profile-name-main">{item.name || 'Anonymous'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="status-pill-modern pill-blue">
                                                        <i className="fa fa-bullseye mr-2"></i>
                                                        {item.selected_user || 'Ecosystem'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <p className="feedback-table-text">"{item.message}"</p>
                                                </td>
                                                <td>
                                                    <div className="feedback-stars">{renderStars(item.rate)}</div>
                                                </td>
                                                <td className="text-right">
                                                    <button className="btn btn-light-danger btn-xs rounded-pill px-3" onClick={() => handleDeleteClick(item._id)}>
                                                        <i className="fa fa-trash-alt mr-1"></i> Purge
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted font-weight-bold">
                                                    No sentiment records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <SweetAlert warning show={showDeletePrompt} showCancel confirmBtnText="Confirm Removal" confirmBtnBsStyle="danger" title="Purge Feedback?" onConfirm={executeDeletion} onCancel={() => setShowDeletePrompt(false)}>
                    This record will be permanently removed from the system registry.
                </SweetAlert>

                <SweetAlert success show={showSuccessAlert} title="Purged Successfully" onConfirm={() => setShowSuccessAlert(false)}>
                    The sentiment record has been removed.
                </SweetAlert>

                <Footer />
            </div>
        </Fragment>
    )
}

export default FeedBack;