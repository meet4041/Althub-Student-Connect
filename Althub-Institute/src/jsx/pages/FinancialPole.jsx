/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars, jsx-a11y/alt-text */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const FinancialPole = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    let navigate = useNavigate();
    const [data, setData] = useState([]); // Financial Aid Data
    const [users, setUsers] = useState([]); // Full User List
    const [displayCourses, setDisplayCourses] = useState([]); 
    const rows = [10, 20, 30];
    const [coursesPerPage, setCoursesPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal State
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [associatedUser, setAssociatedUser] = useState(null);

    // Theme Constant
    const themeColor = '#2563EB'; 

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");
            
            const name = localStorage.getItem("AlmaPlus_institute_Name");
            setInstitute_Name(name);
        }
    }, []);

    useEffect(() => {
        if (institute_Name) {
            getAidData();
            getUsersData(); 
        }
    }, [institute_Name]);

    const getAidData = () => {
        const token = localStorage.getItem('token');
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getFinancialAidByInstitute/${institute_Name}`,
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((response) => {
            setData(response.data.data || []);
        }).catch(err => {
            console.error(err);
            setData([]);
        });
    };

    // Fetch Users List to link financial records to contact details
    const getUsersData = () => {
        const token = localStorage.getItem('token');
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`,
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((response) => {
            setUsers(response.data.data || []);
        }).catch(() => {});
    };

    useEffect(() => {
        setDisplayCourses(data);
    }, [data]);

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = displayCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(displayCourses.length / coursesPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => setCurrentPage(num);

    const handleSearch = (e) => {
        if (e.target.value) {
            let search = e.target.value;
            setDisplayCourses(data.filter(
                (elem) =>
                    elem.name.toLowerCase().includes(search.toLowerCase()) ||
                    elem.aid.toString().toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setDisplayCourses(data)
        }
    }

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    // Triggered from inside the Modal
    const handleDeleteAid = (id) => {
        setDeleteId(id);
        setAlert(true);
        // We keep the modal open or close it? Let's close it to avoid confusion
        // But the delete alert will show on top.
    }

    const DeleteAid = () => {
        const token = localStorage.getItem('token');
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteFinancialAid/${deleteId}`,
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((response) => {
            if (response.data.success === true) {
                getAidData();
                setDeleteId('');
                setAlert(false);
                setAlert2(true);
                closeDetails(); // Close modal on success
            }
        }).catch(err => {
            setAlert(false);
        });
    }

    // Open Modal
    const openDetails = (record) => {
        setSelectedRecord(record);
        // Find associated user details from the fetched users list
        if (users && users.length > 0) {
            const user = users.find(u => `${u.fname} ${u.lname || ''}`.trim() === record.name.trim());
            setAssociatedUser(user);
        } else {
            setAssociatedUser(null);
        }
    }

    const closeDetails = () => {
        setSelectedRecord(null);
        setAssociatedUser(null);
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
                                <li className="breadcrumb-item active">Scholarship</li>
                            </ol>
                            <h1 className="page-header mb-0">Scholarship Management</h1>
                        </div>
                        <Link to="/add-financial-aid" className="btn btn-primary btn-lg shadow-sm" 
                              style={{borderRadius: '8px', backgroundColor: themeColor, borderColor: themeColor}}>
                            <i className="fa fa-plus mr-2"></i> Add Scholarship
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
                                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Search by student name..." onChange={handleSearch} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-md-right mt-3 mt-md-0">
                                        <span className="text-muted mr-2">Show</span>
                                        <select className="custom-select custom-select-sm w-auto border-0 shadow-sm" style={{borderRadius: '5px'}} onChange={(e) => setCoursesPerPage(Number(e.target.value))}>
                                            {rows.map(value =>
                                                <option key={value} value={value}>{value} Items</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{backgroundColor: '#F1F5F9', color: '#334155'}}>
                                        <tr>
                                            <th className="border-0 pl-4" style={{width: '10%'}}>Sr. No.</th>
                                            {/* Simplified Columns */}
                                            <th className="border-0">Student Profile</th>
                                            <th className="border-0 text-center">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCourses.length > 0 ? currentCourses.map((elem, index) =>
                                            <tr key={index} style={{cursor: 'pointer'}} onClick={() => openDetails(elem)}>
                                                <td className="pl-4 align-middle text-muted">{indexOfFirstCourse + index + 1}</td>
                                                
                                                {/* Student Profile Column */}
                                                <td className="align-middle">
                                                    <div className="d-flex align-items-center">
                                                        {elem.image === '' || elem.image === undefined ? 
                                                            <img src='assets/img/profile1.png' alt='default' className="rounded-circle shadow-sm mr-3" style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #fff' }} /> 
                                                            : 
                                                            <img src={`${ALTHUB_API_URL}${elem.image}`} alt='user' className="rounded-circle shadow-sm mr-3" style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #fff' }} />
                                                        }
                                                        <div>
                                                            <div className="font-weight-bold text-dark" style={{fontSize: '15px'}}>{elem.name}</div>
                                                            <small className="text-muted">Click to view details</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Due Date Column */}
                                                <td className="align-middle text-center">
                                                    <span className="badge p-2 font-weight-normal" style={{backgroundColor: '#F1F5F9', color: '#475569'}}>
                                                        {elem.dueDate ? elem.dueDate.split('T')[0] : 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ) : <tr><td colSpan="3" className="text-center p-5 text-muted">No records found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                <div className="text-muted small">
                                    Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, displayCourses.length)} of {displayCourses.length} entries
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
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
                                    </ul>
                                </nav>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- DETAILED INFO MODAL --- */}
                {selectedRecord && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '15px'}}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title font-weight-bold ml-2 mt-2">Scholarship Details</h5>
                                    <button type="button" className="close" onClick={closeDetails} style={{outline: 'none'}}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row">
                                        {/* Left Side: Student Info */}
                                        <div className="col-md-5 border-right">
                                            <div className="text-center mb-4">
                                                {selectedRecord.image === '' || selectedRecord.image === undefined ? 
                                                    <img src='assets/img/profile1.png' alt='default' className="rounded-circle shadow mb-3" style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> 
                                                    : 
                                                    <img src={`${ALTHUB_API_URL}${selectedRecord.image}`} alt='user' className="rounded-circle shadow mb-3" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                }
                                                <h4 className="font-weight-bold text-dark mb-0">{selectedRecord.name}</h4>
                                                <small className="text-muted">Beneficiary</small>
                                            </div>
                                            
                                            <h6 className="text-uppercase text-muted small font-weight-bold mb-3">Contact Details</h6>
                                            <div className="mb-2">
                                                <i className="far fa-envelope mr-2 text-muted"></i>
                                                <span className="text-dark font-weight-bold">
                                                    {associatedUser ? associatedUser.email : <span className="text-muted font-italic">N/A</span>}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <i className="fa fa-phone mr-2 text-muted"></i>
                                                <span className="text-dark">
                                                    {associatedUser ? (associatedUser.phone || '-') : <span className="text-muted font-italic">N/A</span>}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side: Financial Info */}
                                        <div className="col-md-7 pl-md-4 mt-3 mt-md-0">
                                            <h6 className="text-uppercase text-muted small font-weight-bold mb-3">Financial Aid Information</h6>
                                            
                                            <div className="row mb-4">
                                                <div className="col-6">
                                                    <div className="p-3 rounded bg-light text-center">
                                                        <small className="d-block text-muted mb-1">Total Aid</small>
                                                        <h4 className="mb-0 text-primary font-weight-bold">₹{selectedRecord.aid}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 rounded bg-light text-center">
                                                        <small className="d-block text-muted mb-1">Claimed</small>
                                                        <h4 className="mb-0 text-success font-weight-bold">₹{selectedRecord.claimed}</h4>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted small font-weight-bold mb-0">DUE DATE</label>
                                                <div className="text-dark font-weight-bold">
                                                    <i className="far fa-calendar-alt mr-2" style={{color: themeColor}}></i>
                                                    {selectedRecord.dueDate ? selectedRecord.dueDate.split('T')[0] : 'N/A'}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted small font-weight-bold mb-0">DESCRIPTION</label>
                                                <p className="text-dark bg-light p-3 rounded" style={{whiteSpace: 'pre-wrap', fontSize: '14px'}}>
                                                    {selectedRecord.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0" style={{borderRadius: '0 0 15px 15px'}}>
                                    <button type="button" className="btn btn-white shadow-sm font-weight-bold" onClick={closeDetails}>Close</button>
                                    
                                    <button className="btn btn-primary shadow-sm font-weight-bold ml-2" 
                                            onClick={() => { navigate('/edit-financial-aid', { state: { data: selectedRecord } }) }} 
                                            style={{backgroundColor: themeColor, borderColor: themeColor}}>
                                        <i className="fa fa-pencil-alt mr-2"></i> Edit
                                    </button>
                                    
                                    <button className="btn btn-danger shadow-sm font-weight-bold ml-2" 
                                            onClick={() => handleDeleteAid(selectedRecord._id)}>
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
                        title="Delete Record?"
                        onConfirm={DeleteAid}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                        style={{zIndex: 2000}} 
                    >
                        This financial aid record will be permanently removed.
                    </SweetAlert>
                )}
                
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Deleted Successfully!"
                        onConfirm={() => { setAlert2(false); getAidData(); }}
                        style={{zIndex: 2000}}
                    >
                        The record has been removed.
                    </SweetAlert>
                )}
                <Footer />
            </div>
        </Fragment>
    )
}

export default FinancialPole;