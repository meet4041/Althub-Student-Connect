import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom'
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axiosInstance from '../../services/axios'; // Updated to use secure instance

const FeedBack = () => {
    const [feedback, setFeedBack] = useState([]);
    const [displayFeedBack, setDisplayFeedBack] = useState([]);
    const rows = [10, 20, 30];
    const [feedbackPerPage, setFeedBackPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        var element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        getFeedBackData();
    }, []);

    const getFeedBackData = () => {
        // Updated to use axiosInstance for consistency with your security setup
        axiosInstance.get(`/api/getFeedback`).then((response) => {
            if (response.data.success === true) {
                setFeedBack(response.data.data);
            }
        }).catch(err => {
            console.error("Error fetching feedback:", err);
        });
    };

    useEffect(() => {
        setDisplayFeedBack(feedback);
    }, [feedback]);

    const indexOfLastUser = currentPage * feedbackPerPage;
    const indexOfFirstUser = indexOfLastUser - feedbackPerPage;
    const currentFeedBack = displayFeedBack.slice(indexOfFirstUser, indexOfLastUser);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayFeedBack.length / feedbackPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => {
        setCurrentPage(num);
    }

    const handleSearch = (e) => {
        if (e.target.value) {
            let search = e.target.value.toLowerCase();
            setDisplayFeedBack(feedback.filter(
                (elem) =>
                    // Updated search to filter by both Message and Name
                    (elem.message && elem.message.toLowerCase().includes(search)) ||
                    (elem.name && elem.name.toLowerCase().includes(search))
            ));
        } else {
            setDisplayFeedBack(feedback)
        }
    }

    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteUser = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteUser = () => {
        axiosInstance.delete(`/api/deleteFeedback/${deleteId}`).then((response) => {
            if (response.data.success === true) {
                getFeedBackData();
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
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">FeedBack</li>
                    </ol>
                    <h1 className="page-header">FeedBack</h1>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-outline mb-4">
                                <input type="search" className="form-control" id="datatable-search-input" placeholder='Search by User Name or Message' onChange={handleSearch} />
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table id="product-listing" className="table">
                                            <thead>
                                                <tr>
                                                    <th>Sr. No.</th>
                                                    <th>User Name</th> {/* NEW COLUMN */}
                                                    <th>Message</th>
                                                    <th>Rate</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentFeedBack.length > 0 ? currentFeedBack.map((elem, index) =>
                                                    <tr key={index}>
                                                        <td align='left'>{indexOfFirstUser + index + 1}</td>
                                                        <td>{elem.name || 'N/A'}</td> {/* DISPLAY NAME */}
                                                        <td>{elem.message}</td>
                                                        <td>{elem.rate}</td>
                                                        <td className="text-center">
                                                            <i className='fa fa-trash' 
                                                               style={{ color: "red", cursor: "pointer" }} 
                                                               onClick={() => { handleDeleteUser(elem._id) }}>
                                                            </i>
                                                        </td>
                                                    </tr>
                                                ) : <tr><td colSpan="5" className="text-center">No Record Found..</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="gt-pagination" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                        <ul className="pagination">
                                            {pageNumbers.map((number) =>
                                                <li key={number} className={currentPage === number ? "page-item active" : "page-item"}>
                                                    <span className="page-link" style={{cursor: 'pointer'}} onClick={() => paginate(number)}>{number}</span>
                                                </li>
                                            )}
                                        </ul>
                                        <div className='filter-pages' style={{ display: 'flex', alignItems: 'center' }}>
                                            <label htmlFor='selection' style={{ marginBottom: '0' }}>FeedBack Per Page :</label>
                                            <select className='selection' style={{ outline: '0', borderWidth: '0 0 1px', borderColor: 'black', marginLeft: '10px' }} onChange={(e) => setFeedBackPerPage(Number(e.target.value))}>
                                                {rows.map(value =>
                                                    <option key={value} value={value}>{value}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
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
                        title="Are you sure?"
                        onConfirm={DeleteUser}
                        onCancel={() => { setAlert(false); setDeleteId(''); }}
                    >
                        You will not be able to recover this feedback!
                    </SweetAlert>
                )}
                {alert2 === true && (
                    <SweetAlert
                        success
                        title="Feedback Deleted Successfully!"
                        onConfirm={() => { setAlert2(false); getFeedBackData(); }}
                    />
                )}
                <Footer />
            </div>
        </Fragment>
    )
}

export default FeedBack;