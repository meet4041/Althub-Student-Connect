import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axios';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import { ALTHUB_API_URL } from '../config/baseURL';

import '../styles/users.css';

const Users = () => {
    const [institutes, setInstitutes] = useState([]);
    const [selectedInst, setSelectedInst] = useState(null); 
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // MODAL STATE
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (document.getElementById('page-loader')) document.getElementById('page-loader').style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        fetchInstitutes();
    }, []);

    const fetchInstitutes = () => {
        setLoading(true);
        axiosInstance.get('/api/getInstitutes')
            .then(res => {
                setInstitutes(res.data.data || []);
                setLoading(false);
            }).catch(() => setLoading(false));
    };

    const handleSelectInstitute = (inst) => {
        setLoading(true);
        setSelectedInst(inst);
        axiosInstance.get(`/api/getUsersByInstName/${inst.name}`)
            .then(res => {
                setUsers(res.data.data || []);
                setLoading(false);
            }).catch((err) => {
                console.error("Fetch Error:", err);
                setUsers([]);
                setLoading(false);
            });
    };

    const filteredUsers = users.filter(u => 
        `${u.fname} ${u.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="page-header mb-1">Ecosystem Directory</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                {selectedInst ? (
                                    <><span className="text-primary">{selectedInst.name}</span> • {users.length} Active Records</>
                                ) : 'Select an institution to access its secure member database'}
                            </p>
                        </div>
                        {selectedInst && (
                            <button className="btn btn-white shadow-sm rounded-pill px-4 btn-sm font-weight-bold" onClick={() => setSelectedInst(null)}>
                                <i className="fa fa-exchange-alt mr-2 text-primary"></i> Change Campus
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : !selectedInst ? (
                        <div className="row">
                            {institutes.map(inst => (
                                <div key={inst._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="inst-floating-card" onClick={() => handleSelectInstitute(inst)}>
                                        <div className="inst-card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="inst-icon-glow"><i className="fa fa-university"></i></div>
                                                <i className="fa fa-arrow-right inst-arrow"></i>
                                            </div>
                                            <div className="mt-4">
                                                <h5 className="inst-title">{inst.name}</h5>
                                                <p className="inst-subtitle"><i className="fa fa-map-marker-alt mr-1"></i> {inst.location || 'Campus Domain'}</p>
                                            </div>
                                        </div>
                                        <div className="inst-card-footer">
                                            <span>Access Directory</span>
                                            <span className="badge badge-primary-soft">Secure</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="directory-container glass-effect">
                            <div className="directory-search-bar">
                                <div className="search-input-group-modern">
                                    <i className="fa fa-search"></i>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder={`Search among ${users.length} members...`} 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table althub-modern-table">
                                    <thead>
                                        <tr>
                                            <th># Profile Identification</th>
                                            <th>Classification</th>
                                            <th>Timeline</th>
                                            <th className="text-right">Intelligence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div className="profile-identity">
                                                        <span className="index-number">{index + 1}</span>
                                                        <img src={user.profilepic ? `${ALTHUB_API_URL}${user.profilepic}` : 'assets/img/profile1.png'} className="profile-squircle" alt="pfp" />
                                                        <div>
                                                            <div className="profile-name-main">{user.fname} {user.lname}</div>
                                                            <div className="profile-email-sub">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-pill-modern ${user.type === 'Student' ? 'pill-blue' : 'pill-amber'}`}>
                                                        <i className={`fa ${user.type === 'Student' ? 'fa-book' : 'fa-graduation-cap'} mr-1`}></i> {user.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="timeline-badge">
                                                        {user.eduStart?.split('-')[0] || '20XX'} — {user.eduEnd?.split('-')[0] || '20XX'}
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button className="btn-view-intelligence" onClick={() => setSelectedUser(user)}>
                                                        View Full Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted">
                                                    <i className="fa fa-folder-open fa-3x mb-3 opacity-20"></i>
                                                    <p className="font-weight-bold">No member records found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- INTELLIGENCE MODAL (POPUP) --- */}
                {selectedUser && (
                    <div className="althub-modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="althub-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-top-accent"></div>
                            <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
                            
                            <div className="modal-content-inner">
                                <div className="modal-profile-section">
                                    <img src={selectedUser.profilepic ? `${ALTHUB_API_URL}${selectedUser.profilepic}` : 'assets/img/profile1.png'} className="modal-squircle-lg" alt="profile" />
                                    <div className="ml-4">
                                        <h2 className="modal-user-name">{selectedUser.fname} {selectedUser.lname}</h2>
                                        <span className={`status-pill-modern ${selectedUser.type === 'Student' ? 'pill-blue' : 'pill-amber'}`}>
                                            {selectedUser.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="modal-details-grid mt-5">
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact Number</label>
                                        <p>{selectedUser.phone || 'Not Provided'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Academic Institution</label>
                                        <p>{selectedInst?.name || selectedUser.institute}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Education Period</label>
                                        <p className="font-weight-bold text-primary">
                                            {selectedUser.eduStart} to {selectedUser.eduEnd}
                                        </p>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Account ID</label>
                                        <code className="text-muted">{selectedUser._id}</code>
                                    </div>
                                </div>
                                
                                <div className="modal-footer-actions mt-5">
                                    <button className="btn btn-primary btn-block rounded-pill py-3 font-weight-bold shadow-lg" onClick={() => setSelectedUser(null)}>
                                        Acknowledge Intelligence
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

export default Users;