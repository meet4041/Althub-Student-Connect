/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// COMPANY STANDARD: Import external CSS
import '../../styles/users.css';

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

    // Calculate count for Alumni
    const alumniCount = users.filter(u => u.type === 'Alumni').length;

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{
                    backgroundColor: '#F1F5F9',
                    minHeight: '100vh',
                }}>
                    <div style={{ padding: '25px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Member Directory</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>Member Directory</h1>
                            </div>
                            
                            {/* ALUMNI FILTER BUTTON */}
                            <div className="d-flex align-items-center">
                                <button 
                                    className={`btn shadow-sm d-flex align-items-center ${filterType === 'Alumni' ? 'btn-primary' : 'btn-white'}`}
                                    onClick={() => setFilterType(filterType === 'Alumni' ? 'all' : 'Alumni')}
                                    style={{ 
                                        borderRadius: '10px', 
                                        fontWeight: '700', 
                                        padding: '10px 20px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <i className={`fa fa-graduation-cap mr-2 ${filterType === 'Alumni' ? 'text-white' : 'text-primary'}`}></i>
                                    {filterType === 'Alumni' ? 'Showing Alumni' : 'Show Alumni Only'}
                                    <span className="badge ml-2" style={{ 
                                        backgroundColor: filterType === 'Alumni' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', 
                                        color: filterType === 'Alumni' ? '#fff' : '#64748B' 
                                    }}>
                                        {alumniCount}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm directory-card">
                            <div className="card-body p-0 bg-white">
                                <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <div className="input-group search-pill-container" style={{ maxWidth: '450px' }}>
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                        </div>
                                        <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search by name or email address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="d-flex align-items-center mt-2 mt-md-0">
                                        <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                        <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold" style={{ borderRadius: '6px', width: '110px', height: '38px', cursor: 'pointer' }} value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))}>
                                            {rows.map(v => <option key={v} value={v}>{v} Rows</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                <th className="border-0 pl-4 py-3" style={{ width: '80px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                                                <th className="border-0 py-3" style={{ width: '100px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile</th>
                                                <th className="border-0 py-3" onClick={() => requestSort('fname')} style={{ cursor: 'pointer', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Member Details {getSortIcon('fname')}</th>
                                                <th className="border-0 text-right pr-5 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isTableLoading ? (
                                                <tr><td colSpan="4" className="text-center p-5"><div className="spinner-border text-primary"></div></td></tr>
                                            ) : currentUsers.length > 0 ? currentUsers.map((elem, index) => (
                                                <tr key={elem._id} className="table-user-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(elem)}>
                                                    <td className="pl-4 align-middle">
                                                        <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: '700', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                                                            {(indexOfFirstUser + index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <img src={getImageUrl(elem.profilepic, FALLBACK_IMAGES.profile)} alt='profile' className="rounded-circle" style={{ width: '42px', height: '42px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onError={getImageOnError(FALLBACK_IMAGES.profile)} />
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="font-weight-bold text-dark mb-0" style={{ fontSize: '15px' }}>{elem.fname}</div>
                                                        <div style={{ color: '#64748B', fontSize: '12px', fontWeight: '500' }}>{elem.email}</div>
                                                    </td>
                                                    <td className="align-middle text-right pr-5">{getStatusBadge(elem.type)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center p-5 text-muted">No members found matching your search.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <p className="text-muted small mb-3 mb-md-0 font-weight-bold">Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, displayUsers.length)} of {displayUsers.length} total members</p>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light mr-2" onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }} style={{ borderRadius: '6px', color: themeColor, width: '36px', textAlign: 'center' }}><i className="fa fa-chevron-left"></i></button>
                                            </li>
                                            {pageNumbers.map(num => (
                                                <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                    <button className="page-link border-0 mx-1 shadow-none" onClick={(e) => { e.stopPropagation(); setCurrentPage(num); }} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px', width: '36px', fontWeight: 'bold' } : { backgroundColor: '#F8FAFC', color: '#64748B', borderRadius: '6px', width: '36px' }}>{num}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light ml-2" onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }} style={{ borderRadius: '6px', color: themeColor, width: '36px', textAlign: 'center' }}><i className="fa fa-chevron-right"></i></button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedUser && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                <div className="modal-body p-0">
                                    <div className="text-right p-3 position-absolute" style={{ right: 0, zIndex: 10 }}>
                                        <button type="button" className="close text-dark opacity-50" onClick={() => setSelectedUser(null)}>&times;</button>
                                    </div>
                                    <div className="p-5 text-center bg-white">
                                        <img src={getImageUrl(selectedUser.profilepic, FALLBACK_IMAGES.profile)} alt='profile' className="rounded-circle mb-3 shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '4px solid #F1F5F9' }} onError={getImageOnError(FALLBACK_IMAGES.profile)} />
                                        <h4 className="font-weight-bold mb-1" style={{ color: '#1E293B' }}>{selectedUser.fname}</h4>
                                        <div className="mb-4">{getStatusBadge(selectedUser.type)}</div>
                                        <div className="text-left bg-light p-4" style={{ borderRadius: '14px' }}>
                                            <div className="mb-3">
                                                <small className="text-muted d-block text-uppercase font-weight-bold" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '2px' }}>Personal Email</small>
                                                <span className="font-weight-bold" style={{ color: '#334155', fontSize: '13px' }}>{selectedUser.email}</span>
                                            </div>
                                            <div className="row">
                                                <div className="col-6">
                                                    <small className="text-muted d-block text-uppercase font-weight-bold" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '2px' }}>Graduation</small>
                                                    <span className="font-weight-bold" style={{ color: themeColor, fontSize: '13px' }}>{selectedUser.eduEnd || 'N/A'}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block text-uppercase font-weight-bold" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '2px' }}>Contact Number</small>
                                                    <span className="font-weight-bold" style={{ color: '#334155', fontSize: '13px' }}>{selectedUser.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-light d-flex justify-content-between">
                                        <button type="button" className="btn btn-white font-weight-bold px-4" style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #E2E8F0' }} onClick={() => setSelectedUser(null)}>Close Preview</button>
                                        <button type="button" className="btn btn-danger font-weight-bold px-4 shadow-sm" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={() => handleDeleteUser(selectedUser._id)}>Delete Account</button>
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