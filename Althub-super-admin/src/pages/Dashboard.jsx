import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../layouts/AppShell.jsx';
import axiosInstance from '../api/client';

import '../styles/dashboard.css';

function Dashboard() {
    const [counts, setCounts] = useState({
        users: 0,
        institutes: 0,
        alumniOffices: 0,
        placementCells: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            try {
                const [uRes, iRes, aRes, pRes] = await Promise.all([
                    axiosInstance.get(`/api/v1/users`),
                    axiosInstance.get(`/api/getInstitutes`),
                    axiosInstance.get(`/api/getAlumniOffices`),
                    axiosInstance.get(`/api/getPlacementCells`)
                ]);

                setCounts({
                    users: uRes?.data?.data?.length || 0,
                    institutes: iRes?.data?.data?.length || 0,
                    alumniOffices: aRes?.data?.data?.length || 0,
                    placementCells: pRes?.data?.data?.length || 0
                });
            } catch (err) {
                console.error('Dashboard error:', err);
                if (err.response?.status !== 401) {
                    setError("Communication with server failed.");
                }
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, []);

    return (
        <AppShell contentClassName="dashboard-wrapper">
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
                        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary"></i>
                        </div>
                    ) : (
                        <Fragment>
                            {error && <div className="alert alert-danger border-0 shadow-sm mb-4">{error}</div>}

                            <div className="stats-grid">
                                <div className="stat-card bg-users">
                                    <i className="fa fa-user-graduate card-icon"></i>
                                    <div className="card-label">Total Verified Members</div>
                                    <div className="card-value">{counts.users.toLocaleString()}</div>
                                    <Link to="/users" className="card-footer-link">
                                        Directory Management <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                                <div className="stat-card bg-institutes">
                                    <i className="fa fa-university card-icon"></i>
                                    <div className="card-label">Active Institutes</div>
                                    <div className="card-value">{counts.institutes.toLocaleString()}</div>
                                    <Link to="/institute" className="card-footer-link">
                                        Campus Governance <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                                <div className="stat-card bg-alumni">
                                    <i className="fa fa-graduation-cap card-icon"></i>
                                    <div className="card-label">Alumni Offices</div>
                                    <div className="card-value">{counts.alumniOffices.toLocaleString()}</div>
                                    <Link to="/alumni-office" className="card-footer-link">
                                        Alumni Network <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                                <div className="stat-card bg-placement">
                                    <i className="fa fa-briefcase card-icon"></i>
                                    <div className="card-label">Placement Cells</div>
                                    <div className="card-value">{counts.placementCells.toLocaleString()}</div>
                                    <Link to="/placement-cell" className="card-footer-link">
                                        Placement Governance <i className="fa fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>

                            </div>
                        </Fragment>
                    )}
        </AppShell>
    );
}

export default Dashboard;
