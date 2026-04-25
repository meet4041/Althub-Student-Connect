import React from 'react';
import { Link } from 'react-router-dom';

const AlumniPageShell = ({
    title,
    breadcrumb,
    subtitle,
    action,
    children,
}) => (
    <div className="alumni-container">
        <div className="alumni-shell-header">
            <div className="alumni-shell-copy">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-1 alumni-breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard" className="alumni-breadcrumb-link">Home</Link></li>
                        <li className="breadcrumb-item active">{breadcrumb || title}</li>
                    </ol>
                </nav>
                <h1 className="page-header alumni-header mb-0">{title}</h1>
                {subtitle ? <p className="alumni-shell-subtitle mb-0">{subtitle}</p> : null}
            </div>
            {action ? <div className="alumni-shell-action">{action}</div> : null}
        </div>
        {children}
    </div>
);

export default AlumniPageShell;
