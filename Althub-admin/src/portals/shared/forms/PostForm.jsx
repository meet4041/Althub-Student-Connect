import { useAuth } from '../../../auth/session';
import React, { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import axiosInstance from '../../../api/client';
import AppShell from '../../../layouts/AppShell.jsx';

import '../../../styles/add-post.css';

const defaultConfig = {
  title: 'Create Community Post',
  subtitle: 'Share an update with your students.',
  backPath: '/posts',
  successPath: '/posts',
  placeholder: 'Share an update with your students...',
};

export default function PostForm({ config = {} }) {
  const options = { ...defaultConfig, ...config };
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editingPost = location.state?.post || null;
  const isEdit = options.mode === 'edit';
  const [ownerId, setOwnerId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({ description: editingPost?.description || '' });
  const [fileList, setFileList] = useState([]);
  const [disable, setDisable] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const id = user?._id;
    if (!id) {
      navigate('/login', { replace: true });
      return;
    }
    if (isEdit && !editingPost?._id) {
      navigate(options.backPath, { replace: true });
      return;
    }
    setOwnerId(id);
    axiosInstance.get(`/api/getInstituteById/${id}`)
      .then((res) => { if (res.data.success) setProfile(res.data.data); })
      .catch(() => {});
  }, [editingPost?._id, isEdit, navigate, options.backPath, user?._id]);

  const imgChange = (e) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter((file) => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    setFileList(validFiles);
    if (validFiles.length !== selected.length) toast.error('Only JPG, PNG, GIF, and WEBP files are allowed.');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!ownerId) {
      toast.error('Session expired. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }
    if (!data.description) {
      setErrors({ desc: 'Content description is required' });
      return;
    }

    setDisable(true);
    const body = new FormData();
    body.append('senderid', ownerId);
    body.append('userid', ownerId);
    body.append('description', data.description);
    body.append('fname', profile?.institutename || user?.name || 'Institute');
    body.append('companyname', profile?.institutename || user?.name || '');
    body.append('profilepic', profile?.profilepic || user?.profilepic || '');
    body.append('title', 'Update');
    fileList.forEach((file) => body.append('photos', file));

    if (isEdit && editingPost?._id) body.append('id', editingPost._id);
    const request = isEdit && editingPost?._id
      ? axiosInstance.post(`/api/editPost`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
      : axiosInstance.post(`/api/addPost`, body, { headers: { 'Content-Type': 'multipart/form-data' } });

    request
      .then(() => {
        toast.success(isEdit ? 'Post updated successfully' : 'Post published to community feed');
        setTimeout(() => navigate(options.successPath), 1200);
      })
      .catch(() => {
        setDisable(false);
        toast.error('Failed to upload post. Please check your connection.');
      });
  };

  return (
    <Fragment>
      <ToastContainer theme="colored" />
      <AppShell contentClassName="add-post-wrapper">
          <div className="add-post-container">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h1 className="page-header admin-form-title mb-0">{isEdit ? (options.editTitle || 'Edit Post') : options.title}</h1>
                <p className="text-muted small mb-0">{options.subtitle}</p>
              </div>
              <Link to={options.backPath} className="btn btn-light btn-sm font-weight-bold shadow-sm admin-form-back-btn">
                <i className="fa fa-arrow-left mr-1"></i> Back
              </Link>
            </div>

            <div className="post-form-card">
              <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                <div className="post-body-scroll">
                  <div className="row h-100">
                    <div className="col-md-5 border-right pr-md-4">
                      <div className="form-group h-100 d-flex flex-column">
                        <label className="form-label-saas">Post Content & Description</label>
                        <textarea className="form-control form-control-saas flex-grow-1 admin-post-textarea" placeholder={options.placeholder} name="description" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
                        {errors.desc && <small className="text-danger font-weight-bold mt-2">{errors.desc}</small>}
                      </div>
                    </div>

                    <div className="col-md-7 pl-md-4">
                      <label className="form-label-saas">Media Attachments</label>
                      <div className="post-upload-zone">
                        <input type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp" className="d-none" id="postImgUp" onChange={imgChange} />
                        <label htmlFor="postImgUp" className="cursor-pointer">
                          <div className="mb-3"><i className="fa fa-images fa-3x text-primary opacity-25"></i></div>
                          <h6 className="font-weight-bold text-dark">Add photos to your post</h6>
                        </label>
                        <div className="post-preview-grid">
                          {fileList.map((file, index) => <img key={index} src={window.URL.createObjectURL(file)} className="post-preview-img" alt="preview" />)}
                        </div>
                        {isEdit && editingPost?.photos?.length > 0 && (
                          <small className="text-muted d-block mt-3">Existing media will be kept. New files are added to this post.</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="post-footer-actions">
                  <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable}>
                    {disable ? 'Saving...' : (isEdit ? 'Save Post Changes' : 'Publish Post Now')}
                  </button>
                </div>
              </form>
            </div>
          </div>
      </AppShell>
    </Fragment>
  );
}
