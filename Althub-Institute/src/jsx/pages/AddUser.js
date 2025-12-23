/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const AddUser = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
    }, []);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        number: ""
    });

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (errors[`${e.target.name}_err`]) {
            setErrors({ ...errors, [`${e.target.name}_err`]: "" });
        }
    };

    const handleReset = () => {
        setData({ name: "", email: "", number: "" });
        setErrors({});
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate()) {
            setDisable(true);
            const token = localStorage.getItem('token');
            
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/inviteUser`,
                headers: { 'Authorization': `Bearer ${token}` }, // Security Header
                data: {
                    fname: data.name,
                    phone: data.number,
                    email: data.email
                },
            }).then((response) => {
                setDisable(false);
                if (response.data.success) {
                    toast.success("Invitation sent successfully!");
                    setTimeout(() => navigate('/users'), 1500);
                } else {
                    toast.error(response.data.msg || "Failed to invite user");
                }
            }).catch((error) => {
                setDisable(false);
                toast.error(error.response?.data?.msg || "Server Error");
            });
        }
    };

    const validate = () => {
        let errs = {};
        let isValid = true;

        if (!data.name.trim()) {
            isValid = false;
            errs["name_err"] = "Full name is required";
        }
        if (!data.email.trim()) {
            isValid = false;
            errs["email_err"] = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            isValid = false;
            errs["email_err"] = "Invalid email format";
        }
        if (!data.number.trim()) {
            isValid = false;
            errs["number_err"] = "Phone number is required";
        }
        setErrors(errs);
        return isValid;
    }

    return (
        <Fragment>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    {/* Header & Breadcrumb Section */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                <li className="breadcrumb-item"><Link to="/users">Users</Link></li>
                                <li className="breadcrumb-item active">Invite Member</li>
                            </ol>
                            <h1 className="page-header mb-0">Invite New Member</h1>
                        </div>
                        <Link to="/users" className="btn btn-white btn-md shadow-sm border-0" style={{ borderRadius: '8px' }}>
                            <i className="fa fa-arrow-left mr-2 text-muted"></i> Back to List
                        </Link>
                    </div>

                    <div className="row">
                        <div className="col-xl-6 col-lg-8">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-dark text-white p-3 border-0" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                    <h4 className="card-title mb-0">Member Information</h4>
                                    <p className="text-white-50 small mb-0">A temporary password will be sent to the user via email.</p>
                                </div>

                                <div className="card-body p-4 bg-white">
                                    <form onSubmit={submitHandler}>
                                        {/* Name Input */}
                                        <div className="form-group mb-4">
                                            <label className="text-dark font-weight-bold small">FULL NAME</label>
                                            <div className="input-group border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text bg-transparent border-0"><i className="fa fa-user text-success"></i></span>
                                                </div>
                                                <input type="text" className="form-control bg-transparent border-0 py-4" placeholder="Enter Full Name" name="name" value={data.name} onChange={handleChange} />
                                            </div>
                                            {errors.name_err && <div className="text-danger small mt-1">{errors.name_err}</div>}
                                        </div>

                                        {/* Email Input */}
                                        <div className="form-group mb-4">
                                            <label className="text-dark font-weight-bold small">EMAIL ADDRESS</label>
                                            <div className="input-group border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text bg-transparent border-0"><i className="fa fa-envelope text-success"></i></span>
                                                </div>
                                                <input type="email" className="form-control bg-transparent border-0 py-4" placeholder="user@example.com" name="email" value={data.email} onChange={handleChange} />
                                            </div>
                                            {errors.email_err && <div className="text-danger small mt-1">{errors.email_err}</div>}
                                        </div>

                                        {/* Phone Input */}
                                        <div className="form-group mb-4">
                                            <label className="text-dark font-weight-bold small">PHONE NUMBER</label>
                                            <div className="input-group border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text bg-transparent border-0"><i className="fa fa-phone text-success"></i></span>
                                                </div>
                                                <input type="text" className="form-control bg-transparent border-0 py-4" placeholder="+1 234 567 890" name="number" value={data.number} onChange={handleChange} />
                                            </div>
                                            {errors.number_err && <div className="text-danger small mt-1">{errors.number_err}</div>}
                                        </div>

                                        <hr className="mt-5 mb-4" />

                                        {/* Action Buttons */}
                                        <div className="d-flex align-items-center">
                                            <button type="submit" className="btn btn-success px-4 py-2 shadow-sm font-weight-bold" disabled={disable} style={{ borderRadius: '8px', minWidth: '140px' }}>
                                                {disable ? <><i className="fa fa-spinner fa-spin mr-2"></i> Inviting...</> : <><i className="fa fa-paper-plane mr-2"></i> Send Invitation</>}
                                            </button>
                                            <button type="button" className="btn btn-link text-muted ml-3" onClick={handleReset}>
                                                Reset Form
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                
                                <div className="card-footer bg-light border-0 p-3" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                    <div className="d-flex align-items-center">
                                        <i className="fa fa-shield-alt text-success mr-2"></i>
                                        <span className="text-muted small">Invitations are sent via secure Althub SMTP protocol.</span>
                                    </div>
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

export default AddUser;