import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../service/axios';
import Loader from '../layout/Loader.jsx';
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';

import '../../styles/alumni-pages.css';
import '../../styles/users.css';

const AlumniMembers = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [instituteId, setInstituteId] = useState(null);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        const element = document.getElementById("page-container");
        if (loader) loader.style.display = 'none';
        if (element) element.classList.add("show");
        setInstituteId(localStorage.getItem("AlmaPlus_institute_Id"));
    }, []);

    useEffect(() => {
        if (!instituteId) return;
        axiosInstance.get(`/api/getCourseByInstitute/${instituteId}`)
            .then((res) => {
                if (res.data?.success) {
                    setCourses(res.data.data || []);
                }
            })
            .catch(() => setCourses([]));
    }, [instituteId]);

    const selectCourse = async (course) => {
        setSelectedCourseId(course._id || course.id);
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('course', course.name || course.course || '');
            if (course.stream) params.append('specialization', course.stream);
            const res = await axiosInstance.get(`/api/getAlumniByCourseSpec?${params.toString()}`);
            setAlumniList(res.data?.data || []);
        } catch (err) {
            setAlumniList([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content alumni-content-wrapper">
                    <div className="alumni-container">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 alumni-breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/alumni-members" className="alumni-breadcrumb-link">Home</Link></li>
                                        <li className="breadcrumb-item active">Alumni Members</li>
                                    </ol>
                                </nav>
                                <h1 className="page-header alumni-header mb-0">Alumni Members</h1>
                            </div>
                            <Link to="/alumni-add-course" className="btn btn-primary alumni-add-btn">
                                <i className="fa fa-plus-circle mr-2"></i> Add Course
                            </Link>
                        </div>

                        <div className="alumni-course-grid">
                            {courses.length === 0 && (
                                <div className="alumni-empty-card">
                                    <h3>No courses added</h3>
                                    <p>Add a course and specialization to view alumni.</p>
                                </div>
                            )}
                            {courses.map((c) => (
                                <button
                                    key={c._id || c.id}
                                    className={`alumni-course-card ${selectedCourseId === (c._id || c.id) ? 'active' : ''}`}
                                    onClick={() => selectCourse(c)}
                                >
                                    <span className="alumni-course-title">{c.name || c.course}</span>
                                    <span className="alumni-course-subtitle">{c.stream || c.specialization || 'General'}</span>
                                </button>
                            ))}
                        </div>

                        <div className="alumni-card">
                            <div className="alumni-card-header">
                                <h3 className="alumni-card-title mb-0">Alumni List</h3>
                                {selectedCourseId && <span className="alumni-card-pill">Course Selected</span>}
                            </div>

                            {loading ? (
                                <div className="text-center p-5 text-muted">Loading alumni...</div>
                            ) : alumniList.length === 0 ? (
                                <div className="text-center p-5 text-muted">No alumni found for this course.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr className="users-table-head">
                                                <th className="border-0 pl-4 py-3 users-th users-th-id">ID</th>
                                                <th className="border-0 py-3 users-th users-th-profile">Profile</th>
                                                <th className="border-0 py-3 users-th">Name</th>
                                                <th className="border-0 py-3 users-th">Stream</th>
                                                <th className="border-0 text-right pr-5 py-3 users-th users-th-category">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alumniList.map((user, index) => (
                                                <tr key={user._id} className="table-user-row" onClick={() => setSelectedUser(user)}>
                                                    <td className="pl-4 align-middle">
                                                        <span className="id-badge-soft">{(index + 1).toString().padStart(2, '0')}</span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <img
                                                            src={getImageUrl(user.profilepic, FALLBACK_IMAGES.profile)}
                                                            alt="profile"
                                                            className="rounded-circle user-avatar-img"
                                                            onError={getImageOnError(FALLBACK_IMAGES.profile)}
                                                        />
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="font-weight-bold text-dark mb-0 user-name-text">
                                                            {[user.fname, user.lname].filter(Boolean).join(' ')}
                                                        </div>
                                                        <div className="user-email-text">{user.email}</div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="user-name-text">{user.course || '-'}</div>
                                                        <div className="user-email-text">{user.specialization || 'General'}</div>
                                                    </td>
                                                    <td className="align-middle text-right pr-5">
                                                        <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '6px', fontSize: '10px', fontWeight: '800', padding: '5px 10px' }}>
                                                            ALUMNI
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedUser && (
                    <div className="modal-backdrop-custom">
                        <div className="modal-dialog modal-dialog-centered user-modal-wide">
                            <div className="modal-content modal-content-premium">
                                <div className="modal-body p-0">
                                    <div className="user-modal-close">
                                        <button type="button" className="close user-modal-close-btn" onClick={() => setSelectedUser(null)} aria-label="Close">&times;</button>
                                    </div>
                                    <div className="user-modal-header">
                                        <div className="user-avatar-ring">
                                            <img
                                                src={getImageUrl(selectedUser.profilepic, FALLBACK_IMAGES.profile)}
                                                alt="profile"
                                                className="rounded-circle user-modal-avatar"
                                                onError={getImageOnError(FALLBACK_IMAGES.profile)}
                                            />
                                        </div>
                                        <h4 className="user-modal-name">{[selectedUser.fname, selectedUser.lname].filter(Boolean).join(' ')}</h4>
                                        <div className="user-modal-badge"><span className="badge">ALUMNI</span></div>
                                    </div>
                                    <div className="user-modal-body">
                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Contact</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Email</small>
                                                    {selectedUser.email ? (
                                                        <a className="user-info-link" href={`mailto:${selectedUser.email}`}>
                                                            {selectedUser.email}
                                                        </a>
                                                    ) : (
                                                        <span className="user-info-value">N/A</span>
                                                    )}
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Phone</small>
                                                    <span className="user-info-value">{selectedUser.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-info-section">
                                            <div className="user-info-section-title">Course</div>
                                            <div className="user-info-grid">
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Course</small>
                                                    <span className="user-info-value">{selectedUser.course || '-'}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Specialization</small>
                                                    <span className="user-info-value">{selectedUser.specialization || 'General'}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Start Year</small>
                                                    <span className="user-info-value">{selectedUser.eduStart ? new Date(selectedUser.eduStart).getFullYear() : 'N/A'}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <small className="user-info-label">Graduation Year</small>
                                                    <span className="user-info-value user-info-accent">{selectedUser.eduEnd ? new Date(selectedUser.eduEnd).getFullYear() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-modal-actions">
                                        <button type="button" className="btn btn-white font-weight-bold px-4 user-modal-btn-outline" onClick={() => setSelectedUser(null)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </Fragment>
    );
};

export default AlumniMembers;
