const AdminSearchBox = ({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
}) => (
    <div className={`admin-search-box ${className}`.trim()}>
        <span className="admin-search-icon">
            <i className="fa fa-search"></i>
        </span>
        <input
            type="text"
            className="admin-search-input"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    </div>
);

export default AdminSearchBox;
