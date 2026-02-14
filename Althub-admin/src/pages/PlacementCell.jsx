import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axios';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';

// USING THE PREMIUM THEME
import '../styles/users.css';

const PlacementCell = () => {
    const [data, setData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [deleteId, setDeleteId] = useState('');
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        // Immediate UI reveal to stop infinite loading
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        // Unrestricted fetch of all placement cell records
        axiosInstance.get('/api/getPlacementCells')
            .then(res => {
                const results = res.data.data || [];
                setData(results);
                setDisplayData(results);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch Error:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const filtered = data.filter(item => 
            (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.institute && item.institute.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setDisplayData(filtered);
    }, [searchTerm, data]);

    const executeDelete = () => {
        axiosInstance.delete(`/api/deletePlacementCell/${deleteId}`)
            .then(() => {
                setShowDeletePrompt(false);
                setShowSuccessAlert(true);
                fetchData(); 
            }).catch(() => setShowDeletePrompt(false));
    };

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="page-header mb-1">Placement Governance</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                Global Registry: <span className="text-primary">{data.length}</span> Official Placement Nodes
                            </p>
                        </div>
                        <div className="search-input-group-modern" style={{ minWidth: '350px', borderColor:'#2563eb'}}>
                            <i className="fa fa-search"></i>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search Placement-Cell" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : (
                        <div className="row">
                            {displayData.length > 0 ? displayData.map((item) => (
                                <div key={item._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="inst-floating-card h-100">
                                        <div className="inst-card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="inst-icon-glow">
                                                    <i className="fa fa-briefcase"></i>
                                                </div>
                                                <button 
                                                    className="btn btn-light-danger btn-xs rounded-pill px-2" 
                                                    onClick={() => {setDeleteId(item._id); setShowDeletePrompt(true);}}
                                                >
                                                    <i className="fa fa-trash-alt text-danger"></i>
                                                </button>
                                            </div>

                                            <div className="mt-4">
                                                <h5 className="inst-title mb-1">{item.name}</h5>
                                                <p className="profile-email-sub mb-3">
                                                    <i className="fa fa-envelope-open mr-2"></i>{item.email}
                                                </p>
                                                
                                                <div className="inst-detail-grid">
                                                    <div className="detail-point full-width">
                                                        <label>Affiliated Institute</label>
                                                        <span className="text-primary font-weight-bold">
                                                            <i className="fa fa-university mr-2"></i>
                                                            {item.institute || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="detail-point">
                                                        <label>Direct Contact</label>
                                                        <span>{item.phone || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center py-5">
                                    <h4 className="text-muted font-weight-bold">No placement cells found in the registry.</h4>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showDeletePrompt && (
                    <SweetAlert warning showCancel confirmBtnText="Confirm" confirmBtnBsStyle="danger" title="Purge Record?" onConfirm={executeDelete} onCancel={() => setShowDeletePrompt(false)}>
                        Are you sure you want to remove this placement office?
                    </SweetAlert>
                )}

                {showSuccessAlert && (
                    <SweetAlert success title="Purged" onConfirm={() => setShowSuccessAlert(false)}>
                        Entry successfully removed.
                    </SweetAlert>
                )}
                
                <Footer />
            </div>
        </Fragment>
    );
};

export default PlacementCell;