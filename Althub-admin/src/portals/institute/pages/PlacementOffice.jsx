import { useAuth } from '../../../auth/session';
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/client';
import Loader from '../../../layouts/Loader.jsx';
import Menu from '../../../layouts/Menu.jsx';
import Footer from '../../../layouts/Footer.jsx';
import AdminPaginationFooter from '../../../components/admin/AdminPaginationFooter.jsx';
import AdminSearchBox from '../../../components/admin/AdminSearchBox.jsx';

import '../../../styles/feedback.css';
import '../../../styles/dashboard.css';

const PlacementOffice = () => {
  const { user, logout } = useAuth();
  const userDetails = user || {};

    const [placementStaff, setPlacementStaff] = useState([]);
    const [displayStaff, setDisplayStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [institute_Name, setInstitute_Name] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();

    const fetchData = () => {
        setLoading(true);
        const id = (user?._id);
        if (!id) {
            navigate('/login', { replace: true });
            return;
        }
        setInstitute_Name((user?.name || '') || '');

        axiosInstance.get(`/api/getPlacementCellByInstitute/${id}`)
            .then((response) => {
                if (response.data.success) {
                    setPlacementStaff(response.data.data || []);
                }
                setLoading(false);
            })
            .catch(() => {
                setPlacementStaff([]);
                setDisplayStaff([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
        const loader = document.getElementById('page-loader');
        const container = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (container) container.classList.add("show");
    }, []);

    useEffect(() => {
        const filtered = placementStaff.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayStaff(filtered);
        setCurrentPage(1);
    }, [searchTerm, placementStaff]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayStaff.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = Array.from({ length: Math.ceil(displayStaff.length / itemsPerPage) }, (_, i) => i + 1);
    const hasStaff = displayStaff.length > 0;
    const showingFrom = hasStaff ? indexOfFirstItem + 1 : 0;
    const showingTo = hasStaff ? Math.min(indexOfLastItem, displayStaff.length) : 0;

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content feedback-content-wrapper">
                    <div className="feedback-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4 institute-page-header">
                            <div className="institute-page-header-copy">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 institute-page-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                                        <li className="breadcrumb-item"><Link to="/dashboard">Offices</Link></li>
                                        <li className="breadcrumb-item active">Placement Office</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0 institute-page-title">Placement Office</h1>
                                <p className="text-muted small mt-1 mb-0 institute-page-subtitle">Manage and view placement cell staff linked to {institute_Name}.</p>
                            </div>
                            <span className="badge institute-badge text-white institute-page-actions">
                                <i className="fa fa-university mr-2"></i> {institute_Name}
                            </span>
                        </div>

                        <div className="feedback-scroll-area">
                            <div className="admin-card feedback-main-card">
                                <div className="card-body p-0 bg-white">
                                    <div className="admin-toolbar">
                                        <AdminSearchBox
                                            value={searchTerm}
                                            onChange={setSearchTerm}
                                            placeholder="Search by name, email, or phone..."
                                        />
                                        <span className="badge bg-light text-dark font-weight-bold institute-page-count">{displayStaff.length} staff</span>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover admin-table">
                                            <thead>
                                                <tr>
                                                    <th className="pl-4 admin-id-col">#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th className="text-center admin-status-col">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="5" className="text-center p-5"><div className="spinner-border text-primary"></div></td></tr>
                                                ) : currentItems.length > 0 ? currentItems.map((item, index) => (
                                                    <tr key={item._id} className="feedback-row">
                                                        <td className="pl-4 align-middle"><span className="feedback-id-badge">{(indexOfFirstItem + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td className="align-middle">
                                                            <div className="font-weight-bold text-dark admin-name-cell-sm">{item.name || '-'}</div>
                                                        </td>
                                                        <td className="align-middle">
                                                            <a href={`mailto:${item.email}`} className="text-primary">{item.email || '-'}</a>
                                                        </td>
                                                        <td className="align-middle">{item.phone || '-'}</td>
                                                        <td className="align-middle text-center">
                                                            <span className={`badge ${item.active ? 'bg-success' : 'bg-secondary'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center p-5">
                                                            <div className="py-4">
                                                                <i className="fa fa-briefcase fa-3x text-muted mb-3"></i>
                                                                <p className="text-muted mb-0">No placement office staff linked to this institute.</p>
                                                                <small className="text-muted">Placement cell accounts can be registered and linked during setup.</small>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {displayStaff.length > 0 && (
                                        <AdminPaginationFooter
                                            showingFrom={showingFrom}
                                            showingTo={showingTo}
                                            total={displayStaff.length}
                                            pageNumbers={pageNumbers}
                                            currentPage={currentPage}
                                            onPageChange={setCurrentPage}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default PlacementOffice;
