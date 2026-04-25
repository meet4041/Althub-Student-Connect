/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/alt-text, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../../layouts/Loader.jsx';
import Menu from '../../../layouts/Menu.jsx';
import Footer from '../../../layouts/Footer.jsx';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../../../utils/imageUtils';
import axiosInstance from '../../../service/axios';
import SweetAlert from 'react-bootstrap-sweetalert';

import '../../../styles/events.css';
import '../../../styles/posts.css';

const PlacementPosts = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [displayPosts, setDisplayPosts] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const rows = [10, 20, 30];
    const [postsPerPage, setPostsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        setInstitute_Id(id);
    }, []);

    const getPostsData = useCallback(() => {
        if (!institute_Id) return;
        axiosInstance.get(`${ALTHUB_API_URL}/api/getPostById/${institute_Id}`, {
        })
            .then((response) => {
                if (response.data.success) {
                    setPosts(response.data.data || []);
                }
            }).catch((err) => {
                console.error("Fetch Posts Error:", err);
                setPosts([]);
            });
    }, [institute_Id]);

    useEffect(() => { if (institute_Id) getPostsData(); }, [institute_Id, getPostsData]);
    useEffect(() => {
        const search = searchTerm.toLowerCase();
        setDisplayPosts(
            posts.filter((el) =>
                (el.description || '').toLowerCase().includes(search)
            )
        );
        setCurrentPage(1);
    }, [posts, searchTerm]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPost = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
    const pageNumbers = Array.from({ length: Math.ceil(displayPosts.length / postsPerPage) }, (_, i) => i + 1);

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const DeletePost = () => {
        axiosInstance.delete(`${ALTHUB_API_URL}/api/deletePost/${deleteId}`, {
        })
            .then((res) => {
                if (res.data.success) {
                    setAlert(false);
                    setAlert2(true);
                    setSelectedPost(null);
                }
            }).catch((err) => console.error("Delete Error:", err));
    };

    const formatDate = (timestamp) => {
        const messageTime = new Date(timestamp);
        const now = new Date();
        const minutesDiff = Math.floor(Math.abs(now - messageTime) / 60000);
        if (minutesDiff < 1) return "Just now";
        if (minutesDiff < 60) return `${minutesDiff}m ago`;
        if (messageTime.toDateString() === now.toDateString()) return `Today ${messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatDateShort = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const paginate = (num) => setCurrentPage(num);

    const withImagesCount = posts.filter((post) => post.photos?.length).length;
    const showingFrom = displayPosts.length ? indexOfFirstPost + 1 : 0;
    const showingTo = displayPosts.length ? Math.min(indexOfLastPost, displayPosts.length) : 0;

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content posts-content-wrapper">
                    <div className="events-container">
                        <div className="events-header">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1">
                                        <li className="breadcrumb-item"><Link to="/placement-posts">Home</Link></li>
                                        <li className="breadcrumb-item active">Placement Posts</li>
                                    </ol>
                                </nav>
                                <h1 className="events-title">Placement Posts</h1>
                            </div>
                            <Link to="/placement-add-post" className="btn-events-create">
                                <i className="fa fa-plus-circle mr-2"></i> Create New Post
                            </Link>
                        </div>

                        <div className="events-stats-strip">
                            <div className="events-stat-card">
                                <span className="events-stat-value">{posts.length}</span>
                                <span className="events-stat-label">Total Posts</span>
                            </div>
                            <div className="events-stat-card events-stat-accent">
                                <span className="events-stat-value">{withImagesCount}</span>
                                <span className="events-stat-label">With Media</span>
                            </div>
                        </div>

                        <div className="events-toolbar">
                            <div className="events-search-wrap">
                                <i className="fa fa-search events-search-icon"></i>
                                <input
                                    type="text"
                                    className="events-search-input"
                                    placeholder="Search posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="posts-toolbar-group">
                                <span className="posts-toolbar-label">Rows</span>
                                <select
                                    className="events-rows-select"
                                    value={postsPerPage}
                                    onChange={(e) => {
                                        setPostsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    {rows.map(v => <option key={v} value={v}>{v} per page</option>)}
                                </select>
                            </div>
                            <div className="events-view-toggle">
                                <button
                                    className={`events-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <i className="fa fa-th-large"></i>
                                </button>
                                <button
                                    className={`events-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                    title="Table view"
                                >
                                    <i className="fa fa-list"></i>
                                </button>
                            </div>
                        </div>

                        <div className="events-content-card">
                            <div className="events-content-area">
                                {viewMode === 'grid' ? (
                                    <div className="events-grid">
                                        {currentPost.length > 0 ? currentPost.map((elem, index) => (
                                            <div
                                                key={elem._id || index}
                                                className="events-card"
                                                onClick={() => setSelectedPost(elem)}
                                            >
                                                <div className="events-card-image-wrap">
                                                    <img
                                                        src={getImageUrl(elem.photos?.[0], FALLBACK_IMAGES.post)}
                                                        className="events-card-image"
                                                        alt="post"
                                                        onError={getImageOnError(FALLBACK_IMAGES.post)}
                                                    />
                                                    <div className="events-card-overlay"></div>
                                                    <span className="events-card-date-badge">
                                                        {formatDateShort(elem.date)}
                                                    </span>
                                                </div>
                                                <div className="events-card-body">
                                                    <h3 className="events-card-title">Post {(indexOfFirstPost + index + 1).toString().padStart(2, '0')}</h3>
                                                    <p className="posts-card-meta">
                                                        <i className="far fa-clock"></i> {formatDate(elem.date)}
                                                    </p>
                                                    <p className="events-card-desc">{(elem.description || 'No description provided.').slice(0, 80)}{(elem.description || '').length > 80 ? '...' : ''}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="events-empty">
                                                <div className="events-empty-icon"><i className="fa fa-bullhorn"></i></div>
                                                <h3>No posts found</h3>
                                                <p>Create your first placement post</p>
                                                <Link to="/placement-add-post" className="btn-events-create btn-events-empty">Create New Post</Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="events-table-wrap">
                                        <table className="events-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Preview</th>
                                                    <th>Post Details</th>
                                                    <th>Posted Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPost.length > 0 ? currentPost.map((elem, index) => (
                                                    <tr key={elem._id || index} onClick={() => setSelectedPost(elem)}>
                                                        <td><span className="events-table-num">{(indexOfFirstPost + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td>
                                                            <img src={getImageUrl(elem.photos?.[0], FALLBACK_IMAGES.post)} className="events-table-thumb" alt="post" onError={getImageOnError(FALLBACK_IMAGES.post)} />
                                                        </td>
                                                        <td>
                                                            <div className="events-table-title">Post {(indexOfFirstPost + index + 1).toString().padStart(2, '0')}</div>
                                                            <div className="posts-table-desc">{(elem.description || 'No description provided.').slice(0, 70)}{(elem.description || '').length > 70 ? '...' : ''}</div>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="events-table-date">{formatDate(elem.date)}</div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="events-table-empty">No posts found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {displayPosts.length > 0 && (
                                <div className="events-pagination">
                                    <p className="events-pagination-info">Showing {showingFrom}-{showingTo} of {displayPosts.length}</p>
                                    <div className="events-pagination-controls">
                                        <select
                                            className="events-rows-select"
                                            value={postsPerPage}
                                            onChange={(e) => {
                                                setPostsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {rows.map(v => <option key={v} value={v}>{v} per page</option>)}
                                        </select>
                                        <nav>
                                            <button className="events-page-btn" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
                                                <i className="fa fa-chevron-left"></i>
                                            </button>
                                            {pageNumbers.slice(0, 5).map(num => (
                                                <button
                                                    key={num}
                                                    className={`events-page-btn ${currentPage === num ? 'active' : ''}`}
                                                    onClick={() => paginate(num)}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            {pageNumbers.length > 5 && <span className="events-page-dots">…</span>}
                                            <button className="events-page-btn" disabled={currentPage === pageNumbers.length} onClick={() => paginate(currentPage + 1)}>
                                                <i className="fa fa-chevron-right"></i>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedPost && (
                    <div className="events-modal-backdrop" onClick={() => setSelectedPost(null)}>
                        <div className="events-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="events-modal-close" onClick={() => setSelectedPost(null)} aria-label="Close">
                                <i className="fa fa-times"></i>
                            </button>
                            <div className="events-modal-layout">
                                <div className="events-modal-image">
                                    <img
                                        src={getImageUrl(selectedPost.photos?.[0], FALLBACK_IMAGES.post)}
                                        alt="post"
                                        onError={getImageOnError(FALLBACK_IMAGES.post)}
                                    />
                                    <div className="events-modal-image-overlay"></div>
                                    <div className="events-modal-badges">
                                        <span className="events-modal-date">
                                            {formatDate(selectedPost.date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="events-modal-body">
                                    <h2 className="events-modal-title">Placement Post</h2>
                                    <div className="events-modal-meta">
                                        <span><i className="fa fa-calendar-alt"></i> {formatDate(selectedPost.date)}</span>
                                        <span><i className="fa fa-image"></i> {(selectedPost.photos || []).length} media item(s)</span>
                                    </div>
                                    <div className="events-modal-desc">
                                        {selectedPost.description || 'No description provided.'}
                                    </div>
                                    <div className="events-modal-actions">
                                        <button className="events-modal-btn primary" onClick={() => navigate('/placement-edit-post', { state: { post: selectedPost } })}>
                                            <i className="fa fa-edit mr-2"></i> Edit Post
                                        </button>
                                        <button className="events-modal-btn danger" onClick={() => { setDeleteId(selectedPost._id); setAlert(true); }}>
                                            <i className="fa fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Confirm Delete?" onConfirm={DeletePost} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Post Removed" onConfirm={() => { setAlert2(false); getPostsData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    );
};

export default PlacementPosts;
