/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const Events = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    let navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const rows = [10, 20, 30];
    const [eventsPerPage, setEventsPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

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
                setEvents(response.data.data || []);
            }).catch(() => {
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
            let search = e.target.value;
            setDisplayEvents(events.filter(
                (elem) =>
                    elem.title.toLowerCase().includes(search.toLowerCase()) ||
                    elem.venue.toLowerCase().includes(search.toLowerCase())
            ));
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
            }
        })
    }

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
                            
                            {/* Search & Filter Bar */}
                            <div className="p-4 border-bottom bg-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group bg-light border rounded-pill px-3 py-1 shadow-none">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-transparent border-0"><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search events by title or venue..." onChange={handleSearch} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                        <span className="text-muted mr-2">Show</span>
                                        <select className="custom-select custom-select-sm w-auto border-0 shadow-sm" style={{borderRadius: '5px'}} onChange={(e) => setEventsPerPage(Number(e.target.value))}>
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
                                            <th className="border-0 pl-4">Sr. No.</th>
                                            <th className="border-0">Banner</th>
                                            <th className="border-0">Event Details</th>
                                            <th className="border-0">Description</th>
                                            <th className="border-0">Date & Time</th>
                                            <th className="border-0 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEvents.length > 0 ? currentEvents.map((elem, index) =>
                                            <tr key={index}>
                                                <td className="pl-4 align-middle text-muted">{indexOfFirstEvent + index + 1}</td>
                                                <td className="align-middle">
                                                    {elem.photos === '' || elem.photos === undefined || elem.photos.length <= 0 ? 
                                                        <img src='assets/img/Events-amico.png' alt='default event' style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} /> 
                                                        : 
                                                        <img src={`${ALTHUB_API_URL}${elem.photos[0]}`} alt='event-img' style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                                    }
                                                </td>
                                                <td className="align-middle">
                                                    <div className="font-weight-bold text-dark">{elem.title}</div>
                                                    <div className="small text-muted"><i className="fa fa-map-marker-alt mr-1"></i> {elem.venue}</div>
                                                </td>
                                                <td className="align-middle">
                                                    <span className="text-muted" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '300px'}}>
                                                        {elem.description}
                                                    </span>
                                                </td>
                                                <td className="align-middle">
                                                    <div className="text-dark font-weight-bold">{elem.date ? elem.date.split('T')[0] : 'N/A'}</div>
                                                    <div className="small text-muted">{elem.date ? elem.date.split('T')[1] : 'N/A'}</div>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm mr-2" 
                                                            onClick={() => { navigate('/edit-event', { state: { data: elem } }) }} 
                                                            title="Edit">
                                                        <i className="fa fa-pencil-alt" style={{ color: themeColor }}></i>
                                                    </button>
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm" 
                                                            onClick={() => { handleDeleteEvent(elem._id) }} 
                                                            title="Delete">
                                                        <i className="fa fa-trash-alt text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : <tr><td colSpan="6" className="text-center p-5 text-muted">No events found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Footer */}
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

                {alert === true && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        title="Delete Event?"
                        onConfirm={DeleteEvent}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                    >
                        You will not be able to recover this event data.
                    </SweetAlert>
                )}
                
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Deleted Successfully!"
                        onConfirm={() => { setAlert2(false); getEventsData(); }}
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