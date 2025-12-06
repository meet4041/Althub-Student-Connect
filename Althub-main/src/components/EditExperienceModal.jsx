import axios from "axios";
import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

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
    max-width: 650px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
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
    padding: 20px 30px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    flex-shrink: 0;
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3436;
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

  /* Scrollable Body */
  .modal-body {
    padding: 30px;
    overflow-y: auto;
    flex: 1;
  }

  /* --- LIST VIEW STYLES --- */
  .exp-list-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border-bottom: 1px solid #f9f9f9;
    transition: background 0.2s;
    border-radius: 12px;
  }
  .exp-list-item:hover { background: #f8f9fa; }
  .exp-list-item:last-child { border-bottom: none; }

  .exp-logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #eee;
    background: #fff;
  }

  .exp-info { flex: 1; }
  .exp-role { font-size: 1.1rem; font-weight: 600; color: #333; margin: 0; }
  .exp-company { font-size: 0.9rem; color: #555; margin: 2px 0; }
  .exp-date { font-size: 0.8rem; color: #888; }

  .edit-icon-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e0e0e0;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .edit-icon-btn:hover { background: #f0f9f6; color: #66bd9e; border-color: #66bd9e; }

  /* --- FORM STYLES --- */
  .logo-upload-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px dashed #e0e0e0;
  }

  .upload-preview {
    width: 70px;
    height: 70px;
    border-radius: 12px;
    object-fit: cover;
    background: #fff;
    border: 1px solid #eee;
  }

  .upload-btn {
    color: #66bd9e;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .upload-btn:hover { text-decoration: underline; }

  .form-group { margin-bottom: 20px; }
  
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

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .error-text { color: #ff4757; font-size: 0.75rem; margin-top: 5px; display: block; }

  /* Footer Buttons */
  .modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
  }

  .btn-cancel {
    background: #f1f2f6; color: #636e72; border: none;
    padding: 10px 25px; border-radius: 8px; font-weight: 600; cursor: pointer;
  }
  .btn-delete {
    background: #fff0f1; color: #ff4757; border: none;
    padding: 10px 25px; border-radius: 8px; font-weight: 600; cursor: pointer;
  }
  .btn-save {
    background: #66bd9e; color: #fff; border: none;
    padding: 10px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 10px rgba(102, 189, 158, 0.3);
  }
  .btn-save:hover { background: #479378; }
`;

const EditExperienceModal = ({
  closeModal,
  experience,
  getExperience,
  modal,
}) => {
  const [ex, setEx] = useState({
    _id: "",
    companyname: "",
    position: "",
    companylogo: "",
    description: "",
  });
  const [joindate, setJoinDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [modalType, setModalType] = useState("");

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    setExperiences(experience);
    setModalType(modal);
  }, [experience, modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({});
    setJoinDate("");
    setEndDate("");
    if (modalType === "AddEdit") {
        setModalType("Edit"); // Go back to list if editing
    } else {
        closeModal();
    }
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const body = new FormData();
    body.append("profilepic", file);
    axios({
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      url: `${WEB_URL}/api/uploadUserImage`,
      data: body,
    })
      .then((response) => {
        setEx({ ...ex, companylogo: response.data.data.url });
      })
      .catch((error) => {
        toast.error("Image upload failed");
      });
  };

  const validate = () => {
    let input = ex;
    let errors = {};
    let isValid = true;

    if (!input["companyname"]) {
      isValid = false;
      errors["companyname_err"] = "Company Name is required";
    }
    if (!input["position"]) {
      isValid = false;
      errors["position_err"] = "Position is required";
    }
    if (!joindate) {
      isValid = false;
      errors["joindate_err"] = "Start Date is required";
    }
    setErrors(errors);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
      axios.post(`${WEB_URL}/api/editExperience`, {
          _id: ex._id,
          companyname: ex.companyname,
          position: ex.position,
          joindate: joindate,
          enddate: enddate,
          companylogo: ex.companylogo,
          description: ex.description,
        })
        .then((response) => {
          toast.success("Experience Updated!");
          getExperience();
          handleCancel(); // Go back to list
        })
        .catch((error) => console.log(error));
    }
  };

  const handleInsert = () => {
    const userID = localStorage.getItem("Althub_Id");
    if (validate()) {
      axios.post(`${WEB_URL}/api/addExperience`, {
          userid: userID,
          companyname: ex.companyname,
          position: ex.position,
          joindate: joindate,
          enddate: enddate,
          companylogo: ex.companylogo,
          description: ex.description,
        })
        .then((response) => {
          toast.success("Experience Added!");
          getExperience();
          closeModal();
        })
        .catch((error) => console.log(error));
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this experience?")) {
      axios.delete(`${WEB_URL}/api/deleteExperience/${ex._id}`)
      .then((response) => {
        toast.success("Deleted!");
        getExperience();
        handleCancel();
      });
    }
  };

  const triggerFileInput = () => document.getElementById("company-logo-input").click();

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {modalType === "Edit" ? "Experiences" : (ex._id ? "Edit Experience" : "Add Experience")}
          </h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {modalType === "Edit" ? (
            /* --- LIST VIEW --- */
            <div className="exp-list">
              {experiences && experiences.length > 0 ? (
                experiences.map((elem) => (
                  <div className="exp-list-item" key={elem._id}>
                    <img
                      src={elem.companylogo ? `${WEB_URL}${elem.companylogo}` : "images/profile1.png"}
                      alt="Logo"
                      className="exp-logo"
                    />
                    <div className="exp-info">
                      <h4 className="exp-role">{elem.position}</h4>
                      <p className="exp-company">{elem.companyname}</p>
                      <span className="exp-date">
                        {formatDate(elem.joindate)} - {elem.enddate ? formatDate(elem.enddate) : "Present"}
                      </span>
                    </div>
                    <button 
                        className="edit-icon-btn" 
                        onClick={() => {
                          setEx(elem);
                          setJoinDate(elem.joindate ? elem.joindate.split("T")[0] : "");
                          setEndDate(elem.enddate ? elem.enddate.split("T")[0] : "");
                          setModalType("AddEdit");
                        }}
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', color: '#999', padding: '40px'}}>
                    <i className="fa-regular fa-folder-open" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                    <p>No experience added yet.</p>
                </div>
              )}
              
              {/* Add Button inside List View */}
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                 <button className="btn-save" onClick={() => { setEx({}); setJoinDate(""); setEndDate(""); setModalType("AddEdit"); }}>
                    <i className="fa-solid fa-plus"></i> Add New
                 </button>
              </div>
            </div>
          ) : (
            /* --- ADD/EDIT FORM --- */
            <div className="exp-form">
              
              {/* Logo Upload */}
              <div className="logo-upload-section">
                <img 
                    src={ex.companylogo ? `${WEB_URL}${ex.companylogo}` : "images/profile1.png"} 
                    alt="Preview" 
                    className="upload-preview" 
                />
                <div>
                    <label className="upload-btn" onClick={triggerFileInput}>
                        <i className="fa-solid fa-upload"></i> Upload Company Logo
                    </label>
                    <input type="file" id="company-logo-input" hidden onChange={handleCompanyLogoChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input 
                    type="text" 
                    name="companyname" 
                    className="form-input" 
                    placeholder="e.g. Google" 
                    value={ex.companyname || ""} 
                    onChange={handleChange} 
                />
                <span className="error-text">{errors.companyname_err}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Position / Role</label>
                <input 
                    type="text" 
                    name="position" 
                    className="form-input" 
                    placeholder="e.g. Senior Developer" 
                    value={ex.position || ""} 
                    onChange={handleChange} 
                />
                <span className="error-text">{errors.position_err}</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                        type="date" 
                        className="form-input" 
                        value={joindate} 
                        onChange={(e) => setJoinDate(e.target.value)} 
                    />
                    <span className="error-text">{errors.joindate_err}</span>
                </div>
                <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                        type="date" 
                        className="form-input" 
                        value={enddate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    name="description" 
                    className="form-input" 
                    rows="4" 
                    placeholder="Describe your responsibilities..." 
                    value={ex.description || ""} 
                    onChange={handleChange}
                    style={{resize: 'vertical'}} 
                />
              </div>

            </div>
          )}

        </div>

        {/* Footer (Only for Form View) */}
        {modalType === "AddEdit" && (
            <div className="modal-footer">
                {ex._id && (
                    <button className="btn-delete" onClick={handleDelete}>Delete</button>
                )}
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button className="btn-save" onClick={ex._id ? handleUpdate : handleInsert}>
                    {ex._id ? "Update Changes" : "Save Experience"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default EditExperienceModal;