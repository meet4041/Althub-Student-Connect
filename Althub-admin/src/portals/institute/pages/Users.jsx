import { useAuth } from '../../../auth/session';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../../layouts/AppShell.jsx';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../../../utils/imageUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import axiosInstance from '../../../api/client';
import AdminPaginationFooter from '../../../components/admin/AdminPaginationFooter.jsx';
import AdminSearchBox from '../../../components/admin/AdminSearchBox.jsx';
import '../../../styles/users.css';

const Users = () => {
  const { user } = useAuth();

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
    
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const id = (user?._id);
        const name = (user?.name || '');
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
            method: "get",
            url: `/api/v1/institutes/${instituteKey}/users`,
        }).then((response) => {
            setUsers(response.data.success ? response.data.data : []);
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
            processedUsers = processedUsers.filter(user =>
                user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterType === 'Alumni') {
            processedUsers = processedUsers.filter(user => user.type === 'Alumni');
        }

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
    const hasUsers = displayUsers.length > 0;
    const showingFrom = hasUsers ? indexOfFirstUser + 1 : 0;
    const showingTo = hasUsers ? Math.min(indexOfLastUser, displayUsers.length) : 0;

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteUser = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteUser = () => {
        axiosInstance({
            method: "delete",
            url: `/api/v1/users/${deleteId}`,
        }).then((response) => {
            if (response.data.success) {
                setAlert(false);
                setAlert2(true);
                setSelectedUser(null);
            }
        });
    }

    const getStatusBadge = (type) => {
        if (type === 'Student') return <span className="admin-role-badge admin-role-student">STUDENT</span>;
        if (type === 'Alumni') return <span className="admin-role-badge admin-role-alumni">ALUMNI</span>;
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

    const alumniCount = users.filter(u => u.type === 'Alumni').length;

    return (
        <>
            <AppShell contentClassName="users-content-wrapper">
                    <div className="directory-container">
                        <div className="d-flex align-items-center justify-content-between mb-4 institute-page-header">
                            <div className="institute-page-header-copy">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 users-breadcrumb institute-page-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/dashboard" className="users-breadcrumb-link">Home</Link></li>
                                        <li className="breadcrumb-item active">Member Directory</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header users-header institute-page-title">Member Directory</h1>
                                <p className="institute-page-subtitle">Browse all students and alumni with the same structure used across institute tools.</p>
                            </div>
                            
                            <div className="d-flex align-items-center institute-page-actions">
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

                        <div className="admin-card directory-card">
                            <div className="card-body p-0 bg-white">
                                <div className="admin-toolbar toolbar-container">
                                    <AdminSearchBox
                                        value={searchTerm}
                                        placeholder="Search by name or email address..."
                                        onChange={setSearchTerm}
                                    />
                                    <div className="d-flex align-items-center mt-2 mt-md-0">
                                        <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                        <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold rows-select-modern" value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))}>
                                            {rows.map(v => <option key={v} value={v}>{v} Rows</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover admin-table">
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

                                <AdminPaginationFooter
                                    showingFrom={showingFrom}
                                    showingTo={showingTo}
                                    total={displayUsers.length}
                                    pageNumbers={pageNumbers}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                />
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

                <SweetAlert warning show={alert} showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" cancelBtnBsStyle="light" title="Delete Member?" onConfirm={DeleteUser} onCancel={() => setAlert(false)} />
                <SweetAlert success show={alert2} title="Successfully Removed" onConfirm={() => { setAlert2(false); getUsersData(); }} />
            </AppShell>
        </>
    )
}

export default Users;
