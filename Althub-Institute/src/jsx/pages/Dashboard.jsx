/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import axiosInstance from '../../service/axios'; 

// COMPANY STANDARD: Import external CSS
import '../../styles/dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(null); 
    const [events, setEvents] = useState(null);
    const [posts, setPosts] = useState(null);
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [loading, setLoading] = useState(true);

    const themeColors = { primary: '#2563EB' };

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.remove('show');
            loader.style.display = 'none';
        }

        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        if (window.App) window.App.init();

        const id = localStorage.getItem("AlmaPlus_institute_Id");
        const name = localStorage.getItem("AlmaPlus_institute_Name");

        if (!id || !name) {
            navigate('/login');
            return;
        }

        setInstitute_Id(id);
        setInstitute_Name(name);
        setLoading(false);
    }, [navigate]);
    
    useEffect(() => {
        if (institute_Id && institute_Name) {
            fetchAllStats();
        }
    }, [institute_Id, institute_Name]);

    const fetchAllStats = async () => {
        Promise.all([
            getTotalUser(),
            getTotalEvents(),
            getTotalPosts()
        ]).catch(err => console.error("Stats error", err));
    };

    const getTotalUser = async () => {
        try {
            const response = await axiosInstance.get(`/api/getUsersOfInstitute/${institute_Name}`);
            setUsers(response.data.success ? response.data.data.length : 0);
        } catch (err) { setUsers(0); }
    };

    const getTotalEvents = async () => {
        try {
            const response = await axiosInstance.get(`/api/getEventsByInstitute/${institute_Id}`);
            setEvents(response.data.success ? response.data.data.length : 0);
        } catch (err) { setEvents(0); }
    };

    const getTotalPosts = async () => {
        try {
            const response = await axiosInstance.get(`/api/getPostById/${institute_Id}`);
            setPosts(response.data.success ? response.data.data.length : 0);
        } catch (err) { setPosts(0); }
    };

    return (
        <>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content dashboard-content">
                    
                    {/* Header Section */}
                    <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2">
                        <div>
                            <ol className="breadcrumb mb-1" style={{background: 'transparent', padding: 0}}>
                                <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColors.primary, fontWeight: '500'}}>Home</Link></li>
                                <li className="breadcrumb-item active">Overview</li>
                            </ol>
                            <h1 className="dashboard-header-h1">Dashboard Summary</h1>
                        </div>
                        <div className="mt-2 mt-sm-0">
                            <span className="badge institute-badge text-white">
                                <i className="fa fa-university mr-2"></i> {institute_Name}
                            </span>
                        </div>
                    </div>

                    <hr className="mb-4 opacity-50" />
                    
                    {loading ? (
                        <div className="text-center p-5 mt-5">
                            <div className="spinner-border" style={{color: themeColors.primary}} role="status"></div>
                            <h4 className="mt-3 text-muted">Syncing Secure Environment...</h4>
                        </div>
                    ) : (
                        <div className="row">
                            {/* Card 1: Users */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm stat-card-modern">
                                    <div className="stats-icon text-white-50"><i className="fa fa-users"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">INSTITUTE USERS</h4>
                                        <p className="text-white">{users === null ? '...' : users.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/users" className="text-white-50">Manage Users <i className="fa fa-arrow-right ml-2"></i></Link>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Events */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm stat-card-modern">
                                    <div className="stats-icon text-white-50"><i className="fa fa-calendar-alt"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">UPCOMING EVENTS</h4>
                                        <p className="text-white">{events === null ? '...' : events.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/events" className="text-white-50">View Calendar <i className="fa fa-arrow-right ml-2"></i></Link>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Posts */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm stat-card-modern">
                                    <div className="stats-icon text-white-50"><i className="fa fa-newspaper"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">TOTAL CONTRIBUTIONS</h4>
                                        <p className="text-white">{posts === null ? '...' : posts.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/posts" className="text-white-50">Manage Content <i className="fa fa-arrow-right ml-2"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Help / Security Info Section */}
                    {!loading && (
                        <div className="row mt-3">
                            <div className="col-xl-12">
                                <div className="alert shadow-sm d-flex align-items-center p-3 security-alert-modern">
                                    <div className="mr-3 text-white security-icon-circle">
                                        <i className="fa fa-shield-alt fa-lg"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 font-weight-bold text-dark">Security Notice</h6>
                                        <small className="text-muted">Your session is protected with versioned JWT encryption. Password changes invalidate all other active sessions.</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Dashboard;