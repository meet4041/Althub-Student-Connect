const AdminPaginationFooter = ({
    showingFrom,
    showingTo,
    total,
    pageNumbers = [],
    currentPage,
    onPageChange,
}) => (
    <div className="admin-table-footer">
        <p className="admin-table-count">
            Showing {showingFrom} - {showingTo} of {total}
        </p>
        {pageNumbers.length > 1 && (
            <nav aria-label="Table pagination">
                <ul className="admin-pagination">
                    {pageNumbers.map((num) => (
                        <li key={num}>
                            <button
                                type="button"
                                className={`admin-page-button ${currentPage === num ? 'active' : ''}`}
                                onClick={() => onPageChange(num)}
                                aria-current={currentPage === num ? 'page' : undefined}
                            >
                                {num}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        )}
    </div>
);

export default AdminPaginationFooter;
