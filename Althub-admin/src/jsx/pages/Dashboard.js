import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import axios from 'axios';
import { ALTHUB_API_URL } from '../../baseURL';

function Dashboard() {        
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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        initDashboard();
    }, []);

    const [users, setUsers] = useState(0);
    const [institutes, setInstitutes] = useState(0);
    const [feedback, setFeedback] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getTotalUser = async () => {
        try {
            console.log('Fetching users...');
            const response = await axios.get(`${ALTHUB_API_URL}/api/getUsers`);
            console.log('Users response:', response.data);
            if (response?.data?.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data.length);
            } else {
                console.warn('Invalid response format from /api/getUsers:', response.data);
                setUsers(0);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            setUsers(0);
        }
    };

    const getTotalInstitutes = async () => {
        try {
            console.log('Fetching institutes...');
            const response = await axios.get(`${ALTHUB_API_URL}/api/getInstitutes`);
            console.log('Institutes response:', response.data);
            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
                setInstitutes(response.data.data.length);
            } else {
                console.warn('Invalid response format from /api/getInstitutes:', response.data);
                setInstitutes(0);
            }
        } catch (err) {
            console.error('Error fetching institutes:', err);
            setError(err.message);
            setInstitutes(0);
        }
    };

    const getTotalFeedback = async () => {
        try {
            console.log('Fetching feedback...');
            const response = await axios.get(`${ALTHUB_API_URL}/api/getFeedback`);
            console.log('Feedback response:', response.data);
            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
                setFeedback(response.data.data.length);
            } else {
                console.warn('Invalid response format from /api/getFeedback:', response.data);
                setFeedback(0);
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError(err.message);
            setFeedback(0);
        }
    };

    return (
        <>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><a href="#!">Home</a></li>
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
                                    <Link to="/Institute">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
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
                                    <Link to="/Feedback">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
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