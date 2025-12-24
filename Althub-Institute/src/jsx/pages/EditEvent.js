/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const EditEvent = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        id: "",
        title: "",
        description: "",
        date: "",
        venue: "",
    });
    const location = useLocation();
    
    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const geteventData = () => {
        if (location.state && location.state.data) {
            const state = location.state.data;
            setData({
                id: state._id,
                title: state.title,
                description: state.description,
                date: state.date,
                venue: state.venue,
            });
        }
    }

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        
        geteventData();
    }, []);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const [fileList, setFileList] = useState(null);
    const files = fileList ? [...fileList] : [];
    const imgChange = (e) => {
        setFileList(e.target.files);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const body = new FormData();
            body.append("id", data.id);
            body.append("title", data.title);
            body.append("description", data.description);
            body.append("date", data.date);
            body.append("venue", data.venue);
            files.forEach((file, i) => {
                body.append(`photos`, file, file.name);
            });

            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/editEvent`,
                data: body,
                headers: {
                    "content-type": "multipart/form-data"
                },
            }).then((response) => {
                setDisable(false);
                toast.success("Event Updated Successfully");
                setTimeout(() => {
                    navigate('/events');
                }, 1200);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to update event");
            });
        }
    };

    const validate = () => {
        let input = data;
        let errors = {};
        let isValid = true;

        if (!input["title"]) {
            isValid = false;
            errors["name_err"] = "Please Enter Title";
        }
        if (!input["description"]) {
            isValid = false;
            errors["description_err"] = "Please Enter Event Description";
        }
        if (!input["date"]) {
            isValid = false;
            errors["date_err"] = "Please Enter Date";
        }
        if (!input["venue"]) {
            isValid = false;
            errors["venue_err"] = "Please Enter Venue";
        }
        setErrors(errors);
        return isValid;
    }

    // Helper to safely format date for input value
    const getFormattedDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split('T')[0];
    }

    return (
        <Fragment>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                        <li className="breadcrumb-item"><Link to="/events" style={{color: themeColor}}>Events</Link></li>
                        <li className="breadcrumb-item active">Edit Event</li>
                    </ol>
                    <h1 className="page-header">Edit Event Details</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                                    <h4 className="card-title mb-0 text-dark">Event Information</h4>
                                    <Link to="/events" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Cancel
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler} >
                                        <fieldset>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputName">Event Title</label>
                                                <input type="text" className="form-control" id="exampleInputName" placeholder="Enter Event Title" name="title" value={data.title} onChange={handleChange} style={{height: '45px'}} />
                                                <div className="text-danger small mt-1">{errors.name_err}</div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputdesc">Description</label>
                                                {/* Changed to textarea for better editing */}
                                                <textarea className="form-control" rows="4" id="exampleInputdesc" placeholder="Enter Event Description" name="description" value={data.description} onChange={handleChange} />
                                                <div className="text-danger small mt-1">{errors.description_err}</div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="exampleInputdate">Date</label>
                                                    <input type='date' className="form-control" id="exampleInputdate" name="date" value={getFormattedDate(data.date)} onChange={handleChange} style={{height: '45px'}} />
                                                    <div className="text-danger small mt-1">{errors.date_err}</div>
                                                </div>

                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="exampleInputvenue">Venue</label>
                                                    <input className="form-control" id="exampleInputvenue" placeholder="Enter Event venue" name="venue" value={data.venue} onChange={handleChange} style={{height: '45px'}} />
                                                    <div className="text-danger small mt-1">{errors.venue_err}</div>
                                                </div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold" htmlFor="exampleInputfile">Update Photos</label>
                                                <div className="custom-file-container p-3 border rounded bg-light">
                                                    <input type='file' multiple className="form-control-file" id="exampleInputfile" name="photos" onChange={imgChange} />
                                                    <small className="text-muted d-block mt-2">Uploading new photos will append to existing ones.</small>
                                                    
                                                    {files.length > 0 && (
                                                        <div className="selected-img row mt-3 px-2">
                                                            {files.map((elem, index) =>
                                                                <div className='col-auto mb-2' key={index}>
                                                                    <div className="shadow-sm rounded overflow-hidden" style={{width: '80px', height: '80px'}}>
                                                                        <img src={window.URL.createObjectURL(elem)} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <button type="submit" className="btn btn-primary px-4" disabled={disable} 
                                                        style={{minWidth: '120px', backgroundColor: themeColor, borderColor: themeColor}}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Updating...</> : 'Update Event'}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    )
}

export default EditEvent;