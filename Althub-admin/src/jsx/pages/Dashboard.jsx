import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import axiosInstance from '../../services/axios'; 

// IMPORT UPDATED BLUE THEME STYLES
import '../styles/dashboard.css';

function Dashboard() {        
    const [counts, setCounts] = useState({
        users: 0,
        institutes: 0,
        feedback: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDashboard = async () => {
            // Bypass template loader lag
            if (document.getElementById('page-loader')) {
                document.getElementById('page-loader').style.display = 'none';
            }
            
            setLoading(true);
            try {
                const element = document.getElementById("page-container");
                if (element) element.classList.add("show");
                
                // Fetch all data in parallel for maximum speed
                const [uRes, iRes, fRes] = await Promise.all([
                    axiosInstance.get(`/api/getUsers`),
                    axiosInstance.get(`/api/getInstitutes`),
                    axiosInstance.get(`/api/getFeedback`)
                ]);

                setCounts({
                    users: uRes?.data?.data?.length || 0,
                    institutes: iRes?.data?.data?.length || 0,
                    feedback: fRes?.data?.data?.length || 0
                });
            } catch (err) {
                console.error('Dashboard error:', err);
                if(err.response?.status !== 401) {
                    setError("Communication with server failed.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        initDashboard();
    }, []);

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                
                <div id="content" className="content dashboard-wrapper">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="dashboard-title">System Overview</h1>
                            <span className="dashboard-subtitle text-muted">Administrative Control & Analytics</span>
                        </div>
                        <nav>
                            <ol className="breadcrumb bg-transparent p-0 m-0">
                                <li className="breadcrumb-item"><Link to="/dashboard" className="text-primary">Dashboard</Link></li>
                                <li className="breadcrumb-item active">Admin</li>
                            </ol>
                        </nav>
                    </div>

                    {loading ? (
                        <div className="d-flex align-items-center justify-content-center" style={{minHeight: '50vh'}}>
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary"></i>
                        </div>
                    ) : (
                        <Fragment>
                            {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

                            <div className="stats-grid">
                                {/* USERS CARD */}
                                <div className="stat-card bg-users">
                                    <i className="fa fa-user-graduate card-icon"></i>
                                    <div className="card-label">Verified Members</div>
                                    <div className="card-value">{counts.users.toLocaleString()}</div>
                                    <Link to="/users" className="card-footer-link">
                                        Directory Management <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                                {/* INSTITUTES CARD */}
                                <div className="stat-card bg-institutes">
                                    <i className="fa fa-university card-icon"></i>
                                    <div className="card-label">Active Institutes</div>
                                    <div className="card-value">{counts.institutes.toLocaleString()}</div>
                                    <Link to="/institute" className="card-footer-link">
                                        Campus Governance <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                                {/* FEEDBACK CARD */}
                                {/* <div className="stat-card bg-feedback">
                                    <i className="fa fa-star card-icon"></i>
                                    <div className="card-label">User Feedback</div>
                                    <div className="card-value">{counts.feedback.toLocaleString()}</div>
                                    <Link to="/feedback" className="card-footer-link">
                                        Review Analytics <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div> */}
                            </div>

                            <div className="info-panel mt-5">
                                <h5 className="info-title">Administrative Insight</h5>
                                <p className="info-text mb-0">
                                    You are currently overseeing <strong>{counts.users + counts.institutes}</strong> active entities within the Althub ecosystem. 
                                    All system modules are operational, and the database synchronization is up to date.
                                </p>
                            </div>
                        </Fragment>
                    )}
                </div>
                <Footer />
            </div>
        </Fragment>
    );
}

export default Dashboard;