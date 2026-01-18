/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

// Import the shared modern CSS
import '../../styles/edit-event.css';

const AddFinancialHelp = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);
    const themeColor = '#2563EB'; 

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        name: "", aid: "", claimed: "", description: "", image: "", dueDate: ""
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
        if (!institute_Name) return;
        const token = localStorage.getItem('token');
        axios.get(`${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((res) => setUsers(res.data.data || []));
    }, [institute_Name]);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleNameChange = (e) => {
        const selectedName = e.target.value;
        const selectedUser = users.find(u => `${u.fname} ${u.lname || ''}`.trim() === selectedName);
        let newImage = data.image;

        if (selectedUser && selectedUser.profilepic) {
            newImage = selectedUser.profilepic;
            toast.info("Student profile auto-synced");
        }
        setData({ ...data, name: selectedName, image: newImage });
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (!file || !file.name.match(/\.(jpg|jpeg|png|gif)$/i)) return;

        var body = new FormData();
        body.append("profilepic", file); 
        axios.post(`${ALTHUB_API_URL}/api/uploadUserImage`, body)
            .then((res) => {
                if (res.data.success) setData({ ...data, image: res.data.data.url });
            });
    };

    const submitHandler = (e) => {
        e.preventDefault(); 
        if (validate()) {
            setDisable(true);
            axios.post(`${ALTHUB_API_URL}/api/addFinancialAid`, {
                institutename: institute_Name, ...data
            }).then(() => {
                toast.success("Scholarship added successfully");
                setTimeout(() => navigate('/financial-aid'), 1500);
            }).catch(() => setDisable(false));
        }
    };

    const validate = () => {
        let errs = {};
        if (!data.name) errs.name_err = "Student name is required";
        if (!data.aid) errs.aid_err = "Enter aid amount";
        if (!data.dueDate) errs.dueDate_err = "Enter due date";
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
                        
                        {/* Split Header */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="page-header mb-0" style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Create Scholarship Record</h1>
                                <p className="text-muted small mb-0">Assign financial aid or scholarships to students in the directory</p>
                            </div>
                            <Link to="/financial-aid" className="btn btn-light btn-sm font-weight-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                <i className="fa fa-arrow-left mr-1"></i> Back to Listing
                            </Link>
                        </div>

                        <div className="event-form-card">
                            <form onSubmit={submitHandler} className="d-flex flex-column h-100">
                                <div className="form-body-scroll">
                                    <div className="row">
                                        {/* LEFT: Student & Amount Info */}
                                        <div className="col-md-5 border-right pr-md-4">
                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Student Search</label>
                                                <input type="text" className="form-control form-control-modern" list="studentList" placeholder="Type student name..." name="name" value={data.name} onChange={handleNameChange} autoComplete="off" />
                                                <datalist id="studentList">
                                                    {users.map((user) => (
                                                        <option key={user._id} value={`${user.fname} ${user.lname || ''}`.trim()}>{user.email}</option>
                                                    ))}
                                                </datalist>
                                                {errors.name_err && <small className="text-danger font-weight-bold">{errors.name_err}</small>}
                                            </div>

                                            <div className="row">
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Total Aid (₹)</label>
                                                    <input type='number' className="form-control form-control-modern" placeholder="0.00" name="aid" value={data.aid} onChange={handleChange} />
                                                </div>
                                                <div className="col-6 form-group mb-4">
                                                    <label className="form-label-modern">Claimed (₹)</label>
                                                    <input type='number' className="form-control form-control-modern" placeholder="0.00" name="claimed" value={data.claimed} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="form-label-modern">Due Date</label>
                                                <input type="date" className="form-control form-control-modern" name="dueDate" value={data.dueDate} onChange={handleChange} />
                                                {errors.dueDate_err && <small className="text-danger font-weight-bold">{errors.dueDate_err}</small>}
                                            </div>

                                            <div className="form-group mb-0">
                                                <label className="form-label-modern">Description / Terms</label>
                                                <textarea className="form-control form-control-modern" rows="4" placeholder="Briefly explain the scholarship terms..." name="description" value={data.description} onChange={handleChange} style={{ resize: 'none' }} />
                                            </div>
                                        </div>

                                        {/* RIGHT: Image & Profile Sync */}
                                        <div className="col-md-7 pl-md-4 mt-4 mt-md-0">
                                            <label className="form-label-modern">Student Identification Image</label>
                                            <div className="upload-drop-zone h-auto py-5">
                                                <input type="file" id="imageInput" className='d-none' name="image" onChange={handleImgChange} />
                                                <label htmlFor="imageInput" className="cursor-pointer">
                                                    <div className="mb-3">
                                                        {data.image ? (
                                                            <img src={`${ALTHUB_API_URL}${data.image}`} alt="Preview" className="preview-thumbnail" style={{ width: '120px', height: '120px' }} />
                                                        ) : (
                                                            <i className="fa fa-user-circle fa-4x text-primary opacity-25"></i>
                                                        )}
                                                    </div>
                                                    <h6 className="font-weight-bold text-dark">Upload Custom Student Photo</h6>
                                                    <p className="text-muted small">JPG or PNG. Auto-fills from profile if available.</p>
                                                </label>
                                            </div>
                                            <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #2563EB' }}>
                                                <small className="text-primary font-weight-bold d-block mb-1">Database Sync Active</small>
                                                <small className="text-muted">Selecting a student from the dropdown will automatically fetch their registered profile picture to ensure accuracy.</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Footer */}
                                <div className="form-footer-sticky">
                                    <button type="button" className="btn btn-link text-muted mr-3 font-weight-bold" onClick={() => setData({name:"", aid:"", claimed:"", description:"", image:"", dueDate:""})}>Reset Form</button>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={disable} style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', fontWeight: '700' }}>
                                        {disable ? 'Processing...' : 'Publish Scholarship'}
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