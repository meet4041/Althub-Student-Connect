/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import SweetAlert from 'react-bootstrap-sweetalert';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [displayFeedbacks, setDisplayFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Delete state
    const [deleteId, setDeleteId] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    // 1. Fetch Feedback using the Secure Route
    const fetchFeedbackData = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        axios.get(`${ALTHUB_API_URL}/api/getFeedback`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((response) => {
            if (response.data.success) {
                setFeedbacks(response.data.data || []);
                setDisplayFeedbacks(response.data.data || []);
            }
            setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchFeedbackData();
        // UI Initialization for template
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const container = document.getElementById("page-container");
        if (container) container.classList.add("show");
    }, []);

    // 2. Search Logic
    useEffect(() => {
        const filtered = feedbacks.filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayFeedbacks(filtered);
        setCurrentPage(1);
    }, [searchTerm, feedbacks]);

    // 3. Delete Feedback Logic
    const confirmDelete = () => {
        const token = localStorage.getItem('token');
        axios.delete(`${ALTHUB_API_URL}/api/deleteFeedback/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((response) => {
            if (response.data.success) {
                setShowAlert(false);
                fetchFeedbackData();
            }
        });
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = Array.from({ length: Math.ceil(displayFeedbacks.length / itemsPerPage) }, (_, i) => i + 1);

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                        <li className="breadcrumb-item active">Feedback</li>
                    </ol>
                    <h1 className="page-header">User Feedback Management</h1>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-0">
                            {/* Search Header */}
                            <div className="p-4 border-bottom bg-light">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-white border rounded-pill px-3 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-success"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search by user or message..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Representation */}
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-dark text-white">
                                        <tr>
                                            <th className="border-0 pl-4">No.</th>
                                            <th className="border-0">Student Name</th>
                                            <th className="border-0">Rating</th>
                                            <th className="border-0" style={{ width: '40%' }}>Feedback Message</th>
                                            <th className="border-0 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x text-success"></i></td></tr>
                                        ) : currentItems.length > 0 ? currentItems.map((item, index) => (
                                            <tr key={item._id}>
                                                <td className="pl-4 align-middle text-muted">{indexOfFirstItem + index + 1}</td>
                                                <td className="align-middle font-weight-bold">{item.name || 'Anonymous'}</td>
                                                <td className="align-middle">
                                                    <div className="text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`${i < item.rate ? 'fas' : 'far'} fa-star`}></i>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="align-middle text-grey-darker">
                                                    <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        "{item.message}"
                                                    </div>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm" onClick={() => { setDeleteId(item._id); setShowAlert(true); }}>
                                                        <i className="fa fa-trash-alt text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center p-5 text-muted">No records found matching your search.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-3 bg-light d-flex justify-content-between align-items-center" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayFeedbacks.length)} of {displayFeedbacks.length}</div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {pageNumbers.map(num => (
                                            <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(num)}>{num}</button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <SweetAlert
                    warning
                    show={showAlert}
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    title="Remove this feedback?"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowAlert(false)}
                >
                    This feedback will be permanently removed from the records.
                </SweetAlert>
                <Footer />
            </div>
        </Fragment>
    );
};

export default Feedback;