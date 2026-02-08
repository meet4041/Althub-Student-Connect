/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from '../baseURL.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// IMPORT NEW STYLES
import '../styles/users.css';

const Users = () => {
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
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getUsersData();
    }, []);

    const getUsersData = () => {
        setIsTableLoading(true);
        const token = localStorage.getItem('AlmaPlus_admin_Token'); // Using Admin Token
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getUsers`, 
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((response) => {
            setUsers(response.data.data || []);
            setIsTableLoading(false);
        }).catch(() => setIsTableLoading(false));
    };

    useEffect(() => {
        let processedUsers = [...users];
        if (searchTerm) {
            processedUsers = processedUsers.filter(user => 
                user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sortConfig.key === 'fname') {
            processedUsers.sort((a, b) => {
                let aValue = (a.fname || '').toLowerCase();
                let bValue = (b.fname || '').toLowerCase();
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
        if (sortConfig.key !== key) return <i className="fa fa-sort opacity-20 ml-2"></i>;
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
        setSelectedUser(null);
    }

    const DeleteUser = () => {
        const token = localStorage.getItem('AlmaPlus_admin_Token');
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteUser/${deleteId}`,
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((response) => {
            if (response.data.success) {
                setAlert(false);
                setAlert2(true);
            }
        });
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    
                    {/* Header Section */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                <li className="breadcrumb-item active">Student Directory</li>
                            </ol>
                            <h1 className="page-header mb-0">Manage Members</h1>
                        </div>
                    </div>

                    <div className="directory-card">
                        {/* Search & Filter */}
                        <div className="filter-bar">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <div className="search-input-group">
                                        <i className="fa fa-search"></i>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Search by name or email..." 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                    <label className="text-muted small font-weight-bold mr-2 mb-0">SHOWING</label>
                                    <select 
                                        className="custom-select custom-select-sm w-auto border-0 bg-light" 
                                        value={usersPerPage} 
                                        onChange={(e) => setUsersPerPage(Number(e.target.value))}
                                    >
                                        {rows.map(v => <option key={v} value={v}>{v} Users</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover user-table mb-0">
                                <thead>
                                    <tr>
                                        <th style={{width: '100px'}}>Photo</th>
                                        <th onClick={() => requestSort('fname')} style={{ cursor: 'pointer' }}>
                                            Full Name {getSortIcon('fname')}
                                        </th>
                                        <th className="text-center">Classification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isTableLoading ? (
                                        <tr><td colSpan="3" className="text-center py-5"><i className="fa fa-circle-notch fa-spin fa-2x text-primary"></i></td></tr>
                                    ) : currentUsers.length > 0 ? currentUsers.map((elem) => (
                                        <tr key={elem._id}>
                                            <td>
                                                <img 
                                                    src={elem.profilepic ? `${ALTHUB_API_URL}${elem.profilepic}` : 'assets/img/profile1.png'} 
                                                    className="user-avatar" 
                                                    alt='user'
                                                />
                                            </td>
                                            <td className="user-name-cell" onClick={() => setSelectedUser(elem)}>
                                                <span className="user-name-text">{elem.fname} {elem.lname}</span>
                                                <span className="user-subtext">{elem.email}</span>
                                            </td>
                                            <td className="text-center">
                                                {elem.type === 'Student' ? (
                                                    <span className="status-pill pill-student">Student</span>
                                                ) : elem.type === 'Alumni' ? (
                                                    <span className="status-pill pill-alumni">Alumni</span>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="text-center py-5 text-muted">No matching records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 d-flex justify-content-between align-items-center bg-white">
                            <span className="text-muted small">
                                Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, displayUsers.length)} of {displayUsers.length}
                            </span>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                                    </li>
                                    {pageNumbers.map(num => (
                                        <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(num)}>{num}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Profile Modal */}
                {selectedUser && (
                    <div className="modal fade show profile-modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg">
                                <div className="modal-header border-0">
                                    <button type="button" className="close" onClick={() => setSelectedUser(null)}>&times;</button>
                                </div>
                                <div className="modal-body px-5 pb-5">
                                    <div className="row">
                                        <div className="col-md-4 text-center border-right">
                                            <img 
                                                src={selectedUser.profilepic ? `${ALTHUB_API_URL}${selectedUser.profilepic}` : 'assets/img/profile1.png'} 
                                                className="modal-profile-img mb-3" 
                                                alt='profile'
                                            />
                                            <h4 className="font-weight-bold">{selectedUser.fname} {selectedUser.lname}</h4>
                                            <div className="mt-2">
                                                {selectedUser.type === 'Student' ? 
                                                    <span className="status-pill pill-student">Student Member</span> : 
                                                    <span className="status-pill pill-alumni">Alumni Member</span>
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-8 pl-md-5">
                                            <h6 className="font-weight-bold text-muted small mb-4">PERSONAL DETAILS</h6>
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Email Address</small>
                                                <span className="font-weight-bold">{selectedUser.email}</span>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Contact Number</small>
                                                <span>{selectedUser.phone || "Not Provided"}</span>
                                            </div>
                                            <div className="mb-4">
                                                <small className="text-muted d-block">Date of Birth</small>
                                                <span>{selectedUser.dob ? selectedUser.dob.split('T')[0] : "Not Provided"}</span>
                                            </div>

                                            <h6 className="font-weight-bold text-muted small mb-3">EDUCATION PERIOD</h6>
                                            <div className="d-flex gap-3">
                                                <div className="timeline-box mr-3">
                                                    <span className="timeline-label">COMMENCED</span>
                                                    <span className="timeline-date">{selectedUser.eduStart}</span>
                                                </div>
                                                <div className="timeline-box">
                                                    <span className="timeline-label">CONCLUDED</span>
                                                    <span className="timeline-date">{selectedUser.eduEnd}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button className="btn btn-link text-muted font-weight-bold" onClick={() => setSelectedUser(null)}>Close</button>
                                    <button className="btn btn-danger px-4 font-weight-bold" onClick={() => handleDeleteUser(selectedUser._id)}>
                                        <i className="fa fa-trash-alt mr-2"></i> Delete Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert
                    warning
                    show={alert}
                    showCancel
                    confirmBtnText="Confirm Delete"
                    confirmBtnBsStyle="danger"
                    title="Permanently Delete?"
                    onConfirm={DeleteUser}
                    onCancel={() => setAlert(false)}
                >
                    This action cannot be undone. User history will be wiped.
                </SweetAlert>

                <SweetAlert
                    success
                    show={alert2}
                    title="Record Deleted"
                    onConfirm={() => { setAlert2(false); getUsersData(); }}
                >
                    The student directory has been updated successfully.
                </SweetAlert>

                <Footer />
            </div>
        </Fragment>
    )
}

export default Users;