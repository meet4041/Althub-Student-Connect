/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const Events = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    let navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const rows = [10, 20, 50, 100]; 
    const [eventsPerPage, setEventsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Theme constant
    const themeColor = '#2563EB';

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

    const getEventsData = useCallback(() => {
        if (institute_Id) {
            axios({
                method: "get",
                url: `${ALTHUB_API_URL}/api/getEventsByInstitute/${institute_Id}`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then((response) => {
                if(response.data.success) {
                    setEvents(response.data.data || []);
                }
            }).catch((err) => {
                console.error("Error fetching events:", err);
                setEvents([]);
            });
        }
    }, [institute_Id]);

    useEffect(() => {
        if (institute_Id) {
            getEventsData();
        }
    }, [institute_Id, getEventsData]);

    useEffect(() => {
        setDisplayEvents(events);
    }, [events]);

    // Pagination Logic
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = displayEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayEvents.length / eventsPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => {
        setCurrentPage(num);
    }

    const handleSearch = (e) => {
        if (e.target.value) {
            let search = e.target.value.toLowerCase();
            setDisplayEvents(events.filter(
                (elem) =>
                    elem.title.toLowerCase().includes(search) ||
                    elem.venue.toLowerCase().includes(search)
            ));
            setCurrentPage(1); 
        } else {
            setDisplayEvents(events)
        }
    }

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteEvent = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteEvent = () => {
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteEvent/${deleteId}`,
        }).then((response) => {
            if (response.data.success === true) {
                getEventsData();
                setDeleteId('');
                setAlert(false);
                setAlert2(true);
                setSelectedEvent(null);
            }
        }).catch(err => {
             console.error(err);
             setAlert(false);
        });
    }

    const openEventDetails = (event) => {
        setSelectedEvent(event);
    }

    const closeEventDetails = () => {
        setSelectedEvent(null);
    }

    // [NEW] Helper to check if event is in the future
    const isUpcoming = (dateString) => {
        if (!dateString) return false;
        const eventDate = new Date(dateString);
        const now = new Date();
        return eventDate > now;
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                                <li className="breadcrumb-item active">Events</li>
                            </ol>
                            <h1 className="page-header mb-0">Events Management</h1>
                        </div>
                        <Link to="/add-event" className="btn btn-primary btn-lg shadow-sm" 
                              style={{borderRadius: '8px', backgroundColor: themeColor, borderColor: themeColor}}>
                            <i className="fa fa-plus mr-2"></i> Create Event
                        </Link>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-0">
                            
                            <div className="p-4 border-bottom bg-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-light border rounded-pill px-3 py-1 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search events..." onChange={handleSearch} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                        <span className="text-muted mr-2">Show</span>
                                        <select 
                                            className="custom-select custom-select-sm w-auto border-0 shadow-sm" 
                                            style={{borderRadius: '5px', cursor:'pointer'}} 
                                            onChange={(e) => {
                                                setEventsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            value={eventsPerPage}
                                        >
                                            {rows.map(value =>
                                                <option key={value} value={value}>{value} Events</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{backgroundColor: '#F1F5F9', color: '#334155'}}>
                                        <tr>
                                            <th className="border-0 pl-4" style={{width: '120px'}}>Image</th>
                                            <th className="border-0">Event Name</th>
                                            <th className="border-0 text-center">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEvents.length > 0 ? currentEvents.map((elem, index) =>
                                            <tr key={elem._id || index}>
                                                <td className="pl-4 align-middle">
                                                    {elem.photos && elem.photos.length > 0 ? 
                                                        <img src={`${ALTHUB_API_URL}${elem.photos[0]}`} alt='event-img' className="shadow-sm" style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                                                        : 
                                                        <img src='assets/img/Events-amico.png' alt='default event' className="shadow-sm" style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} /> 
                                                    }
                                                </td>
                                                
                                                <td className="align-middle">
                                                    <div 
                                                        onClick={() => openEventDetails(elem)}
                                                        className="font-weight-bold text-dark"
                                                        style={{ cursor: 'pointer', fontSize: '15px' }}
                                                        onMouseOver={(e) => e.currentTarget.style.color = themeColor}
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#2d353c'}
                                                    >
                                                        {elem.title}
                                                    </div>
                                                    <small className="text-muted">Click to view details</small>
                                                </td>

                                                {/* [UPDATED] Date Column with Upcoming Badge */}
                                                <td className="align-middle text-center">
                                                    <span className="badge p-2 font-weight-normal" style={{backgroundColor: '#EFF6FF', color: themeColor}}>
                                                        {elem.date ? new Date(elem.date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    {isUpcoming(elem.date) && (
                                                        <div className="mt-1">
                                                            <span className="badge badge-pill badge-success shadow-sm" style={{fontSize: '10px', padding: '4px 8px'}}>
                                                                Upcoming
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : <tr><td colSpan="3" className="text-center p-5 text-muted">No events found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">
                                    Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, displayEvents.length)} of {displayEvents.length} events
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

                {/* Event Details Modal */}
                {selectedEvent && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '15px'}}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title font-weight-bold ml-2 mt-2">Event Details</h5>
                                    <button type="button" className="close" onClick={closeEventDetails} style={{outline: 'none'}}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row">
                                        <div className="col-md-5 mb-3 mb-md-0">
                                            {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                                                <img 
                                                    src={`${ALTHUB_API_URL}${selectedEvent.photos[0]}`} 
                                                    alt="Event Banner" 
                                                    className="img-fluid shadow-sm w-100" 
                                                    style={{borderRadius: '10px', objectFit: 'cover', height: '250px'}}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{height: '250px', borderRadius: '10px'}}>
                                                    No Image Available
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-7">
                                            <h3 className="font-weight-bold text-dark mb-3">
                                                {selectedEvent.title}
                                                {isUpcoming(selectedEvent.date) && (
                                                    <span className="badge badge-success ml-2" style={{fontSize: '12px', verticalAlign: 'middle'}}>Upcoming</span>
                                                )}
                                            </h3>
                                            
                                            <div className="mb-3">
                                                <label className="text-muted small font-weight-bold mb-0">DATE & TIME</label>
                                                <div className="d-flex align-items-center">
                                                    <i className="far fa-calendar-alt mr-2" style={{color: themeColor}}></i>
                                                    <span className="text-dark font-weight-bold mr-3">
                                                        {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    <i className="far fa-clock mr-2" style={{color: themeColor}}></i>
                                                    <span className="text-dark font-weight-bold">
                                                        {selectedEvent.date ? new Date(selectedEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted small font-weight-bold mb-0">VENUE</label>
                                                <div className="text-dark">
                                                    <i className="fa fa-map-marker-alt mr-2" style={{color: themeColor}}></i>
                                                    {selectedEvent.venue || 'No venue provided'}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted small font-weight-bold mb-0">DESCRIPTION</label>
                                                <p className="text-dark" style={{whiteSpace: 'pre-wrap'}}>
                                                    {selectedEvent.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0" style={{borderRadius: '0 0 15px 15px'}}>
                                    <button type="button" className="btn btn-white shadow-sm font-weight-bold" onClick={closeEventDetails}>Close</button>
                                    
                                    <button className="btn btn-primary shadow-sm font-weight-bold ml-2" 
                                            onClick={() => { navigate('/edit-event', { state: { data: selectedEvent } }) }} 
                                            style={{backgroundColor: themeColor, borderColor: themeColor}}>
                                        <i className="fa fa-pencil-alt mr-2"></i> Edit
                                    </button>
                                    
                                    <button className="btn btn-danger shadow-sm font-weight-bold ml-2" 
                                            onClick={() => handleDeleteEvent(selectedEvent._id)}>
                                        <i className="fa fa-trash-alt mr-2"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {alert === true && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        title="Delete Event?"
                        onConfirm={DeleteEvent}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                        style={{zIndex: 2000}} 
                    >
                        You will not be able to recover this event data.
                    </SweetAlert>
                )}
                
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Deleted Successfully!"
                        onConfirm={() => { setAlert2(false); getEventsData(); }}
                        style={{zIndex: 2000}}
                    >
                        The event has been removed from the listing.
                    </SweetAlert>
                )}
                <Footer />
            </div>
        </Fragment>
    )
}

export default Events;