/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

import '../../styles/edit-event.css';

const AddFinancialHelp = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);
    const themeColor = '#2563EB';
    const token = localStorage.getItem('token');

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    
    // Updated state keys to match model requirements clearly
    const [data, setData] = useState({
        name: "", 
        aid: "", 
        claimed: "", 
        description: "", 
        image: "", 
        dueDate: ""
    });

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");

        setInstitute_Id(localStorage.getItem("AlmaPlus_institute_Id"));
        setInstitute_Name(localStorage.getItem("AlmaPlus_institute_Name"));
    }, []);

    useEffect(() => {
        if (!institute_Id) return;
        axios.get(`${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((res) => setUsers(res.data.data || []));
    }, [institute_Id, token]);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleNameChange = (e) => {
        const selectedName = e.target.value;
        const selectedUser = users.find(u => `${u.fname} ${u.lname || ''}`.trim() === selectedName);
        let newImage = data.image;

        if (selectedUser && selectedUser.profilepic) {
            newImage = selectedUser.profilepic;
        }
        setData({ ...data, name: selectedName, image: newImage });
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        var body = new FormData();
        body.append("profilepic", file);
        axios.post(`${ALTHUB_API_URL}/api/uploadUserImage`, body, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((res) => {
            if (res.data.success) setData({ ...data, image: res.data.data.url });
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);

            // MAPPING TO EXACT DATABASE FIELDS
            const payload = {
                instituteid: institute_Id,
                institutename: institute_Name,
                name: data.name,            // Student Name
                aid: data.aid,              // Scholarship Type (e.g. Merit)
                claimed: data.claimed,      // Amount (e.g. 5000)
                description: data.description,
                dueDate: data.dueDate,
                image: data.image,          // Student Profile Pic
                date: new Date()
            };

            axios.post(`${ALTHUB_API_URL}/api/addFinancialAid`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then((res) => {
                if(res.data.success) {
                    toast.success("Scholarship record created");
                    setTimeout(() => navigate('/financial-aid'), 1500);
                }
            }).catch((err) => {
                console.error(err);
                toast.error("Failed to save entry");
                setDisable(false);
            });
        }
    };

    const validate = () => {
        let errs = {};
        if (!data.name) errs.name_err = "Student name is required";
        if (!data.aid) errs.aid_err = "Aid type is required";
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
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header mb-0" style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Create Scholarship Record</h1>
                                <p className="text-muted small mb-0">Institute: <strong>{institute_Name}</strong></p>
                            </div>
                            <Link to="/financial-aid" className="btn btn-light btn-sm font-weight-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                <i className="fa fa-arrow-left mr-1"></i> Back
                            </Link>
                        </div>

                        <div className="event-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="form-body-scroll">
                                    <div className="row">
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Student Search</label>
                                                <input type="text" className="form-control form-control-modern" list="studentList" placeholder="Search students..." name="name" value={data.name} onChange={handleNameChange} />
                                                <datalist id="studentList">
                                                    {users.map((user) => (
                                                        <option key={user._id} value={`${user.fname} ${user.lname || ''}`.trim()}>{user.email}</option>
                                                    ))}
                                                </datalist>
                                                {errors.name_err && <small className="text-danger font-weight-bold">{errors.name_err}</small>}
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Total (₹)</label>
                                                    <input type='text' className="form-control form-control-modern" placeholder="e.g. Merit" name="aid" value={data.aid} onChange={handleChange} />
                                                    {errors.aid_err && <small className="text-danger">{errors.aid_err}</small>}
                                                </div>
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Claimed (₹)</label>
                                                    <input type='number' className="form-control form-control-modern" placeholder="Amount" name="claimed" value={data.claimed} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Due Date</label>
                                                <input type="date" className="form-control form-control-modern" name="dueDate" value={data.dueDate} onChange={handleChange} />
                                                {errors.dueDate_err && <small className="text-danger">{errors.dueDate_err}</small>}
                                            </div>

                                            <div className="form-group mb-0">
                                                <label className="form-label-modern">Description</label>
                                                <textarea className="form-control form-control-modern" rows="3" name="description" value={data.description} onChange={handleChange} placeholder="Notes..." />
                                            </div>
                                        </div>

                                        <div className="col-md-7 pl-md-4 text-center py-4">
                                            <label className="form-label-modern d-block text-left">Beneficiary Photo</label>
                                            <div className="upload-drop-zone h-auto py-5 border rounded">
                                                <input type="file" id="imageInput" className='d-none' onChange={handleImgChange} />
                                                <label htmlFor="imageInput" className="cursor-pointer">
                                                    <div className="mb-3">
                                                        {data.image ? <img src={`${ALTHUB_API_URL}${data.image}`} className="rounded-circle shadow" style={{ width: '150px', height: '150px', objectFit: 'cover' }} /> : <i className="fa fa-user-circle fa-5x text-light"></i>}
                                                    </div>
                                                    <h6 className="font-weight-bold">Change Image</h6>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-footer-sticky p-3 bg-white border-top text-right">
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable} style={{ borderRadius: '10px', fontWeight: '700' }}>
                                        {disable ? 'Saving...' : 'Publish Scholarship'}
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

export default AddFinancialHelp;