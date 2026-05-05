import React from 'react';
import Loader from './Loader.jsx';
import Menu from './Menu.jsx';
import Footer from './Footer.jsx';

export default function AppShell({ children, contentClassName = '', loading = false }) {
    return (
        <>
            <Loader show={loading} />
            <div id="page-container" className="fade show page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className={`content ${contentClassName}`.trim()}>
                    {children}
                </div>
                <Footer />
            </div>
        </>
    );
}
