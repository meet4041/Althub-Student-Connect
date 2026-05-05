import { useAuth } from '../../../auth/session';
/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../../layouts/AppShell.jsx';
import axiosInstance from '../../../api/client'; 

// COMPANY STANDARD: Import external CSS
import '../../../styles/dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState(null); 
    const [alumniMembers, setAlumniMembers] = useState(null);
    const [events, setEvents] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState(null);
    const [nextCalendarDate, setNextCalendarDate] = useState(null);
    const [posts, setPosts] = useState(null);
    const [announcement, setAnnouncement] = useState({
        title: 'Admin Portal Notice',
        message: 'Use this space for platform-wide instructions, maintenance notes, or operational updates from the super admin team.',
    });
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    const userRole = (user?.role);
    const isAlumniOffice = userRole === 'alumni_office';
    const isPlacementOffice = userRole === 'placement_cell';
    const isInstitute = !isAlumniOffice && !isPlacementOffice;
    const csvAudienceLabel = isAlumniOffice ? 'Alumni' : 'Students';
    const csvTitle = `Upload ${csvAudienceLabel} CSV`;
    const csvDescription = `Bulk invite ${csvAudienceLabel.toLowerCase()} via email (CSV)`;
    const csvHelperText = isAlumniOffice
        ? 'CSV should contain alumni emails in the first column (optional header: email).'
        : 'CSV should contain student emails in the first column (optional header: email).';
    const csvSubmitLabel = `Upload & Invite ${csvAudienceLabel}`;

    useEffect(() => {
        if (authLoading) return;

        const id = (user?._id);
        const name = (user?.name || '');

        if (!id || !name) {
            navigate('/login');
            return;
        }

        setInstitute_Id(id);
        setInstitute_Name(name);
        setLoading(false);
    }, [authLoading, navigate, user?._id, user?.name]);
    
    useEffect(() => {
        if (institute_Id) {
            fetchAllStats();
        }
    }, [institute_Id]);

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error("Please select a CSV file");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            const res = await axiosInstance.post('/api/v1/bulkInviteAlumniCsv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { createdCount, skippedCount, failedCount } = res.data?.data || {};
            toast.success(`Created: ${createdCount || 0}, Skipped: ${skippedCount || 0}, Failed: ${failedCount || 0}`);
            setShowCsvModal(false);
            setCsvFile(null);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Upload failed");
        }
    };

    const fetchAllStats = async () => {
        Promise.all([
            getTotalUser(),
            getTotalEvents(),
            getTotalPosts(),
            getPortalAnnouncement()
        ]).catch(err => console.error("Stats error", err));
    };

    const getTotalUser = async () => {
        try {
            const instituteKey = institute_Id || institute_Name;
            if (!instituteKey) {
                setUsers(0);
                setAlumniMembers(0);
                return;
            }

            const response = await axiosInstance.get(`/api/v1/institutes/${instituteKey}/users`);
            if (response.data.success) {
                const allUsers = response.data.data || [];
                const studentCount = allUsers.filter(u => u.type !== 'Alumni').length;
                const alumniCount = allUsers.filter(u => u.type === 'Alumni').length;
                setUsers(studentCount);
                setAlumniMembers(alumniCount);
            } else {
                setUsers(0);
                setAlumniMembers(0);
            }
        } catch (err) {
            setUsers(0);
            setAlumniMembers(0);
        }
    };

    const getTotalEvents = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/institutes/${institute_Id}/events`);
            const eventList = response.data.success ? (response.data.data || []) : [];
            const now = new Date();
            const futureEvents = eventList
                .filter((event) => {
                    const date = new Date(event.date);
                    return !Number.isNaN(date.getTime()) && date >= now;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            setEvents(eventList.length);
            setUpcomingEvents(futureEvents.length);
            setNextCalendarDate(futureEvents[0]?.date || null);
        } catch (err) {
            setEvents(0);
            setUpcomingEvents(0);
            setNextCalendarDate(null);
        }
    };

    const getTotalPosts = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/users/${institute_Id}/posts`);
            setPosts(response.data.success ? response.data.data.length : 0);
        } catch (err) { setPosts(0); }
    };

    const formatStatValue = (value) => (value === null ? '...' : value.toLocaleString());
    const formatDateValue = (value) => {
        if (!value) return 'No date';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'No date';
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const getPortalAnnouncement = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/portalAnnouncement');
            if (response.data?.success && response.data.data) {
                setAnnouncement(response.data.data);
            }
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Announcement fetch failed', err);
            }
        }
    };

    const statCards = isAlumniOffice ? [
        {
            label: 'Alumni Members',
            metricLabel: 'Total alumni',
            value: formatStatValue(alumniMembers),
            icon: 'fa-user-graduate',
            action: 'View Alumni',
            to: '/alumni-members',
        },
        {
            label: 'Events',
            metricLabel: 'Alumni events',
            value: formatStatValue(upcomingEvents),
            icon: 'fa-calendar-alt',
            action: 'Manage Events',
            to: '/alumni-events',
        },
        {
            label: 'Calendar',
            metricLabel: 'Next date',
            value: formatDateValue(nextCalendarDate),
            isTextValue: !nextCalendarDate,
            icon: 'fa-calendar-day',
            action: 'Open Calendar',
            to: '/alumni-events',
        },
        {
            label: 'Posts',
            metricLabel: 'Alumni posts',
            value: formatStatValue(posts),
            icon: 'fa-bullhorn',
            action: 'Manage Posts',
            to: '/alumni-posts',
        },
    ] : isPlacementOffice ? [
        {
            label: 'Events',
            metricLabel: 'Placement events',
            value: formatStatValue(upcomingEvents),
            icon: 'fa-calendar-alt',
            action: 'Manage Events',
            to: '/placement-events',
        },
        {
            label: 'Calendar',
            metricLabel: 'Next date',
            value: formatDateValue(nextCalendarDate),
            isTextValue: !nextCalendarDate,
            icon: 'fa-calendar-day',
            action: 'Open Calendar',
            to: '/placement-events',
        },
        {
            label: 'Posts',
            metricLabel: 'Placement posts',
            value: formatStatValue(posts),
            icon: 'fa-bullhorn',
            action: 'Manage Posts',
            to: '/placement-posts',
        },
    ] : [
        {
            label: 'Students',
            metricLabel: 'Total students',
            value: formatStatValue(users),
            icon: 'fa-users',
            action: 'Manage Students',
            to: '/users',
        },
        {
            label: 'Alumni',
            metricLabel: 'Total alumni',
            value: formatStatValue(alumniMembers),
            icon: 'fa-user-graduate',
            action: 'View Alumni',
            to: '/users',
        },
        {
            label: 'Events',
            metricLabel: 'Upcoming events',
            value: formatStatValue(upcomingEvents),
            icon: 'fa-calendar-alt',
            action: 'Manage Events',
            to: '/events',
        },
        {
            label: 'Calendar',
            metricLabel: 'Next date',
            value: formatDateValue(nextCalendarDate),
            isTextValue: !nextCalendarDate,
            icon: 'fa-calendar-day',
            action: 'Open Events',
            to: '/events',
        },
        {
            label: 'Posts',
            metricLabel: 'Published posts',
            value: formatStatValue(posts),
            icon: 'fa-newspaper',
            action: 'Manage Content',
            to: '/posts',
        },
    ];

    return (
        <>
            <ToastContainer theme="colored" position="top-right" />
            <AppShell contentClassName="dashboard-content" loading={authLoading}>
                    <div className="dashboard-page-inner">
                        {/* Header Section */}
                        <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2 institute-page-header">
                            <div className="institute-page-header-copy">
                                <ol className="breadcrumb mb-1 dashboard-breadcrumb institute-page-breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/dashboard" className="dashboard-breadcrumb-link">Home</Link></li>
                                    <li className="breadcrumb-item active">
                                        {isAlumniOffice ? 'Alumni Office' : isPlacementOffice ? 'Placement Cell' : 'Overview'}
                                    </li>
                                </ol>
                                <h1 className="dashboard-header-h1 institute-page-title">
                                    {isAlumniOffice ? 'Alumni Office Summary' : isPlacementOffice ? 'Placement Cell Summary' : 'Dashboard Summary'}
                                </h1>
                                <p className="institute-page-subtitle">
                                    {isAlumniOffice
                                        ? 'Quick insight into alumni activity, communication, and member growth.'
                                        : isPlacementOffice
                                            ? 'Track placement communication and activity from one unified overview.'
                                            : 'Monitor members, events, and posts from one consistent workspace.'}
                                </p>
                            </div>
                        </div>

                        {(isAlumniOffice || isInstitute || isPlacementOffice) && (
                            <div className="dashboard-csv-bar">
                                <div className="dashboard-csv-text">
                                    {csvDescription}
                                </div>
                                <button className="btn dashboard-csv-btn" onClick={() => setShowCsvModal(true)}>
                                    <i className="fa fa-file-upload mr-2"></i> Upload CSV
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center p-5 mt-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <h4 className="mt-3 text-muted">Syncing Secure Environment...</h4>
                            </div>
                        ) : (
                            <section className="dashboard-section" aria-labelledby="dashboard-management-title">
                                <div className="dashboard-section-heading">
                                    <div>
                                        <h2 id="dashboard-management-title">Portal Snapshot</h2>
                                    </div>
                                </div>
                            <div className="dashboard-stats-grid">
                                {statCards.map((card) => (
                                    <article className="dashboard-stat-card" key={card.label}>
                                        <div className="dashboard-stat-header">
                                            <span className="dashboard-stat-icon">
                                                <i className={`fa ${card.icon}`}></i>
                                            </span>
                                            <div>
                                                <h3 className="dashboard-stat-title">{card.label}</h3>
                                                <p className="dashboard-stat-label">{card.metricLabel}</p>
                                            </div>
                                        </div>
                                        <div className="dashboard-stat-meta">
                                            <span className={`dashboard-stat-value ${card.isTextValue ? 'dashboard-stat-value-text' : ''}`}>{card.value}</span>
                                        </div>
                                        <Link to={card.to} className="dashboard-stat-link">
                                            <span>{card.action}</span>
                                            <i className="fa fa-arrow-right"></i>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                            </section>
                        )}

                        {!loading && (
                            <section className="dashboard-announcement" aria-label="Portal announcement">
                                <div className="dashboard-announcement-icon">
                                    <i className="fa fa-bullhorn"></i>
                                </div>
                                <div>
                                    <h2>{announcement.title}</h2>
                                    <p>{announcement.message}</p>
                                    <span>Managed from Super Admin</span>
                                </div>
                            </section>
                        )}
                    </div>
            </AppShell>

            {showCsvModal && (
                <div className="csv-modal-backdrop" onClick={() => setShowCsvModal(false)}>
                    <div className="csv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="csv-modal-header">
                            <h4 className="csv-modal-title">{csvTitle}</h4>
                            <button className="csv-modal-close" onClick={() => setShowCsvModal(false)} aria-label="Close">&times;</button>
                        </div>
                        <form onSubmit={handleCsvUpload} className="csv-modal-body">
                            <p className="text-muted small mb-3">{csvHelperText}</p>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                className="form-control"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            />
                            <div className="csv-modal-actions">
                                <button type="button" className="btn btn-light" onClick={() => setShowCsvModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{csvSubmitLabel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard;
