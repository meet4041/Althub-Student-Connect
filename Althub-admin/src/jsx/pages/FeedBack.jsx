import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import axiosInstance from '../../services/axios'; 

const FeedBack = () => {
    const [feedback, setFeedBack] = useState([]);
    const [displayFeedBack, setDisplayFeedBack] = useState([]);
    const rows = [10, 20, 30];
    const [feedbackPerPage, setFeedBackPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [deleteId, setDeleteId] = useState('');
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        var element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getFeedBackData();
    }, []);

    const getFeedBackData = () => {
        axiosInstance.get(`/api/getFeedback`).then((response) => {
            if (response.data.success === true) {
                setFeedBack(response.data.data);
            }
        }).catch(err => console.error("Error fetching feedback:", err));
    };

    useEffect(() => {
        setDisplayFeedBack(feedback);
    }, [feedback]);

    const indexOfLastUser = currentPage * feedbackPerPage;
    const indexOfFirstUser = indexOfLastUser - feedbackPerPage;
    const currentFeedBack = displayFeedBack.slice(indexOfFirstUser, indexOfLastUser);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayFeedBack.length / feedbackPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => setCurrentPage(num);

    // --- UPDATED SEARCH LOGIC ---
    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setDisplayFeedBack(feedback.filter(
            (elem) =>
                (elem.message && elem.message.toLowerCase().includes(search)) ||
                (elem.name && elem.name.toLowerCase().includes(search)) ||
                (elem.selected_user && elem.selected_user.toLowerCase().includes(search)) // Search by Selected User
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
                setDeleteId('');
                getFeedBackData();
            }
        }).catch(err => {
            setShowDeletePrompt(false);
            console.error("Deletion failed", err);
        });
    }

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} 
                   className={`fa fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`} 
                   style={{ fontSize: '13px', marginRight: '2px' }}>
                </i>
            );
        }
        return stars;
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">FeedBack</li>
                    </ol>
                    <h1 className="page-header text-dark font-weight-bold">
                        User Feedback <small>Monitor and manage platform reviews</small>
                    </h1>
                    
                    <div className="card border-0 shadow-sm rounded-lg">
                        <div className="card-body">
                            {/* SEARCH BAR */}
                            <div className="input-group mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-white border-right-0"><i className="fa fa-search text-muted"></i></span>
                                </div>
                                <input 
                                    type="search" 
                                    className="form-control border-left-0 shadow-none" 
                                    placeholder='Search by sender, target user, or message...' 
                                    onChange={handleSearch} 
                                />
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-top-0">Sr. No.</th>
                                            <th className="border-top-0">Sender (From)</th>
                                            <th className="border-top-0">Selected User (To)</th> {/* NEW COLUMN */}
                                            <th className="border-top-0" style={{width: '35%'}}>Review Message</th>
                                            <th className="border-top-0">Rating</th>
                                            <th className="border-top-0 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFeedBack.length > 0 ? currentFeedBack.map((elem, index) =>
                                            <tr key={index}>
                                                <td className="font-weight-bold text-muted">{indexOfFirstUser + index + 1}</td>
                                                
                                                {/* SENDER */}
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary-transparent text-primary rounded-circle d-flex align-items-center justify-content-center mr-2" style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold' }}>
                                                            {elem.name ? elem.name.charAt(0).toUpperCase() : 'A'}
                                                        </div>
                                                        <span className="font-weight-600 text-dark">{elem.name || 'Anonymous'}</span>
                                                    </div>
                                                </td>

                                                {/* SELECTED USER (TARGET) */}
                                                <td>
                                                    <span className="text-primary font-weight-bold">
                                                        {elem.selected_user ? (
                                                            <>
                                                                <i className="fa fa-user-tag mr-1 opacity-5"></i>
                                                                {elem.selected_user}
                                                            </>
                                                        ) : (
                                                            <span className="text-muted small">General</span>
                                                        )}
                                                    </span>
                                                </td>

                                                {/* MESSAGE */}
                                                <td className="text-muted">
                                                    <div style={{ maxWidth: '450px', wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: '1.5' }}>
                                                        {elem.message}
                                                    </div>
                                                </td>

                                                {/* RATING */}
                                                <td>{renderStars(elem.rate)}</td>

                                                {/* ACTIONS */}
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm rounded-circle btn-icon" 
                                                        onClick={() => handleDeleteClick(elem._id)}
                                                        title="Delete Review"
                                                    >
                                                        <i className='fa fa-trash-alt'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted">No feedback records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION SECTION */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top">
                                <nav>
                                    <ul className="pagination mb-0">
                                        {pageNumbers.map((number) =>
                                            <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                                <button className="page-link shadow-none" onClick={() => paginate(number)}>{number}</button>
                                            </li>
                                        )}
                                    </ul>
                                </nav>
                                <div className="mt-3 mt-md-0 d-flex align-items-center bg-light px-3 py-2 rounded">
                                    <small className="text-muted mr-2">Show:</small>
                                    <select 
                                        className="custom-select custom-select-sm border-0 bg-transparent font-weight-bold shadow-none" 
                                        style={{ width: 'auto', cursor: 'pointer' }}
                                        onChange={(e) => setFeedBackPerPage(Number(e.target.value))}
                                    >
                                        {rows.map(value => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DELETE PROMPT */}
                {showDeletePrompt && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        cancelBtnText="Cancel"
                        cancelBtnBsStyle="default"
                        title="Delete Feedback?"
                        onConfirm={executeDeletion}
                        onCancel={() => { setShowDeletePrompt(false); setDeleteId(''); }}
                        focusCancelBtn
                    >
                        This will permanently remove the user's review from the platform.
                    </SweetAlert>
                )}

                {/* SUCCESS ALERT */}
                {showSuccessAlert && (
                    <SweetAlert
                        success
                        title="Deleted Successfully!"
                        onConfirm={() => setShowSuccessAlert(false)}
                    >
                        The feedback has been removed from the system.
                    </SweetAlert>
                )}

                <Footer />
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .bg-primary-transparent { background-color: rgba(49, 130, 206, 0.1); }
                .font-weight-600 { font-weight: 600; }
                .table-hover tbody tr:hover { background-color: #f8fafc; }
                .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .btn-icon:hover { background-color: #e53e3e; color: white; }
                .text-warning { color: #f6e05e !important; }
                .opacity-5 { opacity: 0.5; }
            `}} />
        </Fragment>
    )
}

export default FeedBack;