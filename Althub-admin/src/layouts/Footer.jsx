/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'

import '../styles/footer.css';

function Footer() {
    const year = new Date().getFullYear();
    const userRole = localStorage.getItem('userRole');
    const portalLabel = userRole === 'alumni_office'
        ? 'Alumni Portal'
        : userRole === 'placement_cell'
            ? 'Placement Office Portal'
            : 'Institute Portal';
    return (
        <>
            <footer className="app-footer">
                <div className="app-footer-left">
                    <span className="app-footer-brand">Althub</span>
                    <span className="app-footer-divider">•</span>
                    <span className="app-footer-text">{portalLabel}</span>
                </div>
                <div className="app-footer-right">
                    <span className="app-footer-text">© {year} Althub. All rights reserved.</span>
                </div>
            </footer>
            <a className="btn btn-icon btn-circle btn-success btn-scroll-to-top fade" data-click="scroll-top" aria-label="Scroll to top">
                <i className="fa fa-angle-up"></i>
            </a>
        </>
    )
}

export default Footer
