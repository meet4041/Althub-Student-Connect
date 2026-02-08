import React, { useState, useEffect, Fragment } from 'react';
import axiosInstance from '../../services/axios';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from '../baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';

// RE-USING PREMIUM THEME STYLES
import '../styles/users.css'; 

const Institutes = () => {
    const [institutes, setInstitutes] = useState([]);
    const [displayInstitutes, setDisplayInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Deletion States
    const [deleteId, setDeleteId] = useState('');
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        if (document.getElementById('page-loader')) document.getElementById('page-loader').style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getInstitutesData();
    }, []);

    const getInstitutesData = () => {
        setLoading(true);
        axiosInstance.get(`/api/getInstitutes`)
            .then((response) => {
                if (response.data.success === true) {
                    setInstitutes(response.data.data);
                    setDisplayInstitutes(response.data.data);
                }
                setLoading(false);
            }).catch(err => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setSearchTerm(search);
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
                getInstitutesData();
            }
        }).catch(() => setShowDeletePrompt(false));
    }

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    
                    {/* DIRECTORY HEADER */}
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <div>
                            <h1 className="page-header mb-1">Institutional Registry</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                Global Directory of <span className="text-primary">{institutes.length}</span> Partner Campuses
                            </p>
                        </div>
                        <div className="search-input-group-modern" style={{ minWidth: '350px' }}>
                            <i className="fa fa-search"></i>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search Institute" 
                                value={searchTerm}
                                onChange={handleSearch} 
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : (
                        <div className="row">
                            {displayInstitutes.length > 0 ? displayInstitutes.map((inst) => (
                                <div key={inst._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="inst-floating-card h-100">
                                        <div className="inst-card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="profile-squircle" style={{ width: '65px', height: '65px' }}>
                                                    <img 
                                                        src={inst.image ? `${ALTHUB_API_URL}${inst.image}` : 'assets/img/login-bg/profile1.png'} 
                                                        alt='Campus Logo'
                                                        className="w-100 h-100 object-fit-cover rounded"
                                                    />
                                                </div>
                                                <div className="d-flex flex-column align-items-end">
                                                    <span className="badge-primary-soft mb-2">Verified</span>
                                                    <button 
                                                        className="btn btn-light-danger btn-xs rounded-pill px-2"
                                                        onClick={() => handleDeleteClick(inst._id)}
                                                    >
                                                        <i className="fa fa-trash-alt text-danger"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h5 className="inst-title mb-1">{inst.name}</h5>
                                                <p className="profile-email-sub mb-3"><i className="fa fa-envelope-open mr-2"></i>{inst.email}</p>
                                                
                                                <div className="inst-detail-grid">
                                                    <div className="detail-point">
                                                        <label>Primary Contact</label>
                                                        <span>{inst.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-point">
                                                        <label>Digital Presence</label>
                                                        {inst.website ? (
                                                            <a href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`} target="_blank" rel="noreferrer" className="text-primary font-weight-bold">
                                                                Visit Site <i className="fa fa-external-link-alt ml-1" style={{fontSize: '10px'}}></i>
                                                            </a>
                                                        ) : <span>N/A</span>}
                                                    </div>
                                                </div>
                                                
                                                <div className="timeline-badge mt-3 w-100">
                                                    <i className="fa fa-map-marker-alt mr-2 text-primary"></i>
                                                    {inst.address || 'Global/Remote Campus'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center py-5">
                                    <h4 className="text-muted">No records found in the directory.</h4>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* DELETE CONFIRMATION */}
                {showDeletePrompt && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Remove Record"
                        confirmBtnBsStyle="danger"
                        cancelBtnText="Cancel"
                        title="Remove from Registry?"
                        onConfirm={executeDeletion}
                        onCancel={() => setShowDeletePrompt(false)}
                    >
                        Are you sure you want to remove this institution from the Althub directory?
                    </SweetAlert>
                )}

                {showSuccessAlert && (
                    <SweetAlert success title="Success" onConfirm={() => setShowSuccessAlert(false)}>
                        The institution has been removed.
                    </SweetAlert>
                )}

                <Footer />
            </div>
        </Fragment>
    )
}

export default Institutes;