import React, { useEffect } from 'react';
import Menu from './Menu.jsx';
import Footer from './Footer.jsx';

const AppShell = ({ children, contentClassName = '' }) => {
    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
    }, []);

    return (
        <div id="page-container" className="fade show page-sidebar-fixed page-header-fixed">
            <Menu />
            <main id="content" className={`content ${contentClassName}`.trim()}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default AppShell;
