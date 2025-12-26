import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from '../../baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axiosInstance from '../../services/axios';

const Institutes = () => {
    const [institutes, setInstitutes] = useState([]);
    const [displayInstitutes, setDisplayInstitutes] = useState([]);
    const rows = [10, 20, 30];
    const [institutesPerPage, setInstitutesPerPage] = useState(rows[0]);
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
        getInstitutesData();
    }, []);

    const getInstitutesData = () => {
        // 1. Get the token from storage
        const token = localStorage.getItem('token');

        // 2. Pass it in the Authorization header
        axiosInstance.get(`/api/getInstitutes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => {
            if (response.data.success === true) {
                setInstitutes(response.data.data);
            }
        }).catch(err => {
            console.error("Fetch error:", err);
            // Optional: Redirect to login if token is expired
            if (err.response && err.response.status === 401) {
                window.location.href = '/login';
            }
        });
    };

    useEffect(() => {
        setDisplayInstitutes(institutes);
    }, [institutes]);

    const indexOfLastInstitute = currentPage * institutesPerPage;
    const indexOfFirstInstitute = indexOfLastInstitute - institutesPerPage;
    const currentInstitutes = displayInstitutes.slice(indexOfFirstInstitute, indexOfLastInstitute);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayInstitutes.length / institutesPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setDisplayInstitutes(institutes.filter(
            (elem) =>
                elem.email.toLowerCase().includes(search) ||
                elem.name.toLowerCase().includes(search) ||
                (elem.address && elem.address.toLowerCase().includes(search))
        ));
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeletePrompt(true);
    }

    const executeDeletion = () => {
        axiosInstance.delete(`/api/deleteInstitute/${deleteId}`).then((response) => {
            if (response.data.success === true) {
                setShowDeletePrompt(false);
                setShowSuccessAlert(true);
                setDeleteId('');
                getInstitutesData();
            }
        }).catch(err => {
            setShowDeletePrompt(false);
            console.error("Deletion failed", err);
        });
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Institutes</li>
                    </ol>
                    <h1 className="page-header text-dark font-weight-bold">
                        Institutes <small>Manage institutional partners</small>
                    </h1>

                    <div className="card border-0 shadow-sm rounded-lg">
                        <div className="card-body">
                            {/* MODERN SEARCH BAR */}
                            <div className="input-group mb-4 shadow-sm" style={{ maxWidth: '400px' }}>
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-white border-right-0"><i className="fa fa-search text-muted"></i></span>
                                </div>
                                <input
                                    type="search"
                                    className="form-control border-left-0 shadow-none"
                                    placeholder='Search by Name, Email or Location...'
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-top-0">Sr.</th>
                                            <th className="border-top-0">Logo</th>
                                            <th className="border-top-0">Institute Name</th>
                                            <th className="border-top-0">Contact Info</th>
                                            <th className="border-top-0">Address</th>
                                            <th className="border-top-0 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentInstitutes.length > 0 ? currentInstitutes.map((elem, index) => (
                                            <tr key={index}>
                                                <td className="font-weight-bold text-muted">{indexOfFirstInstitute + index + 1}</td>
                                                <td>
                                                    <img
                                                        src={elem.image ? `${ALTHUB_API_URL}${elem.image}` : 'assets/img/login-bg/profile1.png'}
                                                        alt='Logo'
                                                        className="rounded shadow-sm border"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="font-weight-600 text-dark" style={{ fontSize: '15px' }}>{elem.name}</div>
                                                    {elem.website && (
                                                        <a href={elem.website.startsWith('http') ? elem.website : `https://${elem.website}`} target="_blank" rel="noreferrer" className="badge badge-soft-blue text-primary text-decoration-none mt-1">
                                                            <i className="fa fa-link mr-1"></i> Website
                                                        </a>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="small mb-1"><i className="fa fa-envelope text-muted mr-2"></i>{elem.email}</div>
                                                    <div className="small"><i className="fa fa-phone text-muted mr-2"></i>{elem.phone || 'N/A'}</div>
                                                </td>
                                                <td>
                                                    <div className="text-muted small" style={{ maxWidth: '200px', lineHeight: '1.4' }}>
                                                        {elem.address || 'Location not specified'}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-circle shadow-none"
                                                        onClick={() => handleDeleteClick(elem._id)}
                                                        title="Delete Institute"
                                                        style={{ width: '32px', height: '32px', padding: '0' }}
                                                    >
                                                        <i className='fa fa-trash-alt'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted font-italic">No institutions found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* MODERN PAGINATION SECTION */}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top">
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
                                    <small className="text-muted mr-2">Show:</small>
                                    <select
                                        className="custom-select custom-select-sm border-0 bg-transparent font-weight-bold shadow-none"
                                        style={{ width: 'auto', cursor: 'pointer' }}
                                        onChange={(e) => setInstitutesPerPage(Number(e.target.value))}
                                        value={institutesPerPage}
                                    >
                                        {rows.map(value => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOUBLE CONFIRMATION POPUPS */}
                {showDeletePrompt && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Confirm Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnText="Cancel"
                        title="Delete Institute?"
                        onConfirm={executeDeletion}
                        onCancel={() => { setShowDeletePrompt(false); setDeleteId(''); }}
                        focusCancelBtn
                    >
                        You are about to remove this institute. This action will delete all associated data permanently.
                    </SweetAlert>
                )}

                {showSuccessAlert && (
                    <SweetAlert success title="Success!" onConfirm={() => setShowSuccessAlert(false)}>
                        The institute has been successfully removed.
                    </SweetAlert>
                )}

                <Footer />
            </div>
        </Fragment>
    )
}

export default Institutes;