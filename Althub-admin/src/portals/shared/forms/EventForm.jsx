import { useAuth } from '../../../auth/session';
import React, { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import axiosInstance from '../../../api/client';
import AppShell from '../../../layouts/AppShell.jsx';

import '../../../styles/edit-event.css';

const defaultConfig = {
  title: 'Create New Event',
  subtitle: 'Fill in the details to publish a new institutional event.',
  backPath: '/events',
  successPath: '/events',
};

export default function EventForm({ config = {} }) {
  const options = { ...defaultConfig, ...config };
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editingEvent = location.state?.data || null;
  const isEdit = options.mode === 'edit';
  const [ownerId, setOwnerId] = useState(null);
  const [errors, setErrors] = useState({});
  const [disable, setDisable] = useState(false);
  const [data, setData] = useState({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    date: editingEvent?.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : '',
    venue: editingEvent?.venue || '',
  });
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const id = user?._id;
    if (!id) {
      navigate('/login', { replace: true });
      return;
    }
    if (isEdit && !editingEvent?._id) {
      navigate(options.backPath, { replace: true });
      return;
    }
    setOwnerId(id);
  }, [editingEvent?._id, isEdit, navigate, options.backPath, user?._id]);

  const validate = () => {
    const nextErrors = {};
    if (!data.title) nextErrors.name_err = 'Title is required';
    if (!data.description) nextErrors.description_err = 'Description is required';
    if (!data.date) nextErrors.date_err = 'Date is required';
    if (!data.venue) nextErrors.venue_err = 'Venue is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const imgChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    setFileList(validFiles);
    if (validFiles.length !== selectedFiles.length) toast.error('Only JPG, PNG, GIF, and WEBP files are allowed.');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!ownerId) {
      toast.error('Session expired. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }
    if (!validate()) return;

    setDisable(true);
    const body = new FormData();
    body.append('organizerid', ownerId);
    body.append('title', data.title);
    body.append('description', data.description);
    body.append('date', data.date);
    body.append('venue', data.venue);
    fileList.forEach((file) => body.append('photos', file));

    if (isEdit && editingEvent?._id) body.append('id', editingEvent._id);
    const request = isEdit && editingEvent?._id
      ? axiosInstance.post(`/api/editEvent`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
      : axiosInstance.post(`/api/addEvent`, body, { headers: { 'Content-Type': 'multipart/form-data' } });

    request
      .then((res) => {
        if (res.data.success) {
          toast.success(isEdit ? 'Event updated successfully' : 'Event published successfully');
          setTimeout(() => navigate(options.successPath), 1200);
        }
      })
      .catch(() => {
        setDisable(false);
        toast.error('Submission failed. Check if you are logged in.');
      });
  };

  return (
    <Fragment>
      <ToastContainer theme="colored" />
      <AppShell contentClassName="edit-event-wrapper">
          <div className="edit-event-container">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h1 className="page-header edit-event-title mb-0">{isEdit ? (options.editTitle || 'Edit Event') : options.title}</h1>
                <p className="text-muted small mb-0">{options.subtitle}</p>
              </div>
              <Link to={options.backPath} className="btn btn-light btn-sm font-weight-bold shadow-sm edit-event-back-btn">
                <i className="fa fa-arrow-left mr-1"></i> Back
              </Link>
            </div>

            <div className="event-form-card">
              <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                <div className="form-body-scroll">
                  <div className="row">
                    <div className="col-md-5 border-right pr-md-4">
                      <div className="form-group mb-4">
                        <label className="form-label-modern">Event Title</label>
                        <input type="text" className="form-control form-control-modern" name="title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
                        {errors.name_err && <small className="text-danger">{errors.name_err}</small>}
                      </div>

                      <div className="row">
                        <div className="col-6 form-group mb-4">
                          <label className="form-label-modern">Date & Time</label>
                          <input type="datetime-local" className="form-control form-control-modern" name="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
                          {errors.date_err && <small className="text-danger">{errors.date_err}</small>}
                        </div>
                        <div className="col-6 form-group mb-4">
                          <label className="form-label-modern">Venue</label>
                          <input type="text" className="form-control form-control-modern" name="venue" value={data.venue} onChange={(e) => setData({ ...data, venue: e.target.value })} />
                          {errors.venue_err && <small className="text-danger">{errors.venue_err}</small>}
                        </div>
                      </div>

                      <div className="form-group mb-0">
                        <label className="form-label-modern">Full Description</label>
                        <textarea className="form-control form-control-modern" rows="7" name="description" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
                        {errors.description_err && <small className="text-danger">{errors.description_err}</small>}
                      </div>
                    </div>

                    <div className="col-md-7 pl-md-4">
                      <label className="form-label-modern">Event Media</label>
                      <div className="upload-drop-zone">
                        <input type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp" className="d-none" id="addImgUpload" onChange={imgChange} />
                        <label htmlFor="addImgUpload" className="text-center cursor-pointer mb-0">
                          <div className="mb-3"><i className="fa fa-images fa-3x text-primary opacity-25"></i></div>
                          <h6 className="font-weight-bold">Click to upload photos</h6>
                        </label>
                        <div className="preview-grid">
                          {fileList.map((file, index) => <img key={index} src={window.URL.createObjectURL(file)} className="preview-thumbnail" alt="preview" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-footer-sticky">
                  <button type="submit" className="btn btn-primary px-5 edit-event-save-btn" disabled={disable}>
                    {disable ? 'Saving...' : (isEdit ? 'Save Event Changes' : 'Publish Event Now')}
                  </button>
                </div>
              </form>
            </div>
          </div>
      </AppShell>
    </Fragment>
  );
}
