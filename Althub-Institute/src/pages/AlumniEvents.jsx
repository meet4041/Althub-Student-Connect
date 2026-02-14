/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layouts/Loader.jsx';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

import '../styles/events.css';

const AlumniEvents = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'upcoming' | 'past'
    const rows = [8, 16, 24, 48];
    const [eventsPerPage, setEventsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        const id = localStorage.getItem("AlmaPlus_institute_Id");
        setInstitute_Id(id);
    }, []);

    const getEventsData = useCallback(() => {
        if (institute_Id) {
            axios({
                method: "get",
                url: `${ALTHUB_API_URL}/api/getEventsByInstitute/${institute_Id}`,
                headers: { 'Authorization': `Bearer ${token}` }
            }).then((response) => {
                if (response.data.success) {
                    setEvents(response.data.data || []);
                }
            }).catch(() => setEvents([]));
        }
    }, [institute_Id, token]);

    useEffect(() => {
        if (institute_Id) getEventsData();
    }, [institute_Id, getEventsData]);

    const isUpcoming = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) > new Date();
    };

    const filteredByDate = events.filter(e => {
        if (filterMode === 'upcoming') return isUpcoming(e.date);
        if (filterMode === 'past') return !isUpcoming(e.date);
        return true;
    });

    const displayEvents = filteredByDate.filter(elem =>
        (elem.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (elem.venue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (elem.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => { setCurrentPage(1); }, [filterMode, searchTerm]);

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = displayEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const pageNumbers = Array.from({ length: Math.ceil(displayEvents.length / eventsPerPage) }, (_, i) => i + 1);
    const upcomingCount = events.filter(e => isUpcoming(e.date)).length;

    const paginate = (num) => setCurrentPage(num);

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteEvent = (id) => {
        setDeleteId(id);
        setAlert(true);
    };

    const DeleteEvent = () => {
        axios.delete(`${ALTHUB_API_URL}/api/deleteEvent/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                if (res.data.success) {
                    setAlert(false);
                    setAlert2(true);
                    setSelectedEvent(null);
                }
            }).catch(() => {});
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content events-content-wrapper">
                    <div className="events-container">
                        <div className="events-header">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1">
                                        <li className="breadcrumb-item"><Link to="/alumni-members">Home</Link></li>
                                        <li className="breadcrumb-item active">Alumni Events</li>
                                    </ol>
                                </nav>
                                <h1 className="events-title">
                                    Alumni Events
                                </h1>
                            </div>
                            <Link to="/alumni-add-event" className="btn-events-create">
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
                                <input
                                    type="text"
                                    className="events-search-input"
                                    placeholder="Search events, venues..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="events-filter-tabs">
                                {['all', 'upcoming', 'past'].map(mode => (
                                    <button
                                        key={mode}
                                        className={`events-filter-tab ${filterMode === mode ? 'active' : ''}`}
                                        onClick={() => setFilterMode(mode)}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
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
                                        {currentEvents.length > 0 ? currentEvents.map((elem, index) => (
                                            <div
                                                key={elem._id || index}
                                                className="events-card"
                                                onClick={() => setSelectedEvent(elem)}
                                            >
                                                <div className="events-card-image-wrap">
                                                    <img
                                                        src={getImageUrl(elem.photos?.[0], FALLBACK_IMAGES.event)}
                                                        className="events-card-image"
                                                        alt={elem.title}
                                                        onError={getImageOnError(FALLBACK_IMAGES.event)}
                                                    />
                                                    <div className="events-card-overlay"></div>
                                                    <span className={`events-card-date-badge ${isUpcoming(elem.date) ? 'upcoming' : 'past'}`}>
                                                        {formatDateShort(elem.date)}
                                                    </span>
                                                    {isUpcoming(elem.date) && <span className="events-card-live-badge">Upcoming</span>}
                                                </div>
                                                <div className="events-card-body">
                                                    <h3 className="events-card-title">{elem.title || 'Untitled Event'}</h3>
                                                    <p className="events-card-venue">
                                                        <i className="fa fa-map-marker-alt"></i> {elem.venue || 'Venue TBD'}
                                                    </p>
                                                    {elem.description && <p className="events-card-desc">{(elem.description || '').slice(0, 80)}{(elem.description || '').length > 80 ? '...' : ''}</p>}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="events-empty">
                                                <div className="events-empty-icon"><i className="fa fa-calendar-plus"></i></div>
                                                <h3>No events found</h3>
                                                <p>Create your first alumni event</p>
                                                <Link to="/alumni-add-event" className="btn-events-create btn-events-empty">Create Event</Link>
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
                                                    <th>Event Details</th>
                                                    <th>Date & Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentEvents.length > 0 ? currentEvents.map((elem, index) => (
                                                    <tr key={elem._id || index} onClick={() => setSelectedEvent(elem)}>
                                                        <td><span className="events-table-num">{(indexOfFirstEvent + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td>
                                                            <img
                                                                src={getImageUrl(elem.photos?.[0], FALLBACK_IMAGES.event)}
                                                                className="events-table-thumb"
                                                                alt=""
                                                                onError={getImageOnError(FALLBACK_IMAGES.event)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="events-table-title">{elem.title || 'Untitled'}</div>
                                                            <div className="events-table-venue"><i className="fa fa-map-marker-alt"></i> {elem.venue || '-'}</div>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="events-table-date">{formatDate(elem.date)}</div>
                                                            {isUpcoming(elem.date) && <span className="events-badge-upcoming">Upcoming</span>}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="events-table-empty">No events found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {displayEvents.length > 0 && (
                                <div className="events-pagination">
                                    <p className="events-pagination-info">
                                        Showing {indexOfFirstEvent + 1}–{Math.min(indexOfLastEvent, displayEvents.length)} of {displayEvents.length}
                                    </p>
                                    <div className="events-pagination-controls">
                                        <select
                                            className="events-rows-select"
                                            value={eventsPerPage}
                                            onChange={(e) => { setEventsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                                                >{num}</button>
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

                {selectedEvent && (
                    <div className="events-modal-backdrop" onClick={() => setSelectedEvent(null)}>
                        <div className="events-modal" onClick={e => e.stopPropagation()}>
                            <button className="events-modal-close" onClick={() => setSelectedEvent(null)} aria-label="Close">
                                <i className="fa fa-times"></i>
                            </button>
                            <div className="events-modal-layout">
                                <div className="events-modal-image">
                                    <img
                                        src={getImageUrl(selectedEvent.photos?.[0], FALLBACK_IMAGES.event)}
                                        alt={selectedEvent.title}
                                        onError={getImageOnError(FALLBACK_IMAGES.event)}
                                    />
                                    <div className="events-modal-image-overlay"></div>
                                    <div className="events-modal-badges">
                                        <span className={`events-modal-date ${isUpcoming(selectedEvent.date) ? 'upcoming' : ''}`}>
                                            {formatDate(selectedEvent.date)}
                                        </span>
                                        {isUpcoming(selectedEvent.date) && <span className="events-modal-live">Upcoming</span>}
                                    </div>
                                </div>
                                <div className="events-modal-body">
                                    <h2 className="events-modal-title">{selectedEvent.title}</h2>
                                    <div className="events-modal-meta">
                                        <span><i className="fa fa-calendar-alt"></i> {formatDate(selectedEvent.date)}</span>
                                        <span><i className="fa fa-map-marker-alt"></i> {selectedEvent.venue || 'Venue TBD'}</span>
                                    </div>
                                    <div className="events-modal-desc">
                                        {selectedEvent.description || 'No description provided.'}
                                    </div>
                                    <div className="events-modal-actions">
                                        <button className="events-modal-btn primary" onClick={() => navigate('/alumni-edit-event', { state: { data: selectedEvent } })}>
                                            <i className="fa fa-edit mr-2"></i> Edit Event
                                        </button>
                                        <button className="events-modal-btn danger" onClick={() => handleDeleteEvent(selectedEvent._id)}>
                                            <i className="fa fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Delete Event?" onConfirm={DeleteEvent} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Event Deleted" onConfirm={() => { setAlert2(false); getEventsData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    );
};

export default AlumniEvents;
