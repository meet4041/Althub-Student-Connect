/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const Users = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    
    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);

    const rows = [10, 20, 30];
    const [usersPerPage, setUsersPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Theme constant
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
            setUsers(response.data.data || []);
            setIsTableLoading(false);
        }).catch(() => setIsTableLoading(false));
    };

    // Filter and Sort Logic
    useEffect(() => {
        let processedUsers = [...users];

        // 1. Filter
        if (searchTerm) {
            processedUsers = processedUsers.filter(user => 
                user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort (Name Only)
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
    }, [searchTerm, users, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="fa fa-sort text-muted ml-2" style={{ opacity: 0.3 }}></i>;
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

    // Triggered from inside the Modal
    const handleDeleteUser = (id) => {
        setDeleteId(id);
        setAlert(true);
        setSelectedUser(null); // Close modal when deleting
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
            }
        });
    }

    const getStatusBadge = (type) => {
        if (type === 'Student') return <span className="badge badge-pill badge-primary px-3 py-2">Student</span>;
        if (type === 'Alumni') return <span className="badge badge-pill badge-success px-3 py-2">Alumni</span>;
        return <span className="text-muted font-weight-bold" style={{fontSize: '16px'}}>-</span>;
    };

    // --- Detail Modal Functions ---
    const openUserDetails = (user) => {
        setSelectedUser(user);
    }

    const closeUserDetails = () => {
        setSelectedUser(null);
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                                <li className="breadcrumb-item active">Users</li>
                            </ol>
                            <h1 className="page-header mb-0">Member Directory</h1>
                        </div>
                        <Link to="/add-user" className="btn btn-primary btn-lg shadow-sm" 
                              style={{borderRadius: '8px', backgroundColor: themeColor, borderColor: themeColor}}>
                            <i className="fa fa-user-plus mr-2"></i> Add New User
                        </Link>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-0">
                            {/* Search & Filter Bar */}
                            <div className="p-4 border-bottom bg-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-light border rounded-pill px-3 py-1 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                        <span className="text-muted mr-2">Show</span>
                                        <select className="custom-select custom-select-sm w-auto border-0 shadow-sm" style={{borderRadius: '5px'}} value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))}>
                                            {rows.map(v => <option key={v} value={v}>{v} Users</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{backgroundColor: '#F1F5F9', color: '#334155'}}>
                                        <tr>
                                            <th className="border-0 pl-4" style={{width: '100px'}}>Avatar</th>
                                            <th className="border-0" 
                                                onClick={() => requestSort('fname')} 
                                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                                title="Sort by Name">
                                                Username {getSortIcon('fname')}
                                            </th>
                                            <th className="border-0 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isTableLoading ? (
                                            <tr><td colSpan="3" className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x" style={{color: themeColor}}></i></td></tr>
                                        ) : currentUsers.length > 0 ? currentUsers.map((elem, index) => (
                                            <tr key={elem._id}>
                                                {/* 1. Avatar */}
                                                <td className="pl-4 align-middle">
                                                    <img 
                                                        src={elem.profilepic ? `${ALTHUB_API_URL}${elem.profilepic}` : 'assets/img/profile1.png'} 
                                                        alt='profile' 
                                                        className="rounded-circle shadow-sm" 
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #fff' }} 
                                                    />
                                                </td>
                                                
                                                {/* 2. Username (Clickable) */}
                                                <td className="align-middle">
                                                    <div 
                                                        onClick={() => openUserDetails(elem)}
                                                        className="font-weight-bold text-dark" 
                                                        style={{ cursor: 'pointer', fontSize: '15px' }}
                                                        onMouseOver={(e) => e.currentTarget.style.color = themeColor}
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#2d353c'}
                                                    >
                                                        {elem.fname}
                                                    </div>
                                                    <small className="text-muted">Click to view details</small>
                                                </td>

                                                {/* 3. Status */}
                                                <td className="align-middle text-center">
                                                    {getStatusBadge(elem.type)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center p-5 text-muted">No members found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">
                                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, displayUsers.length)} of {displayUsers.length} users
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)} style={{color: themeColor}}>Previous</button>
                                        </li>
                                        {pageNumbers.map(num => (
                                            <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setCurrentPage(num)}
                                                    style={currentPage === num ? {backgroundColor: themeColor, borderColor: themeColor} : {color: themeColor}}
                                                >
                                                    {num}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)} style={{color: themeColor}}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- USER DETAILS MODAL --- */}
                {selectedUser && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '15px'}}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title font-weight-bold ml-2 mt-2">Member Profile</h5>
                                    <button type="button" className="close" onClick={closeUserDetails} style={{outline: 'none'}}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row align-items-center mb-4">
                                        <div className="col-md-4 text-center border-right">
                                            <img 
                                                src={selectedUser.profilepic ? `${ALTHUB_API_URL}${selectedUser.profilepic}` : 'assets/img/profile1.png'} 
                                                alt='profile' 
                                                className="rounded-circle shadow mb-3" 
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                                            />
                                            <h4 className="mb-1 font-weight-bold text-dark">{selectedUser.fname}</h4>
                                            <div className="mb-2">{getStatusBadge(selectedUser.type)}</div>
                                        </div>
                                        <div className="col-md-8 pl-md-4 mt-3 mt-md-0">
                                            <h6 className="text-uppercase text-muted small font-weight-bold mb-3" style={{letterSpacing: '1px'}}>Contact & Personal Info</h6>
                                            <div className="row mb-3">
                                                <div className="col-sm-4 text-muted"><i className="far fa-envelope mr-2"></i> Email:</div>
                                                <div className="col-sm-8 text-dark font-weight-bold">{selectedUser.email}</div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-sm-4 text-muted"><i className="fa fa-phone mr-2"></i> Phone:</div>
                                                <div className="col-sm-8 text-dark">{selectedUser.phone || <span className="text-muted">-</span>}</div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-sm-4 text-muted"><i className="fa fa-birthday-cake mr-2"></i> DOB:</div>
                                                <div className="col-sm-8 text-dark">{selectedUser.dob ? selectedUser.dob.split('T')[0] : <span className="text-muted">-</span>}</div>
                                            </div>
                                            
                                            <hr className="my-4" />
                                            
                                            <h6 className="text-uppercase text-muted small font-weight-bold mb-3" style={{letterSpacing: '1px'}}>Education Timeline</h6>
                                            <div className="d-flex align-items-center">
                                                <div className="p-3 rounded bg-light mr-3 text-center" style={{minWidth: '100px'}}>
                                                    <small className="d-block text-muted">Start Date</small>
                                                    <strong style={{color: themeColor}}>{selectedUser.eduStart}</strong>
                                                </div>
                                                <i className="fa fa-arrow-right text-muted"></i>
                                                <div className="p-3 rounded bg-light ml-3 text-center" style={{minWidth: '100px'}}>
                                                    <small className="d-block text-muted">End Date</small>
                                                    <strong style={{color: themeColor}}>{selectedUser.eduEnd}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0" style={{borderRadius: '0 0 15px 15px'}}>
                                    <button type="button" className="btn btn-white shadow-sm font-weight-bold" onClick={closeUserDetails}>Close</button>
                                    <button type="button" className="btn btn-danger shadow-sm font-weight-bold ml-2" onClick={() => handleDeleteUser(selectedUser._id)}>
                                        <i className="fa fa-trash-alt mr-2"></i> Delete User
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
                    confirmBtnText="Yes, delete it!"
                    confirmBtnBsStyle="danger"
                    title="Remove User?"
                    onConfirm={DeleteUser}
                    onCancel={() => setAlert(false)}
                >
                    All data associated with this user will be permanently removed.
                </SweetAlert>

                <SweetAlert
                    success
                    show={alert2}
                    title="User Removed"
                    onConfirm={() => { setAlert2(false); getUsersData(); }}
                >
                    The member directory has been updated.
                </SweetAlert>
                <Footer />
            </div>
        </Fragment>
    )
}

export default Users;