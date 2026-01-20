/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { ALTHUB_API_URL } from './baseURL';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const themeColor = '#2563EB';

    useEffect(() => {
        // --- MANDATORY THEME INITIALIZATION ---
        // This ensures the page opens in "one-go" without a refresh
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        
        if (loader) loader.style.display = 'none';
        if (element) {
            element.classList.add("show");
            // Ensure sidebar/header padding is applied if classes are missing
            element.style.visibility = "visible";
            element.style.opacity = "1";
        }

        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = () => {
        const token = localStorage.getItem('token');
        // Standardizing the fetch to use the token stored during login
        axios.get(`${ALTHUB_API_URL}/api/getLeaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.data.success) {
                setData(res.data.data);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Leaderboard loading failed:", err);
            setLoading(false);
        });
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{ 
                    backgroundColor: '#F1F5F9', 
                    minHeight: '100vh',
                    marginLeft: '240px', // Standard Sidebar Width
                    paddingTop: '65px',  // Standard Header Height
                    transition: 'all 0.3s'
                }}>
                    <div style={{ padding: '10px', marginTop:'-25px' }}>
                        {/* Header Section */}
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><a href="/dashboard" style={{ color: themeColor, fontWeight: '500' }}>Home</a></li>
                                        <li className="breadcrumb-item active" style={{ color: '#64748B' }}>Leaderboard</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header mb-0" style={{ color: '#1E293B', fontWeight: '800', fontSize: '24px' }}>
                                    Excellence Leaderboard
                                </h1>
                                <p className="text-muted small">Top members ranked by feedback volume and average ratings</p>
                            </div>
                        </div>
                        
                        {/* Leaderboard Table Card */}
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-body p-0 bg-white">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC' }}>
                                                <th className="border-0 pl-4 py-3" style={{ width: '100px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Rank</th>
                                                <th className="border-0 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Member Identity</th>
                                                <th className="border-0 text-center py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Reviews</th>
                                                <th className="border-0 text-right pr-5 py-3" style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quality Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="4" className="text-center p-5"><div className="spinner-border text-primary"></div></td></tr>
                                            ) : data.length > 0 ? data.map((item, index) => (
                                                <tr key={index} style={{ transition: 'background 0.2s' }}>
                                                    <td className="pl-4 align-middle">
                                                        {index === 0 && <span className="badge badge-warning shadow-sm px-2 py-1">1st</span>}
                                                        {index === 1 && <span className="badge badge-secondary shadow-sm px-2 py-1">2nd</span>}
                                                        {index === 2 && <span className="badge px-2 py-1 shadow-sm" style={{backgroundColor: '#CD7F32', color: '#fff'}}>3rd</span>}
                                                        {index > 2 && <span className="text-muted font-weight-bold ml-2">{(index + 1).toString().padStart(2, '0')}</span>}
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="font-weight-bold text-dark" style={{ fontSize: '15px' }}>{item.name}</div>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge badge-light border px-3 py-2" style={{ borderRadius: '8px', color: '#64748B', fontWeight: '600' }}>
                                                            {item.totalFeedback} Entries
                                                        </span>
                                                    </td>
                                                    <td className="text-right pr-5 align-middle">
                                                        <span style={{ 
                                                            backgroundColor: item.averageRating >= 4 ? '#DCFCE7' : item.averageRating >= 3 ? '#FEF9C3' : '#FEE2E2', 
                                                            color: item.averageRating >= 4 ? '#166534' : item.averageRating >= 3 ? '#854D0E' : '#991B1B',
                                                            padding: '8px 16px',
                                                            borderRadius: '30px',
                                                            fontWeight: '800',
                                                            fontSize: '14px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {item.averageRating.toFixed(1)} <i className="fa fa-star ml-2" style={{ fontSize: '12px' }}></i>
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center p-5 text-muted">No feedback data available for ranking.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default Leaderboard;