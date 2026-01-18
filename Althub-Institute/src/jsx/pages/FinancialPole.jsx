/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars, jsx-a11y/alt-text */
import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

// Import CSS
import '../../styles/financial.css';

const FinancialPole = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    let navigate = useNavigate();
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [displayCourses, setDisplayCourses] = useState([]);
    const rows = [10, 20, 30];
    const [coursesPerPage, setCoursesPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [associatedUser, setAssociatedUser] = useState(null);
    const themeColor = '#2563EB';

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        setInstitute_Name(localStorage.getItem("AlmaPlus_institute_Name"));
    }, []);

    // FETCH LOGIC (Added and improved)
    const getAidData = useCallback(() => {
        // Make sure we are grabbing the ID key
        const institute_Id = localStorage.getItem("AlmaPlus_institute_Id");
        const token = localStorage.getItem('token');

        if (!institute_Id) {
            console.error("No Institute ID found in localStorage");
            return;
        }

        axios.get(`${ALTHUB_API_URL}/api/getFinancialAidByInstitute/${institute_Id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((res) => {
                if (res.data.success) {
                    // Check if res.data.data actually contains an array
                    setData(res.data.data || []);
                    setDisplayCourses(res.data.data || []);
                }
            })
            .catch(err => console.error("API Fetch failed:", err));
    }, []);

    const getUsersData = () => {
        const token = localStorage.getItem('token');
        const institute_Id = localStorage.getItem("AlmaPlus_institute_Id");
        if (!institute_Id) return;

        axios.get(`${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        }).then((res) => setUsers(res.data.data || []));
    };

    // 4. Trigger fetch on component mount
    useEffect(() => {
        getAidData();
        getUsersData();
    }, [getAidData]);

    useEffect(() => { setDisplayCourses(data); }, [data]);

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = displayCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const pageNumbers = Array.from({ length: Math.ceil(displayCourses.length / coursesPerPage) }, (_, i) => i + 1);

    const handleSearch = (e) => {
        let search = e.target.value.toLowerCase();
        setDisplayCourses(data.filter(el =>
            (el.name && el.name.toLowerCase().includes(search)) ||
            (el.aid && el.aid.toString().includes(search))
        ));
        setCurrentPage(1);
    }

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const DeleteAid = () => {
        const token = localStorage.getItem('token');
        axios.delete(`${ALTHUB_API_URL}/api/deleteFinancialAid/${deleteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((res) => {
            if (res.data.success) {
                getAidData();
                setAlert(false);
                setAlert2(true);
                setSelectedRecord(null);
            }
        });
    }

    const openDetails = (record) => {
        setSelectedRecord(record);
        const user = users.find(u => `${u.fname} ${u.lname || ''}`.trim() === record.name.trim());
        setAssociatedUser(user);
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content financial-content-wrapper">
                    <div className="financial-container">

                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</Link></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Scholarships</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>Scholarship Management</h1>
                            </div>
                            <Link to="/add-financial-aid" className="btn btn-primary shadow-sm" style={{ borderRadius: '10px', backgroundColor: themeColor, border: 'none', padding: '10px 22px', fontWeight: '700' }}>
                                <i className="fa fa-plus-circle mr-2"></i> Add Scholarship
                            </Link>
                        </div>

                        <div className="financial-scroll-area">
                            <div className="card aid-main-card">
                                <div className="card-body p-0 bg-white">
                                    <div className="p-4 d-flex flex-wrap align-items-center justify-content-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <div className="input-group" style={{ maxWidth: '400px' }}>
                                            <div className="input-group-prepend">
                                                <span className="input-group-text bg-light border-0" style={{ borderRadius: '8px 0 0 8px' }}><i className="fa fa-search text-muted"></i></span>
                                            </div>
                                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: '0 8px 8px 0', fontSize: '14px', height: '42px' }} placeholder="Search by student name..." onChange={handleSearch} />
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-muted small mr-3 font-weight-bold">SHOWING</span>
                                            <select className="custom-select custom-select-sm border-0 bg-light font-weight-bold" style={{ borderRadius: '6px', width: '110px', height: '38px' }} value={coursesPerPage} onChange={(e) => setCoursesPerPage(Number(e.target.value))}>
                                                {rows.map(v => <option key={v} value={v}>{v} Items</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                    <th className="border-0 pl-4 py-3" style={{ width: '80px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>SR</th>
                                                    <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Student Profile</th>
                                                    <th className="border-0 text-center py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>Due Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentCourses.length > 0 ? currentCourses.map((elem, index) => (
                                                    <tr key={elem._id || index} className="aid-row" onClick={() => openDetails(elem)}>
                                                        <td className="pl-4 align-middle"><span className="aid-badge-id">{(indexOfFirstCourse + index + 1).toString().padStart(2, '0')}</span></td>
                                                        <td className="align-middle">
                                                            <div className="d-flex align-items-center">
                                                                <img src={elem.image ? `${ALTHUB_API_URL}${elem.image}` : 'assets/img/profile1.png'} className="student-avatar-img mr-3" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                <div>
                                                                    <div className="font-weight-bold text-dark mb-0" style={{ fontSize: '15px' }}>{elem.name}</div>
                                                                    <small className="text-muted">{elem.aid} Scholarship</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            <span className="due-date-chip">{elem.dueDate ? elem.dueDate.split('T')[0] : 'N/A'}</span>
                                                        </td>
                                                    </tr>
                                                )) : <tr><td colSpan="3" className="text-center p-5 text-muted">No records found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-4 bg-white d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <p className="text-muted small mb-0 font-weight-bold">Showing {indexOfFirstCourse + 1} - {Math.min(indexOfLastCourse, displayCourses.length)} of {displayCourses.length}</p>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                {pageNumbers.map(num => (
                                                    <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                                                        <button className="page-link border-0 mx-1" onClick={() => setCurrentPage(num)} style={currentPage === num ? { backgroundColor: themeColor, color: '#fff', borderRadius: '6px' } : { backgroundColor: '#F8FAFC', color: themeColor, borderRadius: '6px' }}>{num}</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Modal */}
                {selectedRecord && (
                    <div className="modal fade show modal-glass-backdrop" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content aid-modal-content shadow-lg">
                                <div className="modal-body p-0">
                                    <div className="text-right p-3 position-absolute" style={{ right: 0, zIndex: 10 }}>
                                        <button type="button" className="close text-dark opacity-50" onClick={() => setSelectedRecord(null)}>&times;</button>
                                    </div>
                                    <div className="row no-gutters">
                                        <div className="col-md-5 p-5 text-center bg-light border-right">
                                            <img src={selectedRecord.image ? `${ALTHUB_API_URL}${selectedRecord.image}` : 'assets/img/profile1.png'} className="rounded-circle shadow-sm mb-3" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '4px solid #fff' }} />
                                            <h4 className="font-weight-bold mb-1">{selectedRecord.name}</h4>
                                            <div className="badge badge-pill badge-primary mb-4 px-3 py-2">Beneficiary Student</div>
                                            <div className="text-left stats-box-light small mt-3">
                                                <div className="mb-2"><i className="far fa-envelope mr-2"></i> {associatedUser?.email || 'N/A'}</div>
                                                <div><i className="fa fa-phone mr-2"></i> {associatedUser?.phone || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-7 p-5 bg-white">
                                            <h6 className="text-uppercase text-muted small font-weight-bold mb-4" style={{ letterSpacing: '1px' }}>Financial Aid Overview</h6>
                                            <div className="row mb-4">
                                                <div className="col-6">
                                                    <small className="text-muted d-block mb-1">Scholarship Type</small>
                                                    <h3 className="font-weight-bold text-primary mb-0">₹{selectedRecord.aid}</h3>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block mb-1">Total Amount</small>
                                                    <h3 className="font-weight-bold text-success mb-0">₹{selectedRecord.claimed}</h3>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="text-muted small font-weight-bold mb-1">DUE DATE</label>
                                                <div className="font-weight-bold"><i className="far fa-calendar-alt mr-2 text-primary"></i> {selectedRecord.dueDate ? selectedRecord.dueDate.split('T')[0] : 'N/A'}</div>
                                            </div>
                                            <div className="p-3 bg-light rounded small mb-4">{selectedRecord.description || 'No additional details available.'}</div>
                                            <div className="d-flex border-top pt-4">
                                                <button className="btn btn-primary flex-grow-1 mr-2" onClick={() => navigate('/edit-financial-aid', { state: { data: selectedRecord } })} style={{ borderRadius: '8px', fontWeight: '600' }}>Edit Record</button>
                                                <button className="btn btn-outline-danger" onClick={() => { setDeleteId(selectedRecord._id); setAlert(true); }} style={{ borderRadius: '8px' }}><i className="fa fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Confirm Delete?" onConfirm={DeleteAid} onCancel={() => setAlert(false)} style={{ borderRadius: '16px' }} />
                <SweetAlert success show={alert2} title="Record Deleted" onConfirm={() => { setAlert2(false); getAidData(); }} style={{ borderRadius: '16px' }} />
                <Footer />
            </div>
        </Fragment>
    );
};

export default FinancialPole;