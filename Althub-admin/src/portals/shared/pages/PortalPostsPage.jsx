import { useAuth } from '../../../auth/session';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import axiosInstance from '../../../api/client';
import AppShell from '../../../layouts/AppShell.jsx';
import AdminPaginationFooter from '../../../components/admin/AdminPaginationFooter.jsx';
import AdminSearchBox from '../../../components/admin/AdminSearchBox.jsx';
import AdminTableAction from '../../../components/admin/AdminTableAction.jsx';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../../../utils/imageUtils';

import '../../../styles/alumni-pages.css';
import '../../../styles/events.css';
import '../../../styles/posts.css';
import '../../../styles/institute-layout.css';

const defaultConfig = {
  breadcrumb: 'Posts Feed',
  title: 'Feed Management',
  subtitle: 'Review published content, keep media tidy, and manage feed activity in one place.',
  addPath: '/add-post',
  editPath: '/edit-post',
};

export default function PortalPostsPage({ config = {} }) {
  const options = { ...defaultConfig, ...config };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState('');
  const [alert, setAlert] = useState(false);
  const [alert2, setAlert2] = useState(false);
  const rows = [10, 20, 30];

  useEffect(() => {
    const id = user?._id;
    if (!id) {
      navigate('/login', { replace: true });
      return;
    }
    setOwnerId(id);
  }, [navigate, user?._id]);

  const fetchPosts = useCallback(() => {
    if (!ownerId) return;
    axiosInstance.get(`/api/getPostById/${ownerId}`)
      .then((response) => setPosts(response.data.success ? (response.data.data || []) : []))
      .catch(() => setPosts([]));
  }, [ownerId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setDisplayPosts(posts); }, [posts]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPost = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
  const pageNumbers = Array.from({ length: Math.ceil(displayPosts.length / postsPerPage) }, (_, i) => i + 1);
  const hasPosts = displayPosts.length > 0;
  const showingFrom = hasPosts ? indexOfFirstPost + 1 : 0;
  const showingTo = hasPosts ? Math.min(indexOfLastPost, displayPosts.length) : 0;

  const handleSearch = (value) => {
    const search = value.toLowerCase();
    setDisplayPosts(posts.filter((post) => (post.description || '').toLowerCase().includes(search)));
    setCurrentPage(1);
  };

  const deletePost = () => {
    axiosInstance.delete(`/api/deletePost/${deleteId}`)
      .then((res) => {
        if (res.data.success) {
          setAlert(false);
          setAlert2(true);
          fetchPosts();
        }
      })
      .catch(() => {});
  };

  const formatDate = (timestamp) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const minutesDiff = Math.floor(Math.abs(now - messageTime) / 60000);
    if (minutesDiff < 1) return 'Just now';
    if (minutesDiff < 60) return `${minutesDiff}m ago`;
    if (messageTime.toDateString() === now.toDateString()) return `Today ${messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Fragment>
      <AppShell contentClassName="posts-content-wrapper">
          <div className="posts-container">
            <div className="d-sm-flex align-items-center justify-content-between mb-4 institute-page-header">
              <div className="institute-page-header-copy">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-1 posts-breadcrumb institute-page-breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="posts-breadcrumb-link">Home</Link></li>
                    <li className="breadcrumb-item active">{options.breadcrumb}</li>
                  </ol>
                </nav>
                <h1 className="page-header posts-header mb-0 institute-page-title">{options.title}</h1>
                <p className="institute-page-subtitle">{options.subtitle}</p>
              </div>
              <Link to={options.addPath} className="btn btn-primary shadow-sm posts-create-btn institute-page-actions">
                <i className="fa fa-plus-circle mr-2"></i> Create New Post
              </Link>
            </div>

            <div className="posts-scroll-area">
              <div className="admin-card post-main-card">
                <div className="card-body p-0 bg-white">
                  <div className="admin-toolbar posts-toolbar">
                    <AdminSearchBox placeholder="Search posts..." onChange={handleSearch} />
                    <div className="d-flex align-items-center mt-2 mt-md-0">
                      <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                      <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold posts-rows-select" value={postsPerPage} onChange={(e) => setPostsPerPage(Number(e.target.value))}>
                        {rows.map((value) => <option key={value} value={value}>{value} Rows</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle posts-table mb-0">
                      <thead><tr><th className="pl-4">#</th><th>Media</th><th>Content</th><th>Date</th><th className="text-center">Actions</th></tr></thead>
                      <tbody>
                        {currentPost.length > 0 ? currentPost.map((post, index) => (
                          <tr key={post._id || index} className="post-row">
                            <td className="pl-4 align-middle"><span className="post-id-badge">{(indexOfFirstPost + index + 1).toString().padStart(2, '0')}</span></td>
                            <td className="align-middle"><img src={getImageUrl(post.photos?.[0], FALLBACK_IMAGES.post)} className="post-media-preview" alt="post" onError={getImageOnError(FALLBACK_IMAGES.post)} /></td>
                            <td className="align-middle"><div className="post-desc-clamp">{post.description}</div></td>
                            <td className="align-middle"><span className="post-date-badge"><i className="far fa-clock mr-1"></i> {formatDate(post.date)}</span></td>
                            <td className="align-middle admin-table-actions-cell">
                              <div className="admin-table-actions" aria-label="Post actions">
                                <Link to={options.editPath} state={{ post }} className="admin-table-action" aria-label="Edit post" title="Edit post"><i className="fa fa-edit"></i></Link>
                                <AdminTableAction variant="danger" icon="trash-alt" label="Delete post" onClick={() => { setDeleteId(post._id); setAlert(true); }} />
                              </div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan="5" className="text-center py-5 text-muted">No posts found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <AdminPaginationFooter showingFrom={showingFrom} showingTo={showingTo} total={displayPosts.length} currentPage={currentPage} pageNumbers={pageNumbers} onPageChange={setCurrentPage} />
              </div>
            </div>
          </div>
      </AppShell>

        {alert && <SweetAlert danger showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Delete Post?" onConfirm={deletePost} onCancel={() => setAlert(false)}>This post will be removed permanently.</SweetAlert>}
        {alert2 && <SweetAlert success title="Deleted" onConfirm={() => setAlert2(false)}>Post deleted successfully.</SweetAlert>}
    </Fragment>
  );
}
