/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/alt-text, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom'
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import SweetAlert from 'react-bootstrap-sweetalert';

const Posts = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const [posts, setPosts] = useState([]);
    const [displayPosts, setDisplayPosts] = useState([]);
    const rows = [10, 20, 30];
    const [postsPerPage, setPostsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");
            
            const id = localStorage.getItem("AlmaPlus_institute_Id");
            setInstitute_Id(id);
        }
    }, []);

    useEffect(() => {
        if (institute_Id) {
            getPostsData();
        }
    }, [institute_Id]);

    const getPostsData = () => {
        if (!institute_Id) return;
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getPostById/${institute_Id}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).then((response) => {
            setPosts(response.data.data || []);
        }).catch(err => setPosts([]));
    };

    useEffect(() => {
        setDisplayPosts(posts);
    }, [posts]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPost = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayPosts.length / postsPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => {
        setCurrentPage(num);
    }

    const handleSearch = (e) => {
        if (e.target.value) {
            let search = e.target.value;
            setDisplayPosts(posts.filter(
                (elem) =>
                    elem.description.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setDisplayPosts(posts)
        }
    }

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeletePost = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeletePost = () => {
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deletePost/${deleteId}`,
        }).then((response) => {
            if (response.data.success === true) {
                getPostsData();
                setDeleteId('');
                setAlert(false);
                setAlert2(true);
            }
        })
    }

    const formatDate = (timestamp) => {
        const messageTime = new Date(timestamp);
        const now = new Date();
        const timeDiff = Math.abs(now - messageTime);
        const minutesDiff = Math.floor(timeDiff / 60000);
        if (minutesDiff < 1) {
            return "Just now";
        } else if (minutesDiff < 60) {
            return `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`;
        } else if (messageTime.toDateString() === now.toDateString()) {
            const options = { hour: "numeric", minute: "numeric" };
            return `Today at ${messageTime.toLocaleTimeString("en-US", options)}`;
        } else {
            const options = {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            };
            return messageTime.toLocaleString("en-US", options);
        }
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    
                    {/* Header Section */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                                <li className="breadcrumb-item active">Posts</li>
                            </ol>
                            <h1 className="page-header mb-0">Post Management</h1>
                        </div>
                        {/* Primary Blue Button */}
                        <Link to="/add-post" className="btn btn-primary btn-lg shadow-sm" 
                              style={{borderRadius: '8px', backgroundColor: themeColor, borderColor: themeColor}}>
                            <i className="fa fa-plus mr-2"></i> Create New Post
                        </Link>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-0">
                            
                            {/* Search & Filter Bar */}
                            <div className="p-4 border-bottom bg-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-light border rounded-pill px-3 py-1 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search posts by description..." onChange={handleSearch} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                        <span className="text-muted mr-2">Show</span>
                                        <select className="custom-select custom-select-sm w-auto border-0 shadow-sm" style={{borderRadius: '5px'}} onChange={(e) => setPostsPerPage(Number(e.target.value))}>
                                            {rows.map(value =>
                                                <option key={value} value={value}>{value} Posts</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{backgroundColor: '#F1F5F9', color: '#334155'}}>
                                        <tr>
                                            <th className="border-0 pl-4">Sr. No.</th>
                                            <th className="border-0">Media</th>
                                            <th className="border-0" style={{width: '50%'}}>Description</th>
                                            <th className="border-0">Posted Date</th>
                                            <th className="border-0 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPost.length > 0 ? currentPost.map((elem, index) =>
                                            <tr key={index}>
                                                <td className="pl-4 align-middle text-muted">{indexOfFirstPost + index + 1}</td>
                                                <td className="align-middle">
                                                    {elem.photos === '' || elem.photos === undefined || elem.photos.length <= 0 ? 
                                                        <img src='assets/img/Events-amico.png' style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} alt="default" /> 
                                                        : 
                                                        <img src={`${ALTHUB_API_URL}${elem.photos[0]}`} alt='post-img' style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                                    }
                                                </td>
                                                <td className="align-middle">
                                                    <span className="text-dark" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                                        {elem.description}
                                                    </span>
                                                </td>
                                                <td className="align-middle">
                                                    <span className="badge p-2 font-weight-normal" style={{backgroundColor: '#EFF6FF', color: themeColor}}>
                                                        <i className="far fa-clock mr-1"></i> {formatDate(elem.date)}
                                                    </span>
                                                </td>
                                                {/* --- MODIFIED ACTION COLUMN --- */}
                                                <td className="align-middle text-center">
                                                    <div className="d-flex justify-content-center">
                                                        <Link 
                                                            to="/edit-post" 
                                                            state={{ post: elem }}
                                                            className="btn btn-primary btn-sm shadow-sm mr-2"
                                                            title="Edit Post"
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </Link>
                                                        <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm" 
                                                                onClick={() => { handleDeletePost(elem._id) }} 
                                                                title="Delete Post">
                                                            <i className="fa fa-trash-alt text-danger"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                {/* ----------------------------- */}
                                            </tr>
                                        ) : <tr><td colSpan="5" className="text-center p-5 text-muted">No posts found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">
                                    Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, displayPosts.length)} of {displayPosts.length} posts
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => paginate(currentPage - 1)} style={{color: themeColor}}>Previous</button>
                                        </li>
                                        {pageNumbers.map((number) => (
                                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => paginate(number)}
                                                    style={currentPage === number ? {backgroundColor: themeColor, borderColor: themeColor} : {color: themeColor}}
                                                >
                                                    {number}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => paginate(currentPage + 1)} style={{color: themeColor}}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {alert === true && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        title="Delete Post?"
                        onConfirm={DeletePost}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                    >
                        This will permanently remove this post from the feed.
                    </SweetAlert>
                )}
                
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Post Deleted"
                        onConfirm={() => { setAlert2(false); getPostsData(); }}
                    >
                        The post has been successfully removed.
                    </SweetAlert>
                )}
                <Footer />
            </div>
        </Fragment>
    )
}

export default Posts;