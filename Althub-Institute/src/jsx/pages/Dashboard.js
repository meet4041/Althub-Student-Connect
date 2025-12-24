/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import axiosInstance from '../../service/axios'; 

function Dashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(null); 
    const [events, setEvents] = useState(null);
    const [posts, setPosts] = useState(null);
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [loading, setLoading] = useState(true);

    // Color constants for the Blue Theme
    const themeColors = {
        primary: '#2563EB',   // Royal Blue
        dark: '#1E40AF',      // Darker Blue for depth
        light: '#60A5FA',     // Lighter Blue for accents
        cardBg: '#2563EB'     // Standard card background
    };

    useEffect(() => {
        // --- 1. UI Initialization ---
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.remove('show');
            loader.style.display = 'none';
        }

        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        if (window.App) {
            window.App.init();
        }

        // --- 2. Auth Check ---
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
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}> {/* Very light blue-grey bg */}
                    
                    {/* Header Section */}
                    <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColors.primary}}>Home</Link></li>
                                <li className="breadcrumb-item active">Overview</li>
                            </ol>
                            <h1 className="page-header mb-0" style={{color: '#1E293B'}}>Dashboard Summary</h1>
                        </div>
                        <div className="mt-2 mt-sm-0">
                            {/* Changed badge to Primary Blue */}
                            <span className="badge p-2 text-white" style={{backgroundColor: themeColors.primary, fontSize: '13px'}}>
                                <i className="fa fa-university mr-1"></i> {institute_Name}
                            </span>
                        </div>
                    </div>

                    <hr className="mb-4" />
                    
                    {loading ? (
                        <div className="text-center p-5 mt-5">
                            {/* Spinner set to Primary Blue */}
                            <div className="spinner-border" style={{color: themeColors.primary}} role="status"></div>
                            <h4 className="mt-3 text-muted">Syncing Secure Environment...</h4>
                        </div>
                    ) : (
                        <div className="row">
                            {/* STATS CARDS 
                                Removed bg-gradient-* classes. 
                                Using inline styles for consistent Blue branding.
                            */}

                            {/* Card 1: Users */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm border-0" 
                                     style={{borderRadius: '12px', backgroundColor: themeColors.primary}}>
                                    <div className="stats-icon text-white-50"><i className="fa fa-users"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">INSTITUTE USERS</h4>
                                        <p className="text-white">{users === null ? '...' : users.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/users" className="text-white-50">Manage Users <i className="fa fa-arrow-right ml-1"></i></Link>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Events */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm border-0" 
                                     style={{borderRadius: '12px', backgroundColor: themeColors.primary}}>
                                    <div className="stats-icon text-white-50"><i className="fa fa-calendar-alt"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">UPCOMING EVENTS</h4>
                                        <p className="text-white">{events === null ? '...' : events.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/events" className="text-white-50">View Calendar <i className="fa fa-arrow-right ml-1"></i></Link>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Posts */}
                            <div className="col-xl-4 col-md-6 mb-4">
                                <div className="widget widget-stats shadow-sm border-0" 
                                     style={{borderRadius: '12px', backgroundColor: themeColors.primary}}>
                                    <div className="stats-icon text-white-50"><i className="fa fa-newspaper"></i></div>
                                    <div className="stats-info">
                                        <h4 className="font-weight-bold text-white">TOTAL CONTRIBUTIONS</h4>
                                        <p className="text-white">{posts === null ? '...' : posts.toLocaleString()}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/posts" className="text-white-50">Manage Content <i className="fa fa-arrow-right ml-1"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Help / Security Info Section */}
                    {!loading && (
                        <div className="row mt-3">
                            <div className="col-xl-12">
                                <div className="alert alert-light border-0 shadow-sm d-flex align-items-center p-3" 
                                     style={{borderRadius: '10px', borderLeft: `4px solid ${themeColors.primary}`}}>
                                    {/* Icon Background changed to Blue */}
                                    <div className="mr-3 text-white rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{width: '40px', height: '40px', backgroundColor: themeColors.primary}}>
                                        <i className="fa fa-shield-alt"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 font-weight-bold" style={{color: '#1E293B'}}>Security Notice</h6>
                                        <small className="text-muted">Your session is protected with versioned JWT encryption. Changes to your password will immediately invalidate all other active sessions.</small>
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