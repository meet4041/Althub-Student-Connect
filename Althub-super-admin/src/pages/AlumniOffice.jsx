import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axios';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';

// USING THE PREMIUM THEME
import '../styles/users.css';

const AlumniOffice = () => {
    const [data, setData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [deleteId, setDeleteId] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        if (document.getElementById('page-loader')) document.getElementById('page-loader').style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        // Unrestricted fetch for all Alumni Office records
        axiosInstance.get('/api/getAlumniOffices')
            .then(res => {
                const results = res.data.data || [];
                setData(results);
                setDisplayData(results);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Alumni Fetch Error:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const filtered = data.filter(item => 
            (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.institute && item.institute.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setDisplayData(filtered);
    }, [searchTerm, data]);

    const executeDelete = () => {
        axiosInstance.delete(`/api/deleteAlumniOffice/${deleteId}`)
            .then(() => {
                setShowDeletePrompt(false);
                setShowSuccessAlert(true);
                fetchData();
            }).catch(() => setShowDeletePrompt(false));
    };

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    
                    {/* PREMIUM HEADER */}
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="page-header mb-1">Alumni Governance</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                Campus Hubs: <span className="text-primary">{data.length}</span> Verified Alumni Offices
                            </p>
                        </div>
                        <div className="search-input-group-modern" style={{ minWidth: '350px', borderColor:'#2563eb'}}>
                            <i className="fa fa-search"></i>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search Alumni-Office" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : (
                        <div className="row">
                            {displayData.length > 0 ? displayData.map((item) => (
                                <div key={item._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="inst-floating-card h-100" onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                                        <div className="inst-card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="inst-icon-glow">
                                                    <i className="fa fa-graduation-cap"></i>
                                                </div>
                                                <button 
                                                    className="btn btn-light-danger btn-xs rounded-pill px-2" 
                                                    onClick={(e) => {e.stopPropagation(); setDeleteId(item._id); setShowDeletePrompt(true);}}
                                                >
                                                    <i className="fa fa-trash-alt text-danger"></i>
                                                </button>
                                            </div>

                                            <div className="mt-4">
                                                <h5 className="inst-title mb-0">{item.name}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center py-5">
                                    <h4 className="text-muted font-weight-bold">No alumni offices found in the registry.</h4>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <SweetAlert warning show={showDeletePrompt} showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" title="Purge Record?" onConfirm={executeDelete} onCancel={() => setShowDeletePrompt(false)}>
                    This office will be permanently removed from the Althub registry.
                </SweetAlert>

                <SweetAlert success show={showSuccessAlert} title="Purged" onConfirm={() => setShowSuccessAlert(false)}>
                    Record successfully removed.
                </SweetAlert>

                {selectedItem && (
                    <div className="althub-modal-overlay" onClick={() => setSelectedItem(null)}>
                        <div className="althub-modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-top-accent"></div>
                            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>&times;</button>
                            <div className="modal-content-inner">
                                <div className="modal-profile-section">
                                    <div>
                                        <h2 className="modal-user-name">{selectedItem.name}</h2>
                                        <span className="status-pill-modern pill-amber">
                                            <i className="fa fa-graduation-cap mr-1"></i> Alumni Office
                                        </span>
                                    </div>
                                </div>

                                <div className="modal-details-grid mt-5">
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{selectedItem.email || 'Not Provided'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact Number</label>
                                        <p>{selectedItem.phone || 'Not Provided'}</p>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Campus Hub</label>
                                        <p>{selectedItem.institute || 'Global Network'}</p>
                                    </div>
                                </div>

                                <div className="modal-footer-actions mt-5">
                                    <button className="btn btn-primary btn-block rounded-pill py-3 font-weight-bold shadow-lg" onClick={() => setSelectedItem(null)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <Footer />
            </div>
        </Fragment>
    );
};

export default AlumniOffice;
