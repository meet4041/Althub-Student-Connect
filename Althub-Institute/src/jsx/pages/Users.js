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
    
    const rows = [10, 20, 30];
    const [usersPerPage, setUsersPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        const filtered = users.filter(user => 
            user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayUsers(filtered);
        setCurrentPage(1);
    }, [searchTerm, users]);

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
            }
        });
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                <li className="breadcrumb-item active">Users</li>
                            </ol>
                            <h1 className="page-header mb-0">Member Directory</h1>
                        </div>
                        <Link to="/add-user" className="btn btn-success btn-lg shadow-sm" style={{borderRadius: '8px'}}>
                            <i className="fa fa-user-plus mr-2"></i> Add New User
                        </Link>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-0">
                            {/* Search & Filter Bar */}
                            <div className="p-4 border-bottom bg-light-lighter" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-white border rounded-pill px-3 py-1 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                    <thead className="bg-light text-dark">
                                        <tr>
                                            <th className="border-0 pl-4">ID</th>
                                            <th className="border-0">User Profile</th>
                                            <th className="border-0">Contact Information</th>
                                            <th className="border-0 text-center">DOB</th>
                                            <th className="border-0 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isTableLoading ? (
                                            <tr><td colSpan="5" className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x text-success"></i></td></tr>
                                        ) : currentUsers.length > 0 ? currentUsers.map((elem, index) => (
                                            <tr key={elem._id}>
                                                <td className="pl-4 align-middle text-muted" style={{fontSize: '12px'}}>{indexOfFirstUser + index + 1}</td>
                                                <td className="align-middle">
                                                    <div className="d-flex align-items-center">
                                                        <img 
                                                            src={elem.profilepic ? `${ALTHUB_API_URL}${elem.profilepic}` : 'assets/img/profile1.png'} 
                                                            alt='profile' 
                                                            className="rounded-circle shadow-sm mr-3" 
                                                            style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #fff' }} 
                                                        />
                                                        <div>
                                                            <div className="font-weight-bold text-dark">{elem.fname}</div>
                                                            <small className="text-success">Verified Member</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="align-middle">
                                                    <div className="text-dark"><i className="far fa-envelope mr-2 text-muted"></i>{elem.email}</div>
                                                    {elem.phone && <div className="small text-muted"><i className="fa fa-phone mr-2"></i>{elem.phone}</div>}
                                                </td>
                                                <td className="align-middle text-center">
                                                    <span className="badge badge-light p-2 font-weight-normal">
                                                        {elem.dob ? elem.dob.split('T')[0] : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm mr-2" title="Edit">
                                                        <i className="fa fa-pencil-alt text-blue"></i>
                                                    </button>
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm" onClick={() => handleDeleteUser(elem._id)} title="Delete">
                                                        <i className="fa fa-trash-alt text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center p-5 text-muted">No members found match your search criteria.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Custom Pagination Footer */}
                            <div className="p-4 bg-light-lighter d-flex justify-content-between align-items-center" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">
                                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, displayUsers.length)} of {displayUsers.length} users
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
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
                </div>

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