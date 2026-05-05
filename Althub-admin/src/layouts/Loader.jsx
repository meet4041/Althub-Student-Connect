import React from 'react'

import '../styles/loader.css';

function Loader({ show = true }) {
    if (!show) return null;

    return (
        <>
            <div id="page-loader" className="fade show">
                <span className="spinner"></span>
            </div>
        </>
    )
}

export default Loader
