import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../api/client';
import AppShell from '../../../layouts/AppShell.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import AdminPaginationFooter from '../../../components/admin/AdminPaginationFooter.jsx';
import AdminSearchBox from '../../../components/admin/AdminSearchBox.jsx';
import AdminTableAction from '../../../components/admin/AdminTableAction.jsx';
import '../../../styles/feedback.css';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [displayFeedbacks, setDisplayFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteId, setDeleteId] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const fetchFeedbackData = () => {
        setLoading(true);
        axiosInstance.get(`/api/v1/feedback`, {
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
        axiosInstance.delete(`/api/v1/feedback/${deleteId}`, {
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
    const hasFeedback = displayFeedbacks.length > 0;
    const showingFrom = hasFeedback ? indexOfFirstItem + 1 : 0;
    const showingTo = hasFeedback ? Math.min(indexOfLastItem, displayFeedbacks.length) : 0;

    return (
        <>
            <AppShell contentClassName="feedback-content-wrapper">
                    <div className="feedback-container">
                        
                        <div className="d-sm-flex align-items-center justify-content-between mb-4 institute-page-header">
                            <div className="institute-page-header-copy">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 institute-page-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                                        <li className="breadcrumb-item active">User Feedback</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0 institute-page-title">Feedback Management</h1>
                                <p className="institute-page-subtitle">Track reviews, sentiment, and member feedback with the same spacing and table rhythm.</p>
                            </div>
                        </div>

                        <div className="feedback-scroll-area">
                            <div className="admin-card feedback-main-card">
                                <div className="card-body p-0 bg-white">
                                    
                                    <div className="admin-toolbar">
                                        <AdminSearchBox
                                            value={searchTerm}
                                            onChange={setSearchTerm}
                                            placeholder="Search feedback or users..."
                                        />
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover admin-table">
                                            <thead>
                                                <tr>
                                                    <th className="pl-4 admin-id-col">#</th>
                                                    <th>Sender</th>
                                                    <th>Recipient</th>
                                                    <th className="feedback-message-col">Message</th>
                                                    <th className="text-center feedback-score-col">Score</th>
                                                    <th className="admin-table-actions-cell pr-4">Actions</th>
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
                                                            <div className="font-weight-bold text-dark admin-name-cell-sm">{item.name || 'Anonymous'}</div>
                                                        </td>

                                                        {/* TO Column */}
                                                        <td className="align-middle">
                                                            <div className="text-primary font-weight-bold admin-name-cell-sm">{item.selected_user || 'General'}</div>
                                                        </td>

                                                        <td className="align-middle">
                                                            <div className="message-box" title={item.message}>"{item.message}"</div>
                                                        </td>

                                                        {/* Numerical Rating Column */}
                                                        <td className="align-middle text-center">
                                                            <span className={`feedback-score-pill ${item.rate >= 4 ? 'good' : item.rate >= 3 ? 'ok' : 'bad'}`}>
                                                                {item.rate}<small className="ml-1 opacity-50">/ 5</small>
                                                            </span>
                                                        </td>

                                                        <td className="align-middle admin-table-actions-cell pr-4">
                                                            <div className="admin-table-actions">
                                                                <AdminTableAction
                                                                    icon="fa-trash-alt"
                                                                    label="Delete feedback"
                                                                    variant="danger"
                                                                    onClick={() => { setDeleteId(item._id); setShowAlert(true); }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="6" className="text-center p-5 text-muted">No feedback records found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <AdminPaginationFooter
                                        showingFrom={showingFrom}
                                        showingTo={showingTo}
                                        total={displayFeedbacks.length}
                                        pageNumbers={pageNumbers}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
            </AppShell>

                <SweetAlert warning show={showAlert} showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" cancelBtnBsStyle="light" title="Delete Review?" onConfirm={confirmDelete} onCancel={() => setShowAlert(false)} />
        </>
    );
};

export default Feedback;
