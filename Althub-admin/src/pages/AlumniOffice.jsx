/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../service/axios';
import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/feedback.css';
import '../styles/dashboard.css';

const AlumniOffice = () => {
    const [alumniStaff, setAlumniStaff] = useState([]);
    const [displayStaff, setDisplayStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const themeColor = '#2563EB';
    const navigate = useNavigate();

    const fetchData = () => {
        setLoading(true);
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        if (!id) {
            navigate('/login');
            return;
        }
        setInstitute_Id(id);
        setInstitute_Name(localStorage.getItem("AlmaPlus_institute_Name") || '');

        axiosInstance.get(`/api/getAlumniOfficeByInstitute/${id}`)
            .then((response) => {
                if (response.data.success) {
                    setAlumniStaff(response.data.data || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        const loader = document.getElementById('page-loader');
        const container = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (container) container.classList.add("show");
    }, []);

    useEffect(() => {
        const filtered = alumniStaff.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayStaff(filtered);
        setCurrentPage(1);
    }, [searchTerm, alumniStaff]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayStaff.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = Array.from({ length: Math.ceil(displayStaff.length / itemsPerPage) }, (_, i) => i + 1);

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content feedback-content-wrapper">
                    <div className="feedback-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Offices</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Alumni Office</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>
                                    <i className="fa fa-graduation-cap mr-2" style={{ color: themeColor }}></i>
                                    Alumni Office
                                </h1>
                                <p className="text-muted small mt-1 mb-0">Manage and view alumni office staff linked to {institute_Name}</p>
                            </div>
                            <span className="badge institute-badge text-white mt-3 mt-sm-0">
                                <i className="fa fa-university mr-2"></i> {institute_Name}
                            </span>
                        </div>

                        <div className="feedback-scroll-area">
                            <div className="card feedback-main-card">
                                <div className="card-body p-0 bg-white">
                                    <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <div className="input-group" style={{ maxWidth: '400px' }}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                        <span className="badge bg-light text-dark font-weight-bold">{displayStaff.length} staff</span>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                    <th className="border-0 pl-4 py-3" style={{ width: '60px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>#</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Name</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Email</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Phone</th>
                                                    <th className="border-0 py-3 text-center" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="5" className="text-center p-5"><div className="spinner-border" style={{ color: themeColor }}></div></td></tr>
                                                ) : currentItems.length > 0 ? currentItems.map((item, index) => (
                                                    <tr key={item._id} className="feedback-row">
                                                        <td className="pl-4 align-middle"><span className="feedback-id-badge">{(indexOfFirstItem + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td className="align-middle">
                                                            <div className="font-weight-bold text-dark" style={{ fontSize: '14px' }}>{item.name || '-'}</div>
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
                                                                <i className="fa fa-graduation-cap fa-3x text-muted mb-3"></i>
                                                                <p className="text-muted mb-0">No alumni office staff linked to this institute.</p>
                                                                <small className="text-muted">Alumni office accounts can be registered and linked during setup.</small>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {displayStaff.length > 0 && (
                                        <div className="p-4 bg-white d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                            <p className="text-muted small mb-0 font-weight-bold">Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, displayStaff.length)} of {displayStaff.length}</p>
                                            <nav>
                                                <ul className="pagination mb-0">
                                                    {pageNumbers.map(num => (
                                                        <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                            <button className="page-link border-0 mx-1" onClick={() => setCurrentPage(num)} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px' } : { backgroundColor: '#F8FAFC', color: themeColor, borderRadius: '6px' }}>{num}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </nav>
                                        </div>
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

export default AlumniOffice;
