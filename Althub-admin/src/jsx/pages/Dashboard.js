import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
// FIX: Import axiosInstance instead of the default axios
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
                
                // Fetch data using the secure axiosInstance
                await Promise.all([
                    getTotalUser(),
                    getTotalInstitutes(),
                    getTotalFeedback(),
                ]);
            } catch (err) {
                console.error('Dashboard initialization error:', err);
                // Only show error if it's not a 401 (which is handled by axios.js)
                if(err.response?.status !== 401) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        
        initDashboard();
    }, []);

    const getTotalUser = async () => {
        try {
            // FIX: Use axiosInstance.get
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
            // FIX: Use axiosInstance.get
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
            // FIX: Use axiosInstance.get
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
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                    <h1 className="page-header">Dashboard </h1>
                    {loading && <div className="row"><div className="col-12"><Loader /></div></div>}
                    {error && (
                        <div className="alert alert-danger">
                            Error loading dashboard data: {error}
                        </div>
                    )}
                    <div className="row">
                        <div className="col-xl-3 col-md-6">
                            <div className="widget widget-stats bg-info">
                                <div className="stats-icon"><i className="fa fa-users"></i></div>
                                <div className="stats-info">
                                    <h4>Total Users</h4>
                                    <p>{users}</p>
                                </div>
                                <div className="stats-link">
                                    <Link to="/users">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <div className="widget widget-stats bg-pink" >
                                <div className="stats-icon"><i className="fa fa-university"></i></div>
                                <div className="stats-info">
                                    <h4>Total Institutes</h4>
                                    <p>{institutes}</p>
                                </div>
                                <div className="stats-link">
                                    <Link to="/institute">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-md-6">
                            <div className="widget widget-stats bg-info" >
                                <div className="stats-icon"><i className="fa fa-comments"></i></div>
                                <div className="stats-info">
                                    <h4>Total Feedback</h4>
                                    <p>{feedback}</p>
                                </div>
                                <div className="stats-link">
                                    <Link to="/feedback">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Dashboard;