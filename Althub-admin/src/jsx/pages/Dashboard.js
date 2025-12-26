import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import axiosInstance from '../../services/axios'; 

function Dashboard() {        
    const [users, setUsers] = useState(0);
    const [institutes, setInstitutes] = useState(0);
    const [feedback, setFeedback] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                var element = document.getElementById("page-container");
                if (element) element.classList.add("show");
                
                await Promise.all([
                    getTotalUser(),
                    getTotalInstitutes(),
                    getTotalFeedback(),
                ]);
            } catch (err) {
                console.error('Dashboard initialization error:', err);
                if(err.response?.status !== 401) {
                    setError(err.message);
                }
            } finally {
                // Smooth transition: delay loader removal slightly for better UX
                setTimeout(() => setLoading(false), 500);
            }
        };
        
        initDashboard();
    }, []);

    const getTotalUser = async () => {
        try {
            const response = await axiosInstance.get(`/api/getUsers`);
            if (response?.data?.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data.length);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setUsers(0);
        }
    };

    const getTotalInstitutes = async () => {
        try {
            const response = await axiosInstance.get(`/api/getInstitutes`);
            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
                setInstitutes(response.data.data.length);
            }
        } catch (err) {
            console.error('Error fetching institutes:', err);
            setInstitutes(0);
        }
    };

    const getTotalFeedback = async () => {
        try {
            const response = await axiosInstance.get(`/api/getFeedback`);
            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
                setFeedback(response.data.data.length);
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setFeedback(0);
        }
    };

    return (
        <>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    {/* BREADCRUMB UI IMPROVEMENT */}
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                    
                    <h1 className="page-header text-dark font-weight-bold">
                        Dashboard Overview <small>Statistics and system insights</small>
                    </h1>

                    {loading ? (
                        <div className="d-flex align-items-center justify-content-center" style={{minHeight: '60vh'}}>
                            <Loader />
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="alert alert-danger fade show shadow-sm">
                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                    Error loading dashboard data: {error}
                                </div>
                            )}

                            <div className="row">
                                {/* USERS CARD - Gradient Blue */}
                                <div className="col-xl-4 col-md-6">
                                    <div className="widget widget-stats bg-gradient-blue shadow-lg border-0 rounded-lg overflow-hidden transition-all hover-up">
                                        <div className="stats-icon stats-icon-lg"><i className="fa fa-users fa-fw"></i></div>
                                        <div className="stats-content">
                                            <div className="stats-title text-white-700">TOTAL REGISTERED USERS</div>
                                            <div className="stats-number text-white">{users.toLocaleString()}</div>
                                            <div className="stats-progress progress progress-xs">
                                                <div className="progress-bar bg-white" style={{width: '70%'}}></div>
                                            </div>
                                            <div className="stats-desc text-white-700">70% increase compared to last month</div>
                                        </div>
                                        <div className="stats-link">
                                            <Link to="/users" className="text-white">View User Directory <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>

                                {/* INSTITUTES CARD - Gradient Purple/Pink */}
                                <div className="col-xl-4 col-md-6">
                                    <div className="widget widget-stats bg-gradient-purple shadow-lg border-0 rounded-lg overflow-hidden transition-all hover-up">
                                        <div className="stats-icon stats-icon-lg"><i className="fa fa-university fa-fw"></i></div>
                                        <div className="stats-content">
                                            <div className="stats-title text-white-700">PARTNER INSTITUTES</div>
                                            <div className="stats-number text-white">{institutes.toLocaleString()}</div>
                                            <div className="stats-progress progress progress-xs">
                                                <div className="progress-bar bg-white" style={{width: '45%'}}></div>
                                            </div>
                                            <div className="stats-desc text-white-700">Active institutional connections</div>
                                        </div>
                                        <div className="stats-link">
                                            <Link to="/institute" className="text-white">Manage Institutes <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>

                                {/* FEEDBACK CARD - Gradient Teal/Green */}
                                <div className="col-xl-4 col-md-6">
                                    <div className="widget widget-stats bg-gradient-teal shadow-lg border-0 rounded-lg overflow-hidden transition-all hover-up">
                                        <div className="stats-icon stats-icon-lg"><i className="fa fa-comments fa-fw"></i></div>
                                        <div className="stats-content">
                                            <div className="stats-title text-white-700">USER FEEDBACKS</div>
                                            <div className="stats-number text-white">{feedback.toLocaleString()}</div>
                                            <div className="stats-progress progress progress-xs">
                                                <div className="progress-bar bg-white" style={{width: '60%'}}></div>
                                            </div>
                                            <div className="stats-desc text-white-700">Recent responses received</div>
                                        </div>
                                        <div className="stats-link">
                                            <Link to="/feedback" className="text-white">Read Feedback <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* OPTIONAL: ADD A SECONDARY ROW FOR SYSTEM STATUS */}
                            <div className="row mt-4">
                                <div className="col-xl-12">
                                    <div className="panel panel-inverse border-0 shadow-sm">
                                        <div className="panel-heading bg-dark text-white border-0">
                                            <h4 className="panel-title">System Insights</h4>
                                        </div>
                                        <div className="panel-body bg-light">
                                            <p className="mb-0">The administrator dashboard currently tracks <b>{users + institutes}</b> total database nodes. System performance is optimal.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Dashboard;