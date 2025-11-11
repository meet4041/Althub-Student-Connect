/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';

function Dashboard() {
    const [users, setUsers] = useState(0);
    const [courses, setCourses] = useState(0);
    const [events, setEvents] = useState(0);
    const [posts, setPosts] = useState(0);
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);

    useEffect(() => {
        // Safely access localStorage and DOM elements
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");
            
            const id = localStorage.getItem("AlmaPlus_institute_Id");
            const name = localStorage.getItem("AlmaPlus_institute_Name");
            setInstitute_Id(id);
            setInstitute_Name(name);
        }
    }, []);
    
    useEffect(() => {
        if (institute_Id && institute_Name) {
            getTotalUser();
            getTotalCourses();
            getTotalEvents();
            getTotalPosts();
        }
    }, [institute_Id, institute_Name]);

    const getTotalUser = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`,
        }).then((response) => {
            if (response.data.success === true) {
                setUsers(response.data.data.length);
            }
        });
    };

    const getTotalCourses = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getCourseByInstitute/${institute_Id}`,
        }).then((response) => {
            if (response.data.success === true) {
                setCourses(response.data.data.length);
            }
        });
    };

    const getTotalEvents = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getEventsByInstitute/${institute_Id}`,
        }).then((response) => {
            if (response.data.success === true) {
                setEvents(response.data.data.length);
            }
        });
    };
    const getTotalPosts = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getPostById/${institute_Id}`,
        }).then((response) => {
            if (response.data.success === true) {
                setPosts(response.data.data.length);
            }
        });
    };

    return (
        <>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><a>Home</a></li>
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                    <h1 className="page-header">Dashboard </h1>
                    <div className="row">
                        <div className="col-xl-3 col-md-6">
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

                        {/* <div className="col-xl-3 col-md-6">
                            <div className="widget widget-stats bg-purple">
                                <div className="stats-icon"><i className="fa fa-graduation-cap"></i>
                                </div>
                                <div className="stats-info">
                                    <h4>Total Courses</h4>
                                    <p>{courses}</p>
                                </div>
                                <div className="stats-link">
                                    <Link to="/courses">View Detail <i className="fa fa-arrow-alt-circle-right"></i></Link>
                                </div>
                            </div>
                        </div> */}

                        <div className="col-xl-3 col-md-6">
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

                        <div className="col-xl-3 col-md-6">
                            <div className="widget widget-stats bg-purple">
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
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Dashboard