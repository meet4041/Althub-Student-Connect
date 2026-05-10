import { useAuth } from '../../../auth/session';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { ALTHUB_API_URL } from '../../../config/baseURL';
import axiosInstance from '../../../api/client';
import AppShell from '../../../layouts/AppShell.jsx';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../../../utils/imageUtils';

import '../../../styles/alumni-pages.css';
import '../../../styles/events.css';
import '../../../styles/institute-layout.css';

const defaultConfig = {
  breadcrumb: 'Events',
  title: 'Events Management',
  subtitle: 'Create, review, and manage events with a consistent control layout.',
  addPath: '/add-event',
  editPath: '/edit-event',
  emptyText: 'Create your first event to get started',
};

export default function PortalEventsPage({ config = {} }) {
  const options = { ...defaultConfig, ...config };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState(null);
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filterMode, setFilterMode] = useState('all');
  const [eventsPerPage, setEventsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [alert, setAlert] = useState(false);
  const [alert2, setAlert2] = useState(false);
  const rows = [8, 16, 24, 48];

  useEffect(() => {
    const id = user?._id;
    if (!id) {
      navigate('/login', { replace: true });
      return;
    }
    setOwnerId(id);
  }, [navigate, user?._id]);

  const fetchEvents = useCallback(() => {
    if (!ownerId) return;
    axiosInstance.get(`/api/getEventsByInstitute/${ownerId}`)
      .then((response) => {
        setEvents(response.data.success ? (response.data.data || []) : []);
      })
      .catch(() => setEvents([]));
  }, [ownerId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setCurrentPage(1); }, [filterMode, searchTerm]);

  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredByDate = events.filter((event) => {
    if (filterMode === 'upcoming') return isUpcoming(event.date);
    if (filterMode === 'past') return !isUpcoming(event.date);
    return true;
  });

  const displayEvents = filteredByDate.filter((event) =>
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = displayEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const pageNumbers = Array.from({ length: Math.ceil(displayEvents.length / eventsPerPage) }, (_, i) => i + 1);
  const showingFrom = displayEvents.length ? indexOfFirstEvent + 1 : 0;
  const showingTo = displayEvents.length ? Math.min(indexOfLastEvent, displayEvents.length) : 0;
  const upcomingCount = events.filter((event) => isUpcoming(event.date)).length;

  const paginate = (num) => {
    if (!pageNumbers.length) {
      setCurrentPage(1);
      return;
    }
    setCurrentPage(Math.min(Math.max(num, 1), pageNumbers.length));
  };

  const handleDeleteEvent = (id) => {
    setDeleteId(id);
    setAlert(true);
  };

  const deleteEvent = () => {
    axiosInstance.delete(`/api/deleteEvent/${deleteId}`)
      .then((res) => {
        if (res.data.success) {
          setAlert(false);
          setAlert2(true);
          setSelectedEvent(null);
          fetchEvents();
        }
      })
      .catch(() => {});
  };

  return (
    <Fragment>
      <AppShell contentClassName="events-content-wrapper">
          <div className="events-container">
            <div className="events-header institute-page-header">
              <div className="institute-page-header-copy">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-1 institute-page-breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="dashboard-breadcrumb-link">Home</Link></li>
                    <li className="breadcrumb-item active">{options.breadcrumb}</li>
                  </ol>
                </nav>
                <h1 className="events-title institute-page-title">{options.title}</h1>
                <p className="events-subtitle institute-page-subtitle">{options.subtitle}</p>
              </div>
              <Link to={options.addPath} className="btn-events-create institute-page-actions">
                <i className="fa fa-plus-circle mr-2"></i> Create Event
              </Link>
            </div>

            <div className="events-stats-strip">
              <div className="events-stat-card">
                <span className="events-stat-value">{events.length}</span>
                <span className="events-stat-label">Total Events</span>
              </div>
              <div className="events-stat-card events-stat-accent">
                <span className="events-stat-value">{upcomingCount}</span>
                <span className="events-stat-label">Upcoming</span>
              </div>
            </div>

            <div className="events-toolbar">
              <div className="events-search-wrap">
                <i className="fa fa-search events-search-icon"></i>
                <input className="events-search-input" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="events-filter-tabs">
                {['all', 'upcoming', 'past'].map((mode) => (
                  <button key={mode} className={`events-filter-tab ${filterMode === mode ? 'active' : ''}`} onClick={() => setFilterMode(mode)}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <div className="events-view-toggle">
                <button className={`events-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><i className="fa fa-th-large"></i></button>
                <button className={`events-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}><i className="fa fa-list"></i></button>
              </div>
            </div>

            <div className="events-content-card institute-page-card">
              <div className="events-content-area">
                {viewMode === 'grid' ? (
                  <div className="events-grid">
                    {currentEvents.length > 0 ? currentEvents.map((event, index) => (
                      <div key={event._id || index} className="events-card" onClick={() => setSelectedEvent(event)}>
                        <div className="events-card-image-wrap">
                          <img src={getImageUrl(event.photos?.[0], FALLBACK_IMAGES.event)} className="events-card-image" alt={event.title || 'Event'} onError={getImageOnError(FALLBACK_IMAGES.event)} />
                          <div className="events-card-overlay"></div>
                          <span className={`events-card-date-badge ${isUpcoming(event.date) ? 'upcoming' : 'past'}`}>{formatDateShort(event.date)}</span>
                          {isUpcoming(event.date) && <span className="events-card-live-badge">Upcoming</span>}
                        </div>
                        <div className="events-card-body">
                          <h3 className="events-card-title">{event.title || 'Untitled Event'}</h3>
                          <p className="events-card-venue"><i className="fa fa-map-marker-alt"></i> {event.venue || 'Venue TBD'}</p>
                          {event.description && <p className="events-card-desc">{event.description.slice(0, 80)}{event.description.length > 80 ? '...' : ''}</p>}
                        </div>
                      </div>
                    )) : (
                      <div className="events-empty">
                        <div className="events-empty-icon"><i className="fa fa-calendar-plus"></i></div>
                        <h3>No events found</h3>
                        <p>{options.emptyText}</p>
                        <Link to={options.addPath} className="btn-events-create btn-events-empty">Create Event</Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="events-table-wrap">
                    <table className="events-table">
                      <thead><tr><th>#</th><th>Preview</th><th>Event Details</th><th>Date & Status</th></tr></thead>
                      <tbody>
                        {currentEvents.length > 0 ? currentEvents.map((event, index) => (
                          <tr key={event._id || index} onClick={() => setSelectedEvent(event)}>
                            <td><span className="events-table-num">{(indexOfFirstEvent + index + 1).toString().padStart(2, '0')}</span></td>
                            <td><img src={getImageUrl(event.photos?.[0], FALLBACK_IMAGES.event)} className="events-table-thumb" alt="" onError={getImageOnError(FALLBACK_IMAGES.event)} /></td>
                            <td><div className="events-table-title">{event.title || 'Untitled'}</div><div className="events-table-venue"><i className="fa fa-map-marker-alt"></i> {event.venue || '-'}</div></td>
                            <td className="text-center"><div className="events-table-date">{formatDate(event.date)}</div>{isUpcoming(event.date) && <span className="events-badge-upcoming">Upcoming</span>}</td>
                          </tr>
                        )) : <tr><td colSpan="4" className="events-table-empty">No events found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {displayEvents.length > 0 && (
                <div className="events-pagination">
                  <p className="events-pagination-info">Showing {showingFrom}-{showingTo} of {displayEvents.length}</p>
                  <div className="events-pagination-controls">
                    <select className="events-rows-select" value={eventsPerPage} onChange={(e) => { setEventsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                      {rows.map((value) => <option key={value} value={value}>{value} per page</option>)}
                    </select>
                    <nav>
                      <button className="events-page-btn" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}><i className="fa fa-chevron-left"></i></button>
                      {pageNumbers.slice(0, 5).map((num) => <button key={num} className={`events-page-btn ${currentPage === num ? 'active' : ''}`} onClick={() => paginate(num)}>{num}</button>)}
                      {pageNumbers.length > 5 && <span className="events-page-dots">...</span>}
                      <button className="events-page-btn" disabled={currentPage === pageNumbers.length || !pageNumbers.length} onClick={() => paginate(currentPage + 1)}><i className="fa fa-chevron-right"></i></button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
      </AppShell>

        {selectedEvent && (
          <div className="events-modal-backdrop" onClick={() => setSelectedEvent(null)}>
            <div className="events-modal" onClick={(e) => e.stopPropagation()}>
              <button className="events-modal-close" onClick={() => setSelectedEvent(null)}><i className="fa fa-times"></i></button>
              <div className="events-modal-layout">
                <div className="events-modal-image">
                  <img src={getImageUrl(selectedEvent.photos?.[0], FALLBACK_IMAGES.event)} alt={selectedEvent.title || 'Event'} onError={getImageOnError(FALLBACK_IMAGES.event)} />
                  <div className="events-modal-badges">
                    <span className={`events-modal-date ${isUpcoming(selectedEvent.date) ? 'upcoming' : 'past'}`}>{formatDate(selectedEvent.date)}</span>
                    {isUpcoming(selectedEvent.date) && <span className="events-modal-live">Upcoming</span>}
                  </div>
                </div>
                <div className="events-modal-body">
                  <h2 className="events-modal-title">{selectedEvent.title || 'Untitled Event'}</h2>
                  <div className="events-modal-meta">
                    <span><i className="fa fa-calendar-alt"></i> {formatDate(selectedEvent.date)}</span>
                    <span><i className="fa fa-map-marker-alt"></i> {selectedEvent.venue || 'Venue TBD'}</span>
                  </div>
                  <div className="events-modal-desc">{selectedEvent.description || 'No description provided.'}</div>
                  <div className="events-modal-actions">
                    <button className="events-modal-btn primary" onClick={() => navigate(options.editPath, { state: { data: selectedEvent } })}><i className="fa fa-edit mr-2"></i> Edit Event</button>
                    <button className="events-modal-btn danger" onClick={() => handleDeleteEvent(selectedEvent._id)}><i className="fa fa-trash-alt mr-2"></i> Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {alert && <SweetAlert danger showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Delete Event?" onConfirm={deleteEvent} onCancel={() => setAlert(false)}>This event will be removed permanently.</SweetAlert>}
        {alert2 && <SweetAlert success title="Deleted" onConfirm={() => setAlert2(false)}>Event deleted successfully.</SweetAlert>}
    </Fragment>
  );
}
