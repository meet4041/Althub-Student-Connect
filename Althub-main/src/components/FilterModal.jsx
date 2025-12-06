import React, { useEffect } from 'react';

// --- INJECTED STYLES FOR MODERN MODAL ---
const styles = `
  /* Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  /* Modal Container */
  .modal-card {
    background: #fff;
    width: 100%;
    max-width: 450px; /* Smaller max-width for filter modal */
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
    animation: slideUp 0.3s ease-out;
    overflow: hidden;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Header */
  .modal-header {
    padding: 20px 25px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }

  .modal-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #2d3436;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    color: #b2bec3;
    cursor: pointer;
    transition: color 0.2s;
  }
  .close-btn:hover { color: #2d3436; }

  /* Body */
  .modal-body {
    padding: 25px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #636e72;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #2d3436;
    outline: none;
    transition: border-color 0.2s;
    background: #fcfcfc;
  }
  .form-input:focus { border-color: #66bd9e; background: #fff; }

  /* Footer */
  .modal-footer {
    padding: 20px 25px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn-reset {
    background: #f1f2f6;
    color: #636e72;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-reset:hover { background: #e9ecef; }

  .btn-apply {
    background: #66bd9e;
    color: #fff;
    border: none;
    padding: 10px 25px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(102, 189, 158, 0.3);
    transition: all 0.2s;
  }
  .btn-apply:hover { background: #479378; transform: translateY(-1px); }
`;

const FilterModal = ({ closeModal, add, setAdd, skill, setSkill, handleFilter }) => {
  
  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleReset = () => {
    setAdd("");
    setSkill("");
    // Optional: You might want to trigger handleFilter here if you want "Reset" to clear the search immediately
    // handleFilter(); 
    // Or just keep it as a clear function:
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fa-solid fa-sliders" style={{fontSize: '1rem', color: '#66bd9e'}}></i> 
            Filter Users
          </h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mumbai, New York"
              value={add}
              onChange={(e) => setAdd(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Python, Design"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-reset" onClick={handleReset}>
            Reset
          </button>
          <button className="btn-apply" onClick={handleFilter}>
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
}

export default FilterModal;