/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// Import the shared modern CSS for consistent single-page layout
import '../../styles/edit-event.css';

const EditFinancialAid = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const themeColor = '#2563EB';

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    
    const [data, setData] = useState({
        id: "",
        aid: "",
        claimed: "",
        description: "",
        dueDate: "",
        name: "" // For display purposes
    });

    const getAidData = () => {
        if (location.state && location.state.data) {
            const state = location.state.data;
            setData({
                id: state._id,
                name: state.name || "Student",
                aid: state.aid || "",
                claimed: state.claimed || "",
                description: state.description || "",
                dueDate: state.dueDate ? new Date(state.dueDate).toISOString().split('T')[0] : ""
            });
        }
    }

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        
        getAidData();
    }, []);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/editFinancialAid`,
                data: {
                    _id: data.id,
                    aid: data.aid,
                    claimed: data.claimed,
                    description: data.description,
                    dueDate: data.dueDate
                },
            }).then(() => {
                setDisable(false);
                toast.success("Scholarship Details Updated");
                setTimeout(() => navigate('/financial-aid'), 1500);
            }).catch(() => {
                setDisable(false);
                toast.error("Failed to update details");
            });
        }
    };

    const validate = () => {
        let errs = {};
        if (!data.aid) errs.aid_err = "Aid amount is required";
        if (!data.claimed) errs.claimed_err = "Claimed amount is required";
        if (!data.dueDate) errs.dueDate_err = "Due date is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <Fragment>
            <ToastContainer theme="colored" />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content edit-event-wrapper">
                    <div className="edit-event-container">
                        
                        {/* Header Section */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header mb-0" style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Edit Scholarship</h1>
                                <p className="text-muted small mb-0">Updating financial aid records for: <strong>{data.name}</strong></p>
                            </div>
                            <Link to="/financial-aid" className="btn btn-light btn-sm font-weight-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                <i className="fa fa-arrow-left mr-1"></i> Back to Listing
                            </Link>
                        </div>

                        <div className="event-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="form-body-scroll">
                                    <div className="row h-100">
                                        {/* LEFT COLUMN: Numeric Data */}
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="row">
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Total (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-modern" 
                                                        name="aid" 
                                                        value={data.aid} 
                                                        onChange={handleChange} 
                                                    />
                                                    {errors.aid_err && <small className="text-danger font-weight-bold">{errors.aid_err}</small>}
                                                </div>
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Claimed (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-modern" 
                                                        name="claimed" 
                                                        value={data.claimed} 
                                                        onChange={handleChange} 
                                                    />
                                                    {errors.claimed_err && <small className="text-danger font-weight-bold">{errors.claimed_err}</small>}
                                                </div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Application Due Date</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control form-control-modern" 
                                                    name="dueDate" 
                                                    value={data.dueDate} 
                                                    onChange={handleChange} 
                                                />
                                                {errors.dueDate_err && <small className="text-danger font-weight-bold">{errors.dueDate_err}</small>}
                                            </div>

                                            <div className="p-3 rounded" style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #2563EB' }}>
                                                <small className="text-primary font-weight-bold d-block mb-1">Status Summary</small>
                                                <small className="text-muted">
                                                    Current balance: ₹{(parseFloat(data.aid || 0) - parseFloat(data.claimed || 0)).toLocaleString()} remaining.
                                                </small>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: Description & Terms */}
                                        <div className="col-md-7 pl-md-4 mt-4 mt-md-0 d-flex flex-column">
                                            <div className="form-group flex-grow-1 d-flex flex-column">
                                                <label className="form-label-modern">Description & Terms</label>
                                                <textarea 
                                                    className="form-control form-control-modern flex-grow-1" 
                                                    name="description" 
                                                    value={data.description} 
                                                    onChange={handleChange}
                                                    placeholder="Enter scholarship details..."
                                                    style={{ resize: 'none', minHeight: '200px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STICKY FOOTER ACTIONS */}
                                <div className="form-footer-sticky">
                                    <Link to="/financial-aid" className="btn btn-link text-muted mr-3 font-weight-bold">Discard Changes</Link>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable} style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', fontWeight: '700' }}>
                                        {disable ? 'Updating...' : 'Save & Update Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    )
}

export default EditFinancialAid;