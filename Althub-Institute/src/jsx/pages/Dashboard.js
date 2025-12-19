/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
// FIX: Use your secure axiosInstance instead of the default axios
import axiosInstance from '../../service/axios'; 

function Dashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(0);
    const [events, setEvents] = useState(0);
    const [posts, setPosts] = useState(0);
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize dashboard layout and fetch stored credentials
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        const name = localStorage.getItem("AlmaPlus_institute_Name");

        // Redirect if session data is missing
        if (!id || !name) {
            navigate('/login');
            return;
        }

        setInstitute_Id(id);
        setInstitute_Name(name);
        setLoading(false);
    }, [navigate]);
    
    // Fetch statistics once institute data is available
    useEffect(() => {
        if (institute_Id && institute_Name) {
            fetchAllStats();
        }
    }, [institute_Id, institute_Name]);

    const fetchAllStats = async () => {
        try {
            await Promise.all([
                getTotalUser(),
                getTotalEvents(),
                getTotalPosts()
            ]);
        } catch (error) {
            console.error("Dashboard stats fetch error:", error);
        }
    };

    const getTotalUser = async () => {
        try {
            // FIX: axiosInstance automatically includes credentials/cookies
            const response = await axiosInstance.get(`/api/getUsersOfInstitute/${institute_Name}`);
            if (response.data.success === true) {
                setUsers(response.data.data.length);
            }
        } catch (err) {
            setUsers(0);
        }
    };

    const getTotalEvents = async () => {
        try {
            const response = await axiosInstance.get(`/api/getEventsByInstitute/${institute_Id}`);
            if (response.data.success === true) {
                setEvents(response.data.data.length);
            }
        } catch (err) {
            setEvents(0);
        }
    };

    const getTotalPosts = async () => {
        try {
            const response = await axiosInstance.get(`/api/getPostById/${institute_Id}`);
            if (response.data.success === true) {
                setPosts(response.data.data.length);
            }
        } catch (err) {
            setPosts(0);
        }
    };

    return (
        <>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Home</Link></li>
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                    <h1 className="page-header">Dashboard </h1>
                    
                    {loading ? <div className="text-center p-5"><h4>Syncing Secure Session...</h4></div> : (
                        <div className="row">
                            <div className="col-xl-4 col-md-6">
                                <div className="widget widget-stats bg-purple">
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

                            <div className="col-xl-4 col-md-6">
                                <div className="widget widget-stats bg-info">
                                    <div className="stats-icon"> <i className="fa fa-calendar"></i></div>
                                    <div className="stats-info">
                                        <h4>Total Events</h4>
                                        <p>{events}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/events">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-4 col-md-6">
                                <div className="widget widget-stats bg-blue">
                                    <div className="stats-icon"> <i className="fa fa-address-card"></i></div>
                                    <div className="stats-info">
                                        <h4>Total Posts</h4>
                                        <p>{posts}</p>
                                    </div>
                                    <div className="stats-link">
                                        <Link to="/posts">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
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

export default Dashboard