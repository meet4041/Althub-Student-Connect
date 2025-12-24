/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const EditFinancialAid = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({
        id: "",
        claimed: ""
    });

    const getAidData = () => {
        if (location.state && location.state.data) {
            const state = location.state.data;
            setData({
                id: state._id,
                claimed: state.claimed,
            });
        }
    }

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const element = document.getElementById("page-container");
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
                    claimed: data.claimed,
                },
            }).then((response) => {
                setDisable(false);
                toast.success("Claimed Amount Updated");
                setTimeout(() => {
                    navigate('/financial-aid');
                }, 1500);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to update amount");
            });
        }
    };

    const validate = () => {
        let input = data;
        let errors = {};
        let isValid = true;

        if (!input["claimed"]) {
            isValid = false;
            errors["claimed_err"] = "Please Enter Claimed Amount";
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
                        <li className="breadcrumb-item"><Link to="/financial-aid" style={{color: themeColor}}>Scholarship</Link></li>
                        <li className="breadcrumb-item active">Update Status</li>
                    </ol>
                    <h1 className="page-header">Update Scholarship Status</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                                    <h4 className="card-title mb-0 text-dark">Financial Details</h4>
                                    <Link to="/financial-aid" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Cancel
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler} >
                                        <fieldset>
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold text-dark" htmlFor="exampleInputName">Total Claimed Amount (₹)</label>
                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text bg-light border-right-0">₹</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        className="form-control border-left-0" 
                                                        id="exampleInputName" 
                                                        placeholder="Enter amount" 
                                                        name="claimed" 
                                                        onChange={handleChange} 
                                                        value={data.claimed}
                                                        style={{height: '45px'}} 
                                                    />
                                                </div>
                                                <small className="text-muted">Update the amount that has been successfully disbursed to the student.</small>
                                                <div className="text-danger small mt-1">{errors.claimed_err}</div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <button type="submit" className="btn btn-primary px-4" disabled={disable} 
                                                        style={{minWidth: '120px', backgroundColor: themeColor, borderColor: themeColor}}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Updating...</> : 'Update Amount'}
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

export default EditFinancialAid;