/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const Users = () => {
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    const rows = [10, 20, 30];
    const [usersPerPage, setUsersPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

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
            getUsersData();
        }
    }, [institute_Name]);

    const getUsersData = () => {
        axios({
            method: "get",
            url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).then((response) => {
            console.log(response.data.data);
            setUsers(response.data.data);

        });
    };

    useEffect(() => {
        setDisplayUsers(users);
    }, [users]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = displayUsers.slice(indexOfFirstUser, indexOfLastUser);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayUsers.length / usersPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => {
        setCurrentPage(num);
    }

    const handleSearch = (e) => {
        if (e.target.value) {
            let search = e.target.value;
            setDisplayUsers(users.filter(
                (elem) =>
                    elem.email.toLowerCase().includes(search.toLowerCase()) ||
                    elem.fname.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setDisplayUsers(users)
        }
    }

    const handleApply = () => {
        if (from && to) {
            setCurrentPage(1);
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
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteUser/${deleteId}`,
        }).then((response) => {
            if (response.data.success === true) {
                getUsersData();
                setDeleteId('');
                setAlert(false);
                setAlert2(true);
            }
        })
    }

    const handleReset = () => {
        setCurrentPage(1);
        setFrom('');
        setTo('');
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Users</li>
                    </ol>
                    <h1 className="page-header">Users
                        <Link to="/add-user" className="btn btn-success mx-3" ><i className="fa fa-plus"></i></Link>
                    </h1>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-outline mb-4">
                                <input type="search" className="form-control" id="datatable-search-input" placeholder='Search User' onChange={handleSearch} />
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table id="product-listing" className="table">
                                            <thead>
                                                <tr>
                                                    <th>Sr. No.</th>
                                                    <th>Full Name</th>
                                                    <th>Profile Pic</th>
                                                    <th>Email</th>
                                                    <th>Phone Number</th>
                                                    <th>Birth Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentUsers.length > 0 ? currentUsers.map((elem, index) =>
                                                    <tr key={index}>
                                                        <td align='left'>{index + 1}</td>
                                                        <td>{elem.fname}</td>
                                                        <td>{elem.profilepic === '' || elem.profilepic === undefined ? <img src='assets/img/profile1.png' alt='default profile' style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' }} /> : <img src={`${ALTHUB_API_URL}${elem.profilepic}`} alt='user-img' style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' }} />}</td>
                                                        <td>{elem.email}</td>
                                                        <td>{elem.phone ? elem.phone : ''}</td>
                                                        <td>{elem.dob.split('T')[0]}</td>
                                                        <td><i className='fa fa-trash' style={{ color: "red", cursor: "pointer", marginLeft: "5px" }} onClick={() => { handleDeleteUser(elem._id) }}></i></td>
                                                    </tr>
                                                ) : <tr><td >No Record Found..</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="gt-pagination" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <ul className="pagination">
                                            {pageNumbers.map((number) =>
                                                <li key={number} className={currentPage === number ? "page-item active" : "page-item"} aria-current={currentPage === number ? 'page' : undefined}>
                                                    <button type="button" className="page-link" onClick={() => paginate(number)}>{number}</button>
                                                </li>
                                            )}
                                        </ul>
                                        <div className='filter-pages' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <label htmlFor='selection' style={{ marginBottom: '0' }}>Users Per Page :</label>
                                            <select className='selection' style={{ outline: '0', borderWidth: '0 0 1px', borderColor: 'black', marginLeft: '10px' }} onChange={(e) => setUsersPerPage(e.target.value)}>
                                                {rows.map(value =>
                                                    <option value={value}>{value}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {alert === true ? <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes, delete it!"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    onConfirm={DeleteUser}
                    onCancel={() => { setAlert(false); setDeleteId(''); }}
                >
                    You will not be able to recover this user!
                </SweetAlert> : ''
                }
                {alert2 === true ? <SweetAlert
                    success
                    title="User Deleted Successfully!"
                    onConfirm={() => { setAlert2(false); getUsersData(); }}
                />
                    : ''}
                <Footer />
            </div>
        </Fragment>
    )
}

export default Users