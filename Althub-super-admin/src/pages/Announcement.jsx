import React, { useEffect, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import axiosInstance from '../api/client';

import '../styles/announcement.css';

const Announcement = () => {
    const [form, setForm] = useState({
        title: '',
        message: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/portalAnnouncement');
                const announcement = response.data?.data || {};
                setForm({
                    title: announcement.title || '',
                    message: announcement.message || '',
                    isActive: announcement.isActive !== false,
                });
            } catch (err) {
                setStatus('Could not load the current announcement.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setStatus('');

        try {
            await axiosInstance.put('/api/v1/portalAnnouncement', form);
            setStatus('Announcement updated for institute admin dashboards.');
        } catch (err) {
            setStatus(err.response?.data?.msg || 'Announcement update failed.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppShell contentClassName="announcement-wrapper">
                    <div className="announcement-header">
                        <div>
                            <h1>Portal Announcement</h1>
                            <p>Set the message shown at the bottom of every institute admin dashboard.</p>
                        </div>
                    </div>

                    <section className="announcement-card">
                        {loading ? (
                            <div className="announcement-loading">
                                <i className="fa fa-circle-notch fa-spin"></i>
                                Loading announcement...
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Announcement Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control"
                                        value={form.title}
                                        maxLength={120}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Announcement Message</label>
                                    <textarea
                                        name="message"
                                        className="form-control"
                                        rows="6"
                                        value={form.message}
                                        maxLength={600}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <label className="announcement-toggle">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleChange}
                                    />
                                    <span>Show this announcement on admin dashboards</span>
                                </label>

                                {status && <div className="announcement-status">{status}</div>}

                                <div className="announcement-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Announcement'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
        </AppShell>
    );
};

export default Announcement;
