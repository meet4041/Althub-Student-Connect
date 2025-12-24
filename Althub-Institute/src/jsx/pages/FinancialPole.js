/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars, jsx-a11y/alt-text */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const FinancialPole = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    let navigate = useNavigate();
    const [data, setData] = useState([]);
    const [displayCourses, setDisplayCourses] = useState([]); // Kept variable name to maintain logic
    const rows = [10, 20, 30];
    const [coursesPerPage, setCoursesPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

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
        }
    }, [institute_Name]);

    const getAidData = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getFinancialAidByInstitute/${institute_Name}`,
        }).then((response) => {
            setData(response.data.data || []);
        }).catch(err => setData([]));
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

    const paginate = (num) => {
        setCurrentPage(num);
    }

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

    const handleDeleteAid = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteAid = () => {
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteFinancialAid/${deleteId}`,
        }).then((response) => {
            if (response.data.success === true) {
                getAidData();
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
                                <li className="breadcrumb-item active">Scholarship</li>
                            </ol>
                            <h1 className="page-header mb-0">Scholarship Management</h1>
                        </div>
                        {/* Primary Blue Button */}
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
                                            <th className="border-0 pl-4">Sr. No.</th>
                                            <th className="border-0">Student Profile</th>
                                            <th className="border-0">Aid Amount</th>
                                            <th className="border-0">Claimed</th>
                                            <th className="border-0">Due Date</th>
                                            <th className="border-0">Description</th>
                                            <th className="border-0 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCourses.length > 0 ? currentCourses.map((elem, index) =>
                                            <tr key={index}>
                                                <td className="pl-4 align-middle text-muted">{indexOfFirstCourse + index + 1}</td>
                                                <td className="align-middle">
                                                    <div className="d-flex align-items-center">
                                                        {elem.image === '' || elem.image === undefined ? 
                                                            <img src='assets/img/profile1.png' alt='default' className="rounded shadow-sm mr-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} /> 
                                                            : 
                                                            <img src={`${ALTHUB_API_URL}${elem.image}`} alt='user' className="rounded shadow-sm mr-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                        }
                                                        <span className="font-weight-bold text-dark">{elem.name}</span>
                                                    </div>
                                                </td>
                                                <td className="align-middle text-dark">₹{elem.aid}</td>
                                                <td className="align-middle">
                                                    <span className={`badge p-2 ${parseInt(elem.claimed) > 0 ? 'badge-soft-success' : 'badge-soft-secondary'}`} 
                                                          style={{backgroundColor: parseInt(elem.claimed) > 0 ? '#DCFCE7' : '#F1F5F9', color: parseInt(elem.claimed) > 0 ? '#166534' : '#64748B'}}>
                                                        ₹{elem.claimed}
                                                    </span>
                                                </td>
                                                <td className="align-middle">{elem.dueDate ? elem.dueDate.split('T')[0] : 'N/A'}</td>
                                                <td className="align-middle">
                                                    <span className="text-muted text-truncate d-inline-block" style={{maxWidth: '150px'}} title={elem.description}>
                                                        {elem.description}
                                                    </span>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm mr-2" 
                                                            onClick={() => { navigate('/edit-financial-aid', { state: { data: elem } }) }} 
                                                            title="Edit">
                                                        <i className="fa fa-pencil-alt" style={{ color: themeColor }}></i>
                                                    </button>
                                                    <button className="btn btn-white btn-icon btn-circle btn-sm shadow-sm" 
                                                            onClick={() => { handleDeleteAid(elem._id) }} 
                                                            title="Delete">
                                                        <i className="fa fa-trash-alt text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : <tr><td colSpan="7" className="text-center p-5 text-muted">No records found.</td></tr>}
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

                {alert === true && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        title="Delete Record?"
                        onConfirm={DeleteAid}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                    >
                        This financial aid record will be permanently removed.
                    </SweetAlert>
                )}
                
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Deleted Successfully!"
                        onConfirm={() => { setAlert2(false); getAidData(); }}
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