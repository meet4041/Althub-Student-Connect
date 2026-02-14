/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layouts/Loader.jsx'
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import axiosInstance from '../service/axios'; 

// COMPANY STANDARD: Import external CSS
import '../styles/dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(null); 
    const [alumniMembers, setAlumniMembers] = useState(null);
    const [events, setEvents] = useState(null);
    const [posts, setPosts] = useState(null);
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    const themeColors = { primary: '#2563EB' };
    const userRole = localStorage.getItem('userRole');
    const isAlumniOffice = userRole === 'alumni_office';
    const isPlacementOffice = userRole === 'placement_cell';
    const isInstitute = !isAlumniOffice && !isPlacementOffice;

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

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error("Please select a CSV file");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            const res = await axiosInstance.post('/api/bulkInviteAlumniCsv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { createdCount, skippedCount } = res.data?.data || {};
            toast.success(`Created: ${createdCount || 0}, Skipped: ${skippedCount || 0}`);
            setShowCsvModal(false);
            setCsvFile(null);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Upload failed");
        }
    };

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
            if (response.data.success) {
                const alumniCount = (response.data.data || []).filter(u => u.type === 'Alumni').length;
                setAlumniMembers(alumniCount);
            } else {
                setAlumniMembers(0);
            }
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
            <ToastContainer theme="colored" position="top-right" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content dashboard-content">
                    
                    {/* Header Section */}
                    <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2">
                        <div>
                            <ol className="breadcrumb mb-1 dashboard-breadcrumb">
                                <li className="breadcrumb-item"><Link to="/dashboard" className="dashboard-breadcrumb-link">Home</Link></li>
                                <li className="breadcrumb-item active">
                                    {isAlumniOffice ? 'Alumni Office' : isPlacementOffice ? 'Placement Cell' : 'Overview'}
                                </li>
                            </ol>
                            <h1 className="dashboard-header-h1">
                                {isAlumniOffice ? 'Alumni Office Summary' : isPlacementOffice ? 'Placement Cell Summary' : 'Dashboard Summary'}
                            </h1>
                        </div>
                        <div className="mt-2 mt-sm-0">
                            <span className="badge institute-badge text-white">
                                <i className="fa fa-university mr-2"></i> {institute_Name}
                            </span>
                        </div>
                    </div>

                    {(isAlumniOffice || isInstitute) && (
                        <div className="dashboard-csv-bar">
                            <div className="dashboard-csv-text">
                                Bulk invite to students via email (CSV)
                            </div>
                            <button className="btn dashboard-csv-btn" onClick={() => setShowCsvModal(true)}>
                                <i className="fa fa-file-upload mr-2"></i> Upload CSV
                            </button>
                        </div>
                    )}

                    <hr className="mb-4 opacity-50" />
                    
                    {loading ? (
                        <div className="text-center p-5 mt-5">
                            <div className="spinner-border" style={{color: themeColors.primary}} role="status"></div>
                            <h4 className="mt-3 text-muted">Syncing Secure Environment...</h4>
                        </div>
                    ) : (
                        <div className="row">
                            {isAlumniOffice ? (
                                <>
                                    <div className="col-xl-4 col-md-6 mb-4">
                                        <div className="widget widget-stats shadow-sm stat-card-modern">
                                            <div className="stats-icon text-white-50"><i className="fa fa-calendar-alt"></i></div>
                                            <div className="stats-info">
                                                <h4 className="font-weight-bold text-white">ALUMNI EVENTS</h4>
                                                <p className="text-white">{events === null ? '...' : events.toLocaleString()}</p>
                                            </div>
                                            <div className="stats-link">
                                                <Link to="/alumni-events" className="text-white-50">Manage Events <i className="fa fa-arrow-right ml-2"></i></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-md-6 mb-4">
                                        <div className="widget widget-stats shadow-sm stat-card-modern">
                                            <div className="stats-icon text-white-50"><i className="fa fa-bullhorn"></i></div>
                                            <div className="stats-info">
                                                <h4 className="font-weight-bold text-white">ALUMNI POSTS</h4>
                                                <p className="text-white">{posts === null ? '...' : posts.toLocaleString()}</p>
                                            </div>
                                            <div className="stats-link">
                                                <Link to="/alumni-posts" className="text-white-50">Manage Posts <i className="fa fa-arrow-right ml-2"></i></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-md-6 mb-4">
                                        <div className="widget widget-stats shadow-sm stat-card-modern">
                                            <div className="stats-icon text-white-50"><i className="fa fa-user-graduate"></i></div>
                                            <div className="stats-info">
                                                <h4 className="font-weight-bold text-white">ALUMNI MEMBERS</h4>
                                                <p className="text-white">{alumniMembers === null ? '...' : alumniMembers.toLocaleString()}</p>
                                            </div>
                                            <div className="stats-link">
                                                <Link to="/alumni-members" className="text-white-50">View Members <i className="fa fa-arrow-right ml-2"></i></Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : isPlacementOffice ? (
                                <>
                                    <div className="col-xl-4 col-md-6 mb-4">
                                        <div className="widget widget-stats shadow-sm stat-card-modern">
                                            <div className="stats-icon text-white-50"><i className="fa fa-calendar-alt"></i></div>
                                            <div className="stats-info">
                                                <h4 className="font-weight-bold text-white">PLACEMENT EVENTS</h4>
                                                <p className="text-white">{events === null ? '...' : events.toLocaleString()}</p>
                                            </div>
                                            <div className="stats-link">
                                                <Link to="/placement-events" className="text-white-50">Manage Events <i className="fa fa-arrow-right ml-2"></i></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-md-6 mb-4">
                                        <div className="widget widget-stats shadow-sm stat-card-modern">
                                            <div className="stats-icon text-white-50"><i className="fa fa-bullhorn"></i></div>
                                            <div className="stats-info">
                                                <h4 className="font-weight-bold text-white">PLACEMENT POSTS</h4>
                                                <p className="text-white">{posts === null ? '...' : posts.toLocaleString()}</p>
                                            </div>
                                            <div className="stats-link">
                                                <Link to="/placement-posts" className="text-white-50">Manage Posts <i className="fa fa-arrow-right ml-2"></i></Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
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

            {showCsvModal && (
                <div className="csv-modal-backdrop" onClick={() => setShowCsvModal(false)}>
                    <div className="csv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="csv-modal-header">
                            <h4 className="csv-modal-title">Upload Alumni CSV</h4>
                            <button className="csv-modal-close" onClick={() => setShowCsvModal(false)} aria-label="Close">&times;</button>
                        </div>
                        <form onSubmit={handleCsvUpload} className="csv-modal-body">
                            <p className="text-muted small mb-3">CSV should contain emails in the first column (optional header: email).</p>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                className="form-control"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            />
                            <div className="csv-modal-actions">
                                <button type="button" className="btn btn-light" onClick={() => setShowCsvModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload & Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard;
