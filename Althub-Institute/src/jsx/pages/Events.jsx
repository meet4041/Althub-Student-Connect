/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// Import external CSS
import '../../styles/events.css';

const Events = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const token = localStorage.getItem('token'); // Get token from local storage
    let navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const rows = [10, 20, 50, 100]; 
    const [eventsPerPage, setEventsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const themeColor = '#2563EB';

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
                headers: { 'Authorization': `Bearer ${token}` } // Added Authorization Header
            }).then((response) => {
                if(response.data.success) {
                    setEvents(response.data.data || []);
                }
            }).catch((err) => {
                console.error("Fetch Error:", err);
                setEvents([]);
            });
        }
    }, [institute_Id, token]);

    useEffect(() => {
        if (institute_Id) getEventsData();
    }, [institute_Id, getEventsData]);

    useEffect(() => { setDisplayEvents(events); }, [events]);

    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = displayEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const pageNumbers = Array.from({ length: Math.ceil(displayEvents.length / eventsPerPage) }, (_, i) => i + 1);

    const paginate = (num) => setCurrentPage(num);

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setDisplayEvents(events.filter(elem => 
            elem.title.toLowerCase().includes(search) || elem.venue.toLowerCase().includes(search)
        ));
        setCurrentPage(1); 
    };

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteEvent = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteEvent = () => {
        axios.delete(`${ALTHUB_API_URL}/api/deleteEvent/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` } // Added Authorization Header
        })
        .then((res) => {
            if (res.data.success) {
                setAlert(false);
                setAlert2(true);
                setSelectedEvent(null);
                // The refresh happens in the success alert onConfirm
            }
        }).catch(err => console.error("Delete Error:", err));
    };

    const isUpcoming = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) > new Date();
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content events-content-wrapper">
                    <div className="events-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Events</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px' }}>Events Management</h1>
                            </div>
                            
                            <Link to="/add-event" className="btn btn-primary shadow-sm mt-3 mt-sm-0" 
                                  style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', padding: '10px 22px', fontWeight: '700' }}>
                                <i className="fa fa-plus-circle mr-2"></i> Create Event
                            </Link>
                        </div>

                        <div className="card border-0 shadow-sm event-card">
                            <div className="card-body p-0 bg-white">
                                
                                <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <div className="input-group" style={{ maxWidth: '400px' }}>
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                        </div>
                                        <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search events or venues..." onChange={handleSearch} />
                                    </div>
                                    <div className="d-flex align-items-center mt-2 mt-md-0">
                                        <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                        <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold" style={{ borderRadius: '6px', width: '110px', height: '38px' }} value={eventsPerPage} onChange={(e) => { setEventsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                            {rows.map(v => <option key={v} value={v}>{v} Rows</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                <th className="border-0 pl-4 py-3" style={{ width: '80px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>#</th>
                                                <th className="border-0 py-3" style={{ width: '100px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Preview</th>
                                                <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Event Details</th>
                                                <th className="border-0 text-center py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Date & Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentEvents.length > 0 ? currentEvents.map((elem, index) => (
                                                <tr key={elem._id || index} className="event-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(elem)}>
                                                    <td className="pl-4 align-middle">
                                                        <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: '700', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                                                            {(indexOfFirstEvent + index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <img src={elem.photos && elem.photos.length > 0 ? `${ALTHUB_API_URL}${elem.photos[0]}` : 'assets/img/Events-amico.png'} className="event-thumbnail" alt="event" />
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="font-weight-bold text-dark mb-0" style={{ fontSize: '15px' }}>{elem.title}</div>
                                                        <div className="text-muted small"><i className="fa fa-map-marker-alt mr-1"></i> {elem.venue}</div>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <div className="date-box mb-1">{elem.date ? new Date(elem.date).toLocaleDateString() : 'N/A'}</div>
                                                        {isUpcoming(elem.date) && <div><span className="badge-upcoming">UPCOMING</span></div>}
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center p-5 text-muted">No events found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="p-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <p className="text-muted small mb-3 mb-md-0 font-weight-bold">Showing {indexOfFirstEvent + 1} - {Math.min(indexOfLastEvent, displayEvents.length)} of {displayEvents.length} events</p>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light mr-2" onClick={(e) => { e.stopPropagation(); paginate(currentPage - 1); }} style={{ borderRadius: '6px', color: themeColor, width: '36px', textAlign: 'center' }}><i className="fa fa-chevron-left"></i></button>
                                            </li>
                                            {pageNumbers.map(num => (
                                                <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                    <button className="page-link border-0 mx-1" onClick={(e) => { e.stopPropagation(); paginate(num); }} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px', width: '36px' } : { backgroundColor: '#F8FAFC', color: themeColor, borderRadius: '6px', width: '36px' }}>{num}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                                                <button className="page-link border-0 bg-light ml-2" onClick={(e) => { e.stopPropagation(); paginate(currentPage + 1); }} style={{ borderRadius: '6px', color: themeColor, width: '36px', textAlign: 'center' }}><i className="fa fa-chevron-right"></i></button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedEvent && (
                    <div className="modal fade show modal-backdrop-custom" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content event-modal-content shadow-lg">
                                <div className="modal-body p-0">
                                    <div className="text-right p-3 position-absolute" style={{ right: 0, zIndex: 10 }}>
                                        <button type="button" className="close text-dark opacity-50" onClick={() => setSelectedEvent(null)}>&times;</button>
                                    </div>
                                    <div className="row no-gutters">
                                        <div className="col-md-5">
                                            <img src={selectedEvent.photos && selectedEvent.photos.length > 0 ? `${ALTHUB_API_URL}${selectedEvent.photos[0]}` : 'assets/img/Events-amico.png'} className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '300px' }} alt="Banner" />
                                        </div>
                                        <div className="col-md-7 p-5 bg-white">
                                            <h3 className="font-weight-bold mb-3" style={{ color: '#1E293B' }}>{selectedEvent.title}</h3>
                                            <div className="bg-light p-3 rounded mb-4">
                                                <div className="mb-2 small"><i className="fa fa-calendar-alt event-detail-icon"></i> <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</div>
                                                <div className="small"><i className="fa fa-map-marker-alt event-detail-icon"></i> <strong>Venue:</strong> {selectedEvent.venue}</div>
                                            </div>
                                            <p className="small text-muted mb-4" style={{ lineHeight: '1.6' }}>{selectedEvent.description || 'No description provided.'}</p>
                                            <div className="d-flex">
                                                <button className="btn btn-primary flex-grow-1 mr-2" onClick={() => navigate('/edit-event', { state: { data: selectedEvent } })} style={{ borderRadius: '8px', fontWeight: '600' }}><i className="fa fa-edit mr-2"></i> Edit</button>
                                                <button className="btn btn-outline-danger" onClick={() => handleDeleteEvent(selectedEvent._id)} style={{ borderRadius: '8px' }}><i className="fa fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Confirm" onConfirm={DeleteEvent} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Deleted" onConfirm={() => { setAlert2(false); getEventsData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    );
};

export default Events;