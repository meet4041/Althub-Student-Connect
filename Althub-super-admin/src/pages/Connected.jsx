import React, { useEffect, useMemo, useState, Fragment } from 'react';
import axiosInstance from '../services/axios';
import Menu from '../layouts/Menu.jsx';
import Footer from '../layouts/Footer.jsx';

import '../styles/connected.css';

const Connected = () => {
    const [institutes, setInstitutes] = useState([]);
    const [placementCells, setPlacementCells] = useState([]);
    const [alumniOffices, setAlumniOffices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");

        Promise.all([
            axiosInstance.get('/api/getInstitutes'),
            axiosInstance.get('/api/getPlacementCells'),
            axiosInstance.get('/api/getAlumniOffices')
        ]).then(([instRes, placementRes, alumniRes]) => {
            setInstitutes(instRes.data.data || []);
            setPlacementCells(placementRes.data.data || []);
            setAlumniOffices(alumniRes.data.data || []);
            setLoading(false);
        }).catch((err) => {
            console.error('Connected Fetch Error:', err);
            setLoading(false);
        });
    }, []);

    const placementByInstitute = useMemo(() => {
        const map = new Map();
        placementCells.forEach(item => {
            const parentId = item.parent_institute_id?._id || item.parent_institute_id;
            if (!parentId) return;
            const key = String(parentId);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        });
        return map;
    }, [placementCells]);

    const alumniByInstitute = useMemo(() => {
        const map = new Map();
        alumniOffices.forEach(item => {
            const parentId = item.parent_institute_id?._id || item.parent_institute_id;
            if (!parentId) return;
            const key = String(parentId);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        });
        return map;
    }, [alumniOffices]);

    return (
        <Fragment>
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content connected-wrapper">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h1 className="page-header mb-1">Connected</h1>
                            <p className="text-muted small font-weight-bold mb-0">
                                Institute to Alumni Office and Placement Cell connections
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fa fa-circle-notch fa-spin fa-3x text-primary opacity-20"></i>
                        </div>
                    ) : (
                        <div className="connected-list">
                            {institutes.map(inst => {
                                const placement = placementByInstitute.get(String(inst._id)) || [];
                                const alumni = alumniByInstitute.get(String(inst._id)) || [];

                                return (
                                    <div key={inst._id} className="connected-row">
                                        <div className="connected-node institute-node">
                                            {inst.name}
                                        </div>

                                        <div className="connect-arrow arrow-left">
                                            <span className="arrow-line"></span>
                                            <span className="arrow-head"></span>
                                        </div>

                                        <div className="connected-node alumni-node">
                                            <div className="node-title">Alumni Office</div>
                                            <div className="node-body">
                                                {alumni.length > 0 ? alumni.map(a => (
                                                    <div key={a._id} className="node-item">{a.name}</div>
                                                )) : (
                                                    <div className="node-empty">Not Connected</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="connect-arrow arrow-right">
                                            <span className="arrow-line"></span>
                                            <span className="arrow-head"></span>
                                        </div>

                                        <div className="connected-node placement-node">
                                            <div className="node-title">Placement Cell</div>
                                            <div className="node-body">
                                                {placement.length > 0 ? placement.map(p => (
                                                    <div key={p._id} className="node-item">{p.name}</div>
                                                )) : (
                                                    <div className="node-empty">Not Connected</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {institutes.length === 0 && (
                                <div className="text-center py-5 text-muted font-weight-bold">
                                    No institutes found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default Connected;
