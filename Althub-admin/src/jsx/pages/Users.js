import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from '../../baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axiosInstance, { fetchSecureImage } from '../../services/axios'; 

// --- SecureImage Component ---
const SecureImage = ({ src, alt, className, style }) => {
    const [imgUrl, setImgUrl] = useState('assets/img/login-bg/profile1.png');

    useEffect(() => {
        let isMounted = true;
        
        if (src && src !== 'undefined' && src !== 'null') {
            // If it's a full URL or a relative path from API
            if (src.includes('/api/images/')) {
                fetchSecureImage(src).then(url => {
                    if (isMounted && url) setImgUrl(url);
                });
            } else {
                 setImgUrl(src);
            }
        }
        return () => { isMounted = false; };
    }, [src]);

    return <img src={imgUrl} alt={alt} className={className} style={style} />;
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    
    // Pagination state
    const rows = [10, 20, 30];
    const [usersPerPage, setUsersPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);

    // Deletion States
    const [deleteId, setDeleteId] = useState('');
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        var element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getUsersData();
    }, []);

    const getUsersData = () => {
        axiosInstance.get(`/api/getUsers`).then((response) => {
            if (response.data.success === true) {
                setUsers(response.data.data);
                setDisplayUsers(response.data.data);
            }
        }).catch(err => console.error("Fetch users error:", err));
    };

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        if (search) {
            setDisplayUsers(users.filter(
                (elem) =>
                    (elem.email && elem.email.toLowerCase().includes(search)) ||
                    (elem.fname && elem.fname.toLowerCase().includes(search)) ||
                    (elem.lname && elem.lname.toLowerCase().includes(search))
            ));
        } else {
            setDisplayUsers(users);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeletePrompt(true);
    };

    const executeDeletion = () => {
        axiosInstance.delete(`/api/deleteUser/${deleteId}`).then((response) => {
            if (response.data.success === true) {
                setShowDeletePrompt(false);
                setShowSuccessAlert(true);
                setDeleteId('');
                getUsersData();
            }
        }).catch(err => {
            setShowDeletePrompt(false);
            console.error(err);
        });
    };

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = displayUsers.slice(indexOfFirstUser, indexOfLastUser);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayUsers.length / usersPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Users</li>
                    </ol>
                    <h1 className="page-header text-dark font-weight-bold">
                        User Management <small>View and manage registered accounts</small>
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
                                    placeholder='Search by Name or Email...'
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-top-0">Sr.</th>
                                            <th className="border-top-0">Profile</th>
                                            <th className="border-top-0">Full Name</th>
                                            <th className="border-top-0">Email</th>
                                            <th className="border-top-0">User Type</th>
                                            <th className="border-top-0 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.length > 0 ? currentUsers.map((elem, index) => (
                                            <tr key={index}>
                                                <td className="font-weight-bold text-muted">{indexOfFirstUser + index + 1}</td>
                                                <td>
                                                    <SecureImage
                                                        src={elem.profilepic ? `${ALTHUB_API_URL}${elem.profilepic}` : ''}
                                                        alt='User'
                                                        className="rounded-circle shadow-sm border"
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="font-weight-600 text-dark">{elem.fname} {elem.lname || ''}</div>
                                                    <div className="text-muted small">
                                                        <i className="fa fa-phone fa-fw mr-1"></i>
                                                        {elem.phone ? elem.phone : 'No Contact'}
                                                    </div>
                                                </td>
                                                <td>{elem.email}</td>
                                                <td>
                                                    <span className={`badge ${elem.role === 'admin' ? 'badge-primary' : 'badge-info-transparent-2 text-info'}`}>
                                                        {elem.role || 'student'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-circle btn-icon"
                                                        onClick={() => handleDeleteClick(elem._id)}
                                                        title="Delete User"
                                                    >
                                                        <i className='fa fa-trash-alt'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted">No records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
                                <nav>
                                    <ul className="pagination mb-0">
                                        {pageNumbers.map((number) =>
                                            <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                                <button className="page-link shadow-none" onClick={() => setCurrentPage(number)}>{number}</button>
                                            </li>
                                        )}
                                    </ul>
                                </nav>
                                <div className="mt-3 mt-md-0 d-flex align-items-center bg-light px-3 py-2 rounded">
                                    <small className="text-muted mr-2">Rows per page:</small>
                                    <select
                                        className="custom-select custom-select-sm border-0 bg-transparent font-weight-bold shadow-none"
                                        style={{ width: 'auto', cursor: 'pointer' }}
                                        onChange={(e) => setUsersPerPage(Number(e.target.value))}
                                        value={usersPerPage}
                                    >
                                        {rows.map(value => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POPUPS */}
                {showDeletePrompt && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete user!"
                        confirmBtnBsStyle="danger"
                        cancelBtnText="Cancel"
                        cancelBtnBsStyle="default"
                        title="Delete this user?"
                        onConfirm={executeDeletion}
                        onCancel={() => { setShowDeletePrompt(false); setDeleteId(''); }}
                        focusCancelBtn
                    >
                        Are you sure you want to permanently delete this user? This cannot be undone.
                    </SweetAlert>
                )}

                {showSuccessAlert && (
                    <SweetAlert
                        success
                        title="Account Deleted"
                        onConfirm={() => setShowSuccessAlert(false)}
                    >
                        The user record has been removed successfully.
                    </SweetAlert>
                )}

                <Footer />
            </div>
        </Fragment>
    );
};

export default Users;