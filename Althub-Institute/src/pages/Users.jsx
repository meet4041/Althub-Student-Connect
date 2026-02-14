/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layouts/Loader.jsx'
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// COMPANY STANDARD: Import external CSS
import '../styles/users.css';

const Users = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    const rows = [10, 20, 30];
    const [usersPerPage, setUsersPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    
    // NEW: Filter State
    const [filterType, setFilterType] = useState('all'); // 'all' or 'Alumni'

    const themeColor = '#2563EB';

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");

        const name = localStorage.getItem("AlmaPlus_institute_Name");
        setInstitute_Name(name);
    }, []);

    useEffect(() => {
        if (institute_Name) getUsersData();
    }, [institute_Name]);

    const getUsersData = () => {
        setIsTableLoading(true);
        const token = localStorage.getItem('token');
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`,
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((response) => {
            setUsers(response.data.success ? response.data.data : []);
            setIsTableLoading(false);
        }).catch(() => setIsTableLoading(false));
    };

    // Updated Filtering Logic to handle Alumni Toggle
    useEffect(() => {
        let processedUsers = [...users];
        
        // 1. Filter by Search Term
        if (searchTerm) {
            processedUsers = processedUsers.filter(user =>
                user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. NEW: Filter by Alumni Type
        if (filterType === 'Alumni') {
            processedUsers = processedUsers.filter(user => user.type === 'Alumni');
        }

        // 3. Handle Sorting
        if (sortConfig.key === 'fname') {
            processedUsers.sort((a, b) => {
                let aValue = a.fname ? a.fname.toLowerCase() : '';
                let bValue = b.fname ? b.fname.toLowerCase() : '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        setDisplayUsers(processedUsers);
        setCurrentPage(1);
    }, [searchTerm, users, sortConfig, filterType]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="fa fa-sort text-muted ml-2 opacity-25"></i>;
        return sortConfig.direction === 'asc'
            ? <i className="fa fa-sort-up text-primary ml-2"></i>
            : <i className="fa fa-sort-down text-primary ml-2"></i>;
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = displayUsers.slice(indexOfFirstUser, indexOfLastUser);
    const pageNumbers = Array.from({ length: Math.ceil(displayUsers.length / usersPerPage) }, (_, i) => i + 1);

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteUser = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteUser = () => {
        const token = localStorage.getItem('token');
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteUser/${deleteId}`,
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((response) => {
            if (response.data.success) {
                setAlert(false);
                setAlert2(true);
                setSelectedUser(null);
            }
        });
    }

    const getStatusBadge = (type) => {
        if (type === 'Student') return <span className="badge" style={{ backgroundColor: '#EBF2FF', color: themeColor, borderRadius: '6px', fontSize: '10px', fontWeight: '800', padding: '5px 10px' }}>STUDENT</span>;
        if (type === 'Alumni') return <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '6px', fontSize: '10px', fontWeight: '800', padding: '5px 10px' }}>ALUMNI</span>;
        return <span className="text-muted small">-</span>;
    };

    const formatDate = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-CA');
    };

    const formatYear = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return String(date.getFullYear());
    };

    const safeText = (value) => (value && String(value).trim() ? value : 'N/A');

    // Calculate count for Alumni
    const alumniCount = users.filter(u => u.type === 'Alumni').length;

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-content-wrapper">
                    <div className="directory-container">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 users-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/dashboard" className="users-breadcrumb-link">Home</Link></li>
                                        <li className="breadcrumb-item active">Member Directory</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header users-header">Member Directory</h1>
                            </div>
                            
                            {/* ALUMNI FILTER BUTTON */}
                            <div className="d-flex align-items-center">
                                <button 
                                    className={`btn shadow-sm d-flex align-items-center alumni-filter-btn ${filterType === 'Alumni' ? 'btn-primary' : 'btn-white'}`}
                                    onClick={() => setFilterType(filterType === 'Alumni' ? 'all' : 'Alumni')}
                                >
                                    <i className={`fa fa-graduation-cap mr-2 ${filterType === 'Alumni' ? 'text-white' : 'text-primary'}`}></i>
                                    {filterType === 'Alumni' ? 'Showing Alumni' : 'Show Alumni Only'}
                                    <span className={`badge ml-2 alumni-filter-count ${filterType === 'Alumni' ? 'alumni-filter-count-active' : ''}`}>
                                        {alumniCount}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm directory-card">
                            <div className="card-body p-0 bg-white">
                                <div className="p-4 d-flex flex-wrap align-items-center justify-content-between toolbar-container">
                                    <div className="input-group search-pill-container">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-light border-0 search-input-icon"><i className="fa fa-search text-muted"></i></span>
                                        </div>
                                        <input type="text" className="form-control border-0 bg-light search-input-modern" placeholder="Search by name or email address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="d-flex align-items-center mt-2 mt-md-0">
                                        <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                        <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold rows-select-modern" value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))}>
                                            {rows.map(v => <option key={v} value={v}>{v} Rows</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr className="users-table-head">
                                                <th className="border-0 pl-4 py-3 users-th users-th-id">ID</th>
                                                <th className="border-0 py-3 users-th users-th-profile">Profile</th>
                                                <th className="border-0 py-3 users-th users-th-name" onClick={() => requestSort('fname')}>Member Details {getSortIcon('fname')}</th>
                                                <th className="border-0 text-right pr-5 py-3 users-th users-th-category">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isTableLoading ? (
                                                <tr><td colSpan="4" className="text-center p-5"><div className="spinner-border text-primary"></div></td></tr>
                                            ) : currentUsers.length > 0 ? currentUsers.map((elem, index) => (
                                                <tr key={elem._id} className="table-user-row" onClick={() => setSelectedUser(elem)}>
                                                    <td className="pl-4 align-middle">
                                                        <span className="id-badge-soft">
                                                            {(indexOfFirstUser + index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <img src={getImageUrl(elem.profilepic, FALLBACK_IMAGES.profile)} alt='profile' className="rounded-circle user-avatar-img" onError={getImageOnError(FALLBACK_IMAGES.profile)} />
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="font-weight-bold text-dark mb-0 user-name-text">{elem.fname}</div>
                                                        <div className="user-email-text">{elem.email}</div>
                                                    </td>
                                                    <td className="align-middle text-right pr-5">{getStatusBadge(elem.type)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center p-5 text-muted">No members found matching your search.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-center table-footer">
                                    <p className="text-muted small mb-3 mb-md-0 font-weight-bold">Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, displayUsers.length)} of {displayUsers.length} total members</p>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light mr-2 pagination-btn" onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }}><i className="fa fa-chevron-left"></i></button>
                                            </li>
                                            {pageNumbers.map(num => (
                                                <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                    <button className={`page-link border-0 mx-1 shadow-none pagination-btn ${currentPage === num ? 'pagination-btn-active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrentPage(num); }}>{num}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light ml-2 pagination-btn" onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}><i className="fa fa-chevron-right"></i></button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedUser && (
                    <div className="modal fade show modal-backdrop-custom">
                        <div className="modal-dialog modal-dialog-centered user-modal-wide">
                            <div className="modal-content modal-content-premium">
                                <div className="modal-body p-0">
                                    <div className="user-modal-close">
                                        <button type="button" className="close user-modal-close-btn" onClick={() => setSelectedUser(null)} aria-label="Close">&times;</button>
                                    </div>
                                    <div className="user-modal-header">
                                        <div className="user-avatar-ring">
                                            <img
                                                src={getImageUrl(selectedUser.profilepic, FALLBACK_IMAGES.profile)}
                                                alt="profile"
                                                className="rounded-circle user-modal-avatar"
                                                onError={getImageOnError(FALLBACK_IMAGES.profile)}
                                            />
                                        </div>
                                        <h4 className="user-modal-name">{selectedUser.fname}</h4>
                                        <div className="user-modal-badge">{getStatusBadge(selectedUser.type)}</div>
                                    </div>
                                    <div className="user-modal-body">
                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Contact</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Email</small>
                                                    {selectedUser.email ? (
                                                        <a className="user-info-link" href={`mailto:${selectedUser.email}`}>
                                                            {selectedUser.email}
                                                        </a>
                                                    ) : (
                                                        <span className="user-info-value">N/A</span>
                                                    )}
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Phone</small>
                                                    <span className="user-info-value">{safeText(selectedUser.phone)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Academic Overview</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Start Year</small>
                                                    <span className="user-info-value">{formatYear(selectedUser.eduStart)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Graduation Year</small>
                                                    <span className="user-info-value user-info-accent">{formatYear(selectedUser.eduEnd)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Location</div>
                                            <div className="user-info-grid user-info-grid-3">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">City</small>
                                                    <span className="user-info-value">{safeText(selectedUser.city)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">State</small>
                                                    <span className="user-info-value">{safeText(selectedUser.state)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Country</small>
                                                    <span className="user-info-value">{safeText(selectedUser.nation)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Skills & Links</div>
                                            <div className="user-info-grid user-info-grid-stack">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">GitHub</small>
                                                    {selectedUser.github ? (
                                                        <a className="user-info-link" href={selectedUser.github} target="_blank" rel="noreferrer">
                                                            {selectedUser.github}
                                                        </a>
                                                    ) : (
                                                        <span className="user-info-value">N/A</span>
                                                    )}
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">LinkedIn</small>
                                                    {selectedUser.linkedin ? (
                                                        <a className="user-info-link" href={selectedUser.linkedin} target="_blank" rel="noreferrer">
                                                            {selectedUser.linkedin}
                                                        </a>
                                                    ) : (
                                                        <span className="user-info-value">N/A</span>
                                                    )}
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Portfolio</small>
                                                    {selectedUser.portfolioweb ? (
                                                        <a className="user-info-link" href={selectedUser.portfolioweb} target="_blank" rel="noreferrer">
                                                            {selectedUser.portfolioweb}
                                                        </a>
                                                    ) : (
                                                        <span className="user-info-value">N/A</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="user-modal-actions">
                                        <button type="button" className="btn btn-white font-weight-bold px-4 user-modal-btn-outline" onClick={() => setSelectedUser(null)}>Close Preview</button>
                                        <button type="button" className="btn btn-danger font-weight-bold px-4 shadow-sm user-modal-btn-danger" onClick={() => handleDeleteUser(selectedUser._id)}>Delete Account</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert warning show={alert} showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" cancelBtnBsStyle="light" title="Delete Member?" onConfirm={DeleteUser} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Successfully Removed" onConfirm={() => { setAlert2(false); getUsersData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    )
}

export default Users;
