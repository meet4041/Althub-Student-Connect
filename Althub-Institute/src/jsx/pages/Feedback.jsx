/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';

// Import CSS
import '../../styles/feedback.css';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [displayFeedbacks, setDisplayFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteId, setDeleteId] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const themeColor = '#2563EB';

    const fetchFeedbackData = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios.get(`${ALTHUB_API_URL}/api/getFeedback`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((response) => {
            if (response.data.success) {
                setFeedbacks(response.data.data || []);
            }
            setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchFeedbackData();
        const loader = document.getElementById('page-loader');
        const container = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (container) container.classList.add("show");
    }, []);

    useEffect(() => {
        const filtered = feedbacks.filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.selected_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayFeedbacks(filtered);
        setCurrentPage(1);
    }, [searchTerm, feedbacks]);

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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = Array.from({ length: Math.ceil(displayFeedbacks.length / itemsPerPage) }, (_, i) => i + 1);

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content feedback-content-wrapper">
                    <div className="feedback-container">
                        
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>User Feedback</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>Feedback Management</h1>
                            </div>
                        </div>

                        <div className="feedback-scroll-area">
                            <div className="card feedback-main-card">
                                <div className="card-body p-0 bg-white">
                                    
                                    <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <div className="input-group" style={{ maxWidth: '400px' }}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search feedback or users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                    <th className="border-0 pl-4 py-3" style={{ width: '60px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>#</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Sender</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Recipient</th>
                                                    <th className="border-0 py-3" style={{ width: '35%', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Message</th>
                                                    <th className="border-0 py-3 text-center" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Score</th>
                                                    <th className="border-0 text-right pr-5 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="6" className="text-center p-5"><div className="spinner-border text-primary"></div></td></tr>
                                                ) : currentItems.length > 0 ? currentItems.map((item, index) => (
                                                    <tr key={item._id} className="feedback-row">
                                                        <td className="pl-4 align-middle"><span className="feedback-id-badge">{(indexOfFirstItem + index + 1).toString().padStart(2, '0')}</span></td>
                                                        
                                                        {/* FROM Column */}
                                                        <td className="align-middle">
                                                            <div className="font-weight-bold text-dark" style={{ fontSize: '14px' }}>{item.name || 'Anonymous'}</div>
                                                        </td>

                                                        {/* TO Column */}
                                                        <td className="align-middle">
                                                            <div className="text-primary font-weight-bold" style={{ fontSize: '14px' }}>{item.selected_user || 'General'}</div>
                                                        </td>

                                                        <td className="align-middle">
                                                            <div className="message-box" title={item.message}>"{item.message}"</div>
                                                        </td>

                                                        {/* Numerical Rating Column */}
                                                        <td className="align-middle text-center">
                                                            <span style={{ 
                                                                backgroundColor: item.rate >= 4 ? '#DCFCE7' : item.rate >= 3 ? '#FEF9C3' : '#FEE2E2', 
                                                                color: item.rate >= 4 ? '#166534' : item.rate >= 3 ? '#854D0E' : '#991B1B',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontWeight: '800',
                                                                fontSize: '13px'
                                                            }}>
                                                                {item.rate}<small className="ml-1 opacity-50">/ 5</small>
                                                            </span>
                                                        </td>

                                                        <td className="align-middle text-right pr-5">
                                                            <button className="btn btn-light btn-sm border" style={{ borderRadius: '6px' }} onClick={() => { setDeleteId(item._id); setShowAlert(true); }}>
                                                                <i className="fa fa-trash-alt text-danger"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="6" className="text-center p-5 text-muted">No feedback records found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-4 bg-white d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <p className="text-muted small mb-0 font-weight-bold">Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, displayFeedbacks.length)}</p>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                {pageNumbers.map(num => (
                                                    <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                        <button className="page-link border-0 mx-1" onClick={() => setCurrentPage(num)} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px' } : { backgroundColor: '#F8FAFC', color: themeColor, borderRadius: '6px' }}>{num}</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SweetAlert warning show={showAlert} showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" cancelBtnBsStyle="light" title="Delete Review?" onConfirm={confirmDelete} onCancel={() => setShowAlert(false)} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    );
};

export default Feedback;