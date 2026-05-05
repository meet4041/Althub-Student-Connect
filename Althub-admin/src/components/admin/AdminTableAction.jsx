const AdminTableAction = ({
    icon,
    label,
    variant = 'neutral',
    onClick,
}) => {
    const iconClass = icon?.startsWith('fa-') ? icon : `fa-${icon}`;

    return (
        <button
            type="button"
            className={`admin-table-action admin-table-action-${variant}`}
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            <i className={`fa ${iconClass}`}></i>
        </button>
    );
};

export default AdminTableAction;
