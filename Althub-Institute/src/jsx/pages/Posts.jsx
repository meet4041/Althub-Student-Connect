/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/alt-text, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link } from 'react-router-dom'
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import SweetAlert from 'react-bootstrap-sweetalert';

// Import CSS
import '../../styles/posts.css';

const Posts = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const [posts, setPosts] = useState([]);
    const [displayPosts, setDisplayPosts] = useState([]);
    const rows = [10, 20, 30];
    const [postsPerPage, setPostsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Retrieve token for authorized requests
    const token = localStorage.getItem('token');
    const themeColor = '#2563EB';

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        setInstitute_Id(id);
    }, []);

    // Wrapped in useCallback to prevent re-renders and added Authorization header
    const getPostsData = useCallback(() => {
        if (!institute_Id) return;
        axios.get(`${ALTHUB_API_URL}/api/getPostById/${institute_Id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((response) => {
            if(response.data.success) {
                setPosts(response.data.data || []);
            }
        }).catch((err) => {
            console.error("Fetch Posts Error:", err);
            setPosts([]);
        });
    }, [institute_Id, token]);

    useEffect(() => { if (institute_Id) getPostsData(); }, [institute_Id, getPostsData]);
    useEffect(() => { setDisplayPosts(posts); }, [posts]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPost = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
    const pageNumbers = Array.from({ length: Math.ceil(displayPosts.length / postsPerPage) }, (_, i) => i + 1);

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setDisplayPosts(posts.filter(el => el.description.toLowerCase().includes(search)));
        setCurrentPage(1);
    };

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const DeletePost = () => {
        // Added Authorization header to delete request
        axios.delete(`${ALTHUB_API_URL}/api/deletePost/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((res) => {
            if (res.data.success) {
                setAlert(false);
                setAlert2(true);
            }
        }).catch(err => console.error("Delete Error:", err));
    };

    const formatDate = (timestamp) => {
        const messageTime = new Date(timestamp);
        const now = new Date();
        const minutesDiff = Math.floor(Math.abs(now - messageTime) / 60000);
        if (minutesDiff < 1) return "Just now";
        if (minutesDiff < 60) return `${minutesDiff}m ago`;
        if (messageTime.toDateString() === now.toDateString()) return `Today ${messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content posts-content-wrapper">
                    <div className="posts-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Posts Feed</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>Feed Management</h1>
                            </div>
                            <Link to="/add-post" className="btn btn-primary shadow-sm" style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', padding: '10px 22px', fontWeight: '700' }}>
                                <i className="fa fa-plus-circle mr-2"></i> Create New Post
                            </Link>
                        </div>

                        <div className="posts-scroll-area">
                            <div className="card post-main-card">
                                <div className="card-body p-0 bg-white">
                                    <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <div className="input-group" style={{ maxWidth: '400px' }}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search posts..." onChange={handleSearch} />
                                        </div>
                                        <div className="d-flex align-items-center mt-2 mt-md-0">
                                            <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                            <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold" style={{ borderRadius: '6px', width: '110px', height: '38px' }} value={postsPerPage} onChange={(e) => setPostsPerPage(Number(e.target.value))}>
                                                {rows.map(v => <option key={v} value={v}>{v} Rows</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                    <th className="border-0 pl-4 py-3" style={{ width: '80px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>ID</th>
                                                    <th className="border-0 py-3" style={{ width: '100px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Media</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Content Description</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Posted Time</th>
                                                    <th className="border-0 text-right pr-5 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPost.length > 0 ? currentPost.map((elem, index) => (
                                                    <tr key={elem._id || index} className="post-row">
                                                        <td className="pl-4 align-middle"><span className="post-id-badge">{(indexOfFirstPost + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td className="align-middle">
                                                            <img src={elem.photos?.[0] ? `${ALTHUB_API_URL}${elem.photos[0]}` : 'assets/img/Events-amico.png'} className="post-media-preview" alt="post" />
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="text-dark" style={{ fontSize: '14px', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {elem.description}
                                                            </div>
                                                        </td>
                                                        <td className="align-middle">
                                                            <span className="post-date-badge"><i className="far fa-clock mr-1"></i> {formatDate(elem.date)}</span>
                                                        </td>
                                                        <td className="align-middle text-right pr-5">
                                                            <div className="d-flex justify-content-end">
                                                                <Link to="/edit-post" state={{ post: elem }} className="btn btn-light btn-sm mr-2 shadow-none border" style={{ borderRadius: '6px' }}>
                                                                    <i className="fa fa-edit text-primary"></i>
                                                                </Link>
                                                                <button className="btn btn-light btn-sm border" style={{ borderRadius: '6px' }} onClick={() => { setDeleteId(elem._id); setAlert(true); }}>
                                                                    <i className="fa fa-trash-alt text-danger"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : <tr><td colSpan="5" className="text-center p-5 text-muted">No posts available.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-4 bg-white d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <p className="text-muted small mb-0 font-weight-bold">Showing {indexOfFirstPost + 1} - {Math.min(indexOfLastPost, displayPosts.length)} of {displayPosts.length}</p>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                {pageNumbers.map(num => (
                                                    <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                        <button className="page-link border-0 mx-1" onClick={() => setCurrentPage(num)} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px' } : { backgroundColor: '#F8FAFC', color: themeColor, borderRadius: '6px' }}>{num}</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Confirm Delete?" onConfirm={DeletePost} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Post Removed" onConfirm={() => { setAlert2(false); getPostsData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    )
}

export default Posts;