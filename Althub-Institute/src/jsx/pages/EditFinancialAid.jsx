import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

const EditFinancialAid = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);
    
    // [UPDATED] Expanded state to hold all editable fields
    const [data, setData] = useState({
        id: "",
        aid: "",
        claimed: "",
        description: "",
        dueDate: ""
    });

    const getAidData = () => {
        if (location.state && location.state.data) {
            const state = location.state.data;
            setData({
                id: state._id,
                aid: state.aid || "",
                claimed: state.claimed || "",
                description: state.description || "",
                dueDate: state.dueDate ? new Date(state.dueDate).toISOString().split('T')[0] : ""
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
                    aid: data.aid,
                    claimed: data.claimed,
                    description: data.description,
                    dueDate: data.dueDate
                },
            }).then((response) => {
                setDisable(false);
                toast.success("Scholarship Details Updated");
                setTimeout(() => {
                    navigate('/financial-aid');
                }, 1500);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to update details");
            });
        }
    };

    const validate = () => {
        let input = data;
        let errors = {};
        let isValid = true;

        if (!input["aid"]) {
            isValid = false;
            errors["aid_err"] = "Please Enter Total Aid Amount";
        }
        if (!input["claimed"]) {
            isValid = false;
            errors["claimed_err"] = "Please Enter Claimed Amount";
        }
        if (!input["description"]) {
            isValid = false;
            errors["description_err"] = "Please Enter Description";
        }
        if (!input["dueDate"]) {
            isValid = false;
            errors["dueDate_err"] = "Please Enter Due Date";
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
                        <li className="breadcrumb-item active">Edit Details</li>
                    </ol>
                    <h1 className="page-header">Edit Scholarship</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                                    <h4 className="card-title mb-0 text-dark">Scholarship Information</h4>
                                    <Link to="/financial-aid" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Cancel
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <fieldset>
                                            <div className="row">
                                                {/* Total Aid Amount */}
                                                <div className="col-md-6 form-group mb-4">
                                                    <label className="font-weight-bold text-dark">Total Aid Amount (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        name="aid" 
                                                        placeholder="Enter total amount"
                                                        value={data.aid} 
                                                        onChange={handleChange} 
                                                        style={{height: '45px'}} 
                                                    />
                                                    <div className="text-danger small mt-1">{errors.aid_err}</div>
                                                </div>

                                                {/* Claimed Amount */}
                                                <div className="col-md-6 form-group mb-4">
                                                    <label className="font-weight-bold text-dark">Claimed Amount (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        name="claimed" 
                                                        placeholder="Enter claimed amount"
                                                        value={data.claimed} 
                                                        onChange={handleChange} 
                                                        style={{height: '45px'}} 
                                                    />
                                                    <div className="text-danger small mt-1">{errors.claimed_err}</div>
                                                </div>
                                            </div>

                                            {/* Due Date */}
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold text-dark">Due Date</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    name="dueDate" 
                                                    value={data.dueDate} 
                                                    onChange={handleChange} 
                                                    style={{height: '45px'}} 
                                                />
                                                <div className="text-danger small mt-1">{errors.dueDate_err}</div>
                                            </div>

                                            {/* Description */}
                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold text-dark">Description</label>
                                                <textarea 
                                                    className="form-control" 
                                                    rows="4" 
                                                    name="description" 
                                                    placeholder="Enter scholarship details..."
                                                    value={data.description} 
                                                    onChange={handleChange}
                                                ></textarea>
                                                <div className="text-danger small mt-1">{errors.description_err}</div>
                                            </div>

                                            <div className="d-flex justify-content-end border-top pt-3">
                                                <button type="submit" className="btn btn-primary px-4" disabled={disable} 
                                                        style={{minWidth: '140px', backgroundColor: themeColor, borderColor: themeColor}}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2"></span> Updating...</> : 'Update Details'}
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