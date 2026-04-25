/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../../layouts/Loader.jsx';
import Menu from '../../../layouts/Menu.jsx';
import Footer from '../../../layouts/Footer.jsx';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../../../utils/imageUtils';
import axiosInstance from '../../../service/axios';

import '../../../styles/alumni-pages.css';
import '../../../styles/users.css';

const AlumniMembers = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
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

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById('page-container');
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add('show');

        const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
        const parentInstituteId = userDetails.parent_institute_id;
        const id = parentInstituteId || localStorage.getItem('AlmaPlus_institute_Id');
        const name = localStorage.getItem('AlmaPlus_institute_Name');
        setInstitute_Id(id);
        setInstitute_Name(name);
    }, []);

    useEffect(() => {
        if (institute_Id || institute_Name) getUsersData();
    }, [institute_Id, institute_Name]);

    const getUsersData = () => {
        setIsTableLoading(true);
        const instituteKey = institute_Id || institute_Name;
        if (!instituteKey) {
            setUsers([]);
            setDisplayUsers([]);
            setIsTableLoading(false);
            return;
        }

        axiosInstance({
            method: 'get',
            url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${instituteKey}`,
        }).then((response) => {
            const fetchedUsers = response.data.success ? response.data.data : [];
            const alumniOnly = fetchedUsers.filter((user) => user.type === 'Alumni');
            setUsers(alumniOnly);
            setIsTableLoading(false);
        }).catch(() => {
            setUsers([]);
            setDisplayUsers([]);
            setIsTableLoading(false);
        });
    };

    useEffect(() => {
        let processedUsers = [...users];

        if (searchTerm) {
            processedUsers = processedUsers.filter((user) =>
                user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortConfig.key === 'fname') {
            processedUsers.sort((a, b) => {
                const aValue = a.fname ? a.fname.toLowerCase() : '';
                const bValue = b.fname ? b.fname.toLowerCase() : '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setDisplayUsers(processedUsers);
        setCurrentPage(1);
    }, [searchTerm, users, sortConfig]);

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
    const hasUsers = displayUsers.length > 0;
    const showingFrom = hasUsers ? indexOfFirstUser + 1 : 0;
    const showingTo = hasUsers ? Math.min(indexOfLastUser, displayUsers.length) : 0;

    const getStatusBadge = (type) => {
        if (type === 'Student') return <span className="badge" style={{ backgroundColor: '#EBF2FF', color: '#2563EB', borderRadius: '6px', fontSize: '10px', fontWeight: '800', padding: '5px 10px' }}>STUDENT</span>;
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

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-content-wrapper">
                    <div className="directory-container">
                        <div className="d-flex align-items-center justify-content-between mb-4 institute-page-header">
                            <div className="institute-page-header-copy">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 users-breadcrumb institute-page-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/dashboard" className="users-breadcrumb-link">Home</Link></li>
                                        <li className="breadcrumb-item active">Alumni Members</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header users-header institute-page-title">Alumni Members</h1>
                                <p className="institute-page-subtitle">Browse all members with the same structure used in the institute manage students page.</p>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm directory-card">
                            <div className="card-body p-0 bg-white">
                                <div className="p-4 d-flex flex-wrap align-items-center justify-content-between toolbar-container institute-page-toolbar">
                                    <div className="input-group search-pill-container">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-light border-0 search-input-icon"><i className="fa fa-search text-muted"></i></span>
                                        </div>
                                        <input type="text" className="form-control border-0 bg-light search-input-modern" placeholder="Search by name or email address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="d-flex align-items-center mt-2 mt-md-0">
                                        <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                        <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold rows-select-modern" value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))}>
                                            {rows.map((v) => <option key={v} value={v}>{v} Rows</option>)}
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
                                                        <img src={getImageUrl(elem.profilepic, FALLBACK_IMAGES.profile)} alt="profile" className="rounded-circle user-avatar-img" onError={getImageOnError(FALLBACK_IMAGES.profile)} />
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

                                <div className="p-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-center table-footer institute-page-footer">
                                    <p className="text-muted small mb-3 mb-md-0 font-weight-bold institute-page-count">Showing {showingFrom} - {showingTo} of {displayUsers.length} total members</p>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light mr-2 pagination-btn" disabled={currentPage === 1} onClick={(e) => { e.stopPropagation(); setCurrentPage((prev) => Math.max(1, prev - 1)); }}><i className="fa fa-chevron-left"></i></button>
                                            </li>
                                            {pageNumbers.map((num) => (
                                                <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                    <button className={`page-link border-0 mx-1 shadow-none pagination-btn ${currentPage === num ? 'pagination-btn-active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrentPage(num); }}>{num}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === pageNumbers.length || !pageNumbers.length ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light ml-2 pagination-btn" disabled={currentPage === pageNumbers.length || !pageNumbers.length} onClick={(e) => { e.stopPropagation(); setCurrentPage((prev) => Math.min(pageNumbers.length, prev + 1)); }}><i className="fa fa-chevron-right"></i></button>
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
                                            <div className="user-info-section-title">Personal Information</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">First Name</small>
                                                    <span className="user-info-value">{safeText(selectedUser.fname)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Last Name</small>
                                                    <span className="user-info-value">{safeText(selectedUser.lname)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Gender</small>
                                                    <span className="user-info-value">{safeText(selectedUser.gender)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Date of Birth</small>
                                                    <span className="user-info-value">{formatDate(selectedUser.dob)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Contact & Location</div>
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
                                                <div className="user-info-item">
                                                    <small className="user-info-label">City</small>
                                                    <span className="user-info-value">{safeText(selectedUser.city)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">State</small>
                                                    <span className="user-info-value">{safeText(selectedUser.state)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Academic & Profile</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Role</small>
                                                    <span className="user-info-value">{safeText(selectedUser.type)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Institute</small>
                                                    <span className="user-info-value">{safeText(selectedUser.institute)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Education Start</small>
                                                    <span className="user-info-value">{formatYear(selectedUser.eduStart)}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Education End</small>
                                                    <span className="user-info-value user-info-accent">{formatYear(selectedUser.eduEnd)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-modal-actions">
                                        <button type="button" className="btn btn-white font-weight-bold px-4 user-modal-btn-outline" onClick={() => setSelectedUser(null)}>Close</button>
                                    </div>
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

export default AlumniMembers;
