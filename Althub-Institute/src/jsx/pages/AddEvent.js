/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const AddEvent = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const navigate = useNavigate();
    
    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

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

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        title: "",
        description: "",
        date: "",
        venue: "",
    });

    const [fileList, setFileList] = useState(null);
    const files = fileList ? [...fileList] : [];

    const imgChange = (e) => {
        setFileList(e.target.files);
    }

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setData({
            title: "",
            description: "",
            date: "",
            venue: "",
        });
        setFileList(null);
        // Clear file input value visually
        document.getElementById("exampleInputfile").value = "";
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate() && institute_Id) {
            setDisable(true)
            const body = new FormData();
            body.append("organizerid", institute_Id)
            body.append("title", data.title);
            body.append("description", data.description);
            body.append("date", data.date);
            body.append("venue", data.venue);
            files.forEach((file, i) => {
                body.append(`photos`, file, file.name);
            });
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/addEvent`,
                data: body,
                headers: {
                    "content-type": "multipart/form-data"
                },
            }).then((response) => {
                handleReset();
                setDisable(false);
                toast.success("Event Added Successfully");
                setTimeout(() => {
                    navigate('/events');
                }, 1500);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to add event");
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
                        <li className="breadcrumb-item active">Add Event</li>
                    </ol>
                    <h1 className="page-header">Create New Event</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8"> {/* Increased width for better form layout */}
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                                    <h4 className="card-title mb-0 text-dark">Event Details</h4>
                                    <Link to="/events" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Back
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <fieldset>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputName">Event Title</label>
                                                <input type="text" className="form-control" id="exampleInputName" placeholder="e.g. Annual Tech Symposium" name="title" value={data.title} onChange={handleChange} style={{height: '45px'}} />
                                                <div className="text-danger small mt-1">{errors.name_err}</div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputdesc">Description</label>
                                                <textarea className="form-control" rows="4" id="exampleInputdesc" placeholder="Enter detailed event description..." name="description" value={data.description} onChange={handleChange}></textarea>
                                                <div className="text-danger small mt-1">{errors.description_err}</div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="exampleInputdate">Date & Time</label>
                                                    <input type='datetime-local' className="form-control" id="exampleInputdate" name="date" value={data.date} onChange={handleChange} style={{height: '45px'}} />
                                                    <div className="text-danger small mt-1">{errors.date_err}</div>
                                                </div>

                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="exampleInputvenue">Venue</label>
                                                    <input className="form-control" id="exampleInputvenue" placeholder="e.g. Main Auditorium" name="venue" value={data.venue} onChange={handleChange} style={{height: '45px'}} />
                                                    <div className="text-danger small mt-1">{errors.venue_err}</div>
                                                </div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold" htmlFor="exampleInputfile">Upload Photos</label>
                                                <div className="custom-file-container p-3 border rounded bg-light">
                                                    <input type='file' multiple className="form-control-file" id="exampleInputfile" name="photos" onChange={imgChange} />
                                                    <small className="text-muted d-block mt-2">Supported formats: JPG, PNG. Max size: 5MB.</small>
                                                    
                                                    {files.length > 0 && (
                                                        <div className="selected-img row mt-3 px-2">
                                                            {files.map((elem, index) =>
                                                                <div className='col-auto mb-2' key={index}>
                                                                    <div className="shadow-sm rounded overflow-hidden" style={{width: '100px', height: '100px'}}>
                                                                        <img src={window.URL.createObjectURL(elem)} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <button type="reset" className="btn btn-light mr-2" onClick={handleReset} style={{minWidth: '100px'}}>Reset</button>
                                                <button type="submit" className="btn btn-primary" disabled={disable} 
                                                        style={{minWidth: '120px', backgroundColor: themeColor, borderColor: themeColor}}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...</> : 'Publish Event'}
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

export default AddEvent;