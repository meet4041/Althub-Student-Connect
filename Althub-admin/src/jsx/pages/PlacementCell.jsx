import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { ALTHUB_API_URL } from '../baseURL.jsx';
import axiosInstance from '../../services/axios';
import SweetAlert from 'react-bootstrap-sweetalert';

// RE-USING THE DIRECTORY STYLES
import '../styles/users.css';

const PlacementCell = () => {
    const [data, setData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Alert States
    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    useEffect(() => {
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axiosInstance.get('/api/getPlacementCells')
            .then(res => {
                setData(res.data.data || []);
                setDisplayData(res.data.data || []);
                setLoading(false);
            }).catch(() => setLoading(false));
    };

    // Filter Logic
    useEffect(() => {
        const filtered = data.filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.parent_institute_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayData(filtered);
    }, [searchTerm, data]);

    const confirmDelete = (id) => {
        setDeleteId(id);
        setAlert(true);
    };

    const executeDelete = () => {
        axiosInstance.delete(`/api/deletePlacementCell/${deleteId}`)
            .then(() => {
                setAlert(false);
                setAlert2(true);
            });
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content users-wrapper">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                <li className="breadcrumb-item active">Placement Cells</li>
                            </ol>
                            <h1 className="page-header mb-0">Placement Cell Directory</h1>
                        </div>
                    </div>

                    <div className="directory-card">
                        <div className="filter-bar">
                            <div className="search-input-group">
                                <i className="fa fa-search"></i>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search by name, email or institute..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table user-table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Office Name</th>
                                        <th>Parent Institute</th>
                                        <th>Contact Email</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-5"><i className="fa fa-spinner fa-spin fa-2x text-primary"></i></td></tr>
                                    ) : displayData.length > 0 ? displayData.map((item) => (
                                        <tr key={item._id}>
                                            <td className="user-name-text">{item.name}</td>
                                            <td>
                                                <span className="badge badge-light px-3 py-2" style={{fontSize: '13px'}}>
                                                    <i className="fa fa-university mr-2 text-muted"></i>
                                                    {item.parent_institute_id?.name || "Independent"}
                                                </span>
                                            </td>
                                            <td>{item.email}</td>
                                            <td className="text-center">
                                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => confirmDelete(item._id)}>
                                                    <i className="fa fa-trash-alt mr-1"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted">No placement cells registered.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <SweetAlert warning show={alert} showCancel confirmBtnText="Delete" confirmBtnBsStyle="danger" title="Remove Office?" onConfirm={executeDelete} onCancel={() => setAlert(false)}>
                    This office will no longer have access to the system.
                </SweetAlert>

                <SweetAlert success show={alert2} title="Deleted!" onConfirm={() => { setAlert2(false); fetchData(); }}>
                    Office removed successfully.
                </SweetAlert>
                <Footer />
            </div>
        </Fragment>
    );
};

export default PlacementCell;