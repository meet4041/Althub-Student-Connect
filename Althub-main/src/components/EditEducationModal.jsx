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

  /* --- LIST VIEW --- */
  .edu-list-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border-bottom: 1px solid #f9f9f9;
    transition: background 0.2s;
    border-radius: 12px;
  }
  .edu-list-item:hover { background: #f8f9fa; }
  .edu-list-item:last-child { border-bottom: none; }

  .edu-logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #eee;
    background: #fff;
  }

  .edu-info { flex: 1; }
  .edu-course { font-size: 1.1rem; font-weight: 600; color: #333; margin: 0; }
  .edu-institute { font-size: 0.9rem; color: #555; margin: 2px 0; }
  .edu-date { font-size: 0.8rem; color: #888; }

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
  .form-group { margin-bottom: 20px; position: relative; }
  
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

  /* Custom Dropdown for Institute */
  .institute-dropdown {
    position: relative;
    cursor: pointer;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fcfcfc;
    font-size: 0.95rem;
    color: #333;
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 5px;
  }

  .dropdown-item {
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .dropdown-item:hover { background: #f0f9f6; }
  .dropdown-item img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }

  /* Footer */
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

const EditEducationModal = ({ closeModal, education, getEducation, modal }) => {
  const [ex, setEx] = useState({
    _id: "",
    institutename: "",
    course: "",
    collagelogo: "",
  });
  const [joindate, setJoinDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [educations, setEducations] = useState([]);
  const [modalType, setModalType] = useState("");
  const [university, setUniversity] = useState([]);
  const [universityShow, setUniversityShow] = useState(false);

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    setEducations(education);
    setModalType(modal);
    getUniversity();
  }, [education , modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({});
    setJoinDate("");
    setEndDate("");
    setUniversityShow(false);
    if (modalType === "AddEdit") {
        setModalType("Edit"); 
    } else {
        closeModal();
    }
  };

  const validate = () => {
    let input = ex;
    let errs = {};
    let isValid = true;

    if (!input["course"]) {
      isValid = false;
      errs["course_err"] = "Course Name is required";
    }
    if (!input["institutename"]) {
        isValid = false;
        errs["institute_err"] = "Institute is required";
    }
    if (!joindate) {
      isValid = false;
      errs["joindate_err"] = "Start Date is required";
    }
    setErrors(errs);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
      axios.post(`${WEB_URL}/api/editEducation`, {
          id: ex._id,
          institutename: ex.institutename,
          course: ex.course,
          joindate: joindate,
          enddate: enddate,
          collagelogo: ex.collagelogo,
        })
        .then(() => {
          toast.success("Education Updated!");
          getEducation();
          handleCancel();
        })
        .catch((error) => console.log(error));
    }
  };

  const handleInsert = () => {
    const userID = localStorage.getItem("Althub_Id");
    if (validate()) {
      axios.post(`${WEB_URL}/api/addEducation`, {
          userid: userID,
          institutename: ex.institutename,
          course: ex.course,
          joindate: joindate,
          enddate: enddate,
          collagelogo: ex.collagelogo,
        })
        .then(() => {
          toast.success("Education Added!");
          getEducation();
          closeModal();
        })
        .catch((error) => console.log(error));
    }
  };

  const getUniversity = () => {
    axios.get(`${WEB_URL}/api/getInstitutes`).then((response) => {
      setUniversity(response.data.data);
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
  };

  const handleDelete = () => {
    if(window.confirm("Delete this education record?")){
      axios.delete(`${WEB_URL}/api/deleteEducation/${ex._id}`)
      .then(() => {
        toast.success("Deleted!");
        getEducation();
        handleCancel();
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
             {modalType === "Edit" ? "Education History" : (ex._id ? "Edit Education" : "Add Education")}
          </h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {modalType === "Edit" ? (
            /* --- LIST VIEW --- */
            <div className="edu-list">
              {educations && educations.length > 0 ? (
                educations.map((elem) => (
                  <div className="edu-list-item" key={elem._id}>
                    <img
                      src={elem.collagelogo ? `${WEB_URL}${elem.collagelogo}` : "/images/profile1.png"}
                      alt="Logo"
                      className="edu-logo"
                    />
                    <div className="edu-info">
                      <h4 className="edu-course">{elem.course}</h4>
                      <p className="edu-institute">{elem.institutename}</p>
                      <span className="edu-date">
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
                    <i className="fa-solid fa-graduation-cap" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                    <p>No education added yet.</p>
                </div>
              )}
              
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                 <button className="btn-save" onClick={() => { setEx({}); setJoinDate(""); setEndDate(""); setModalType("AddEdit"); }}>
                    <i className="fa-solid fa-plus"></i> Add New
                 </button>
              </div>
            </div>
          ) : (
            /* --- ADD/EDIT FORM --- */
            <div className="edu-form">
              
              {/* Institute Dropdown */}
              <div className="form-group institute-dropdown">
                <label className="form-label">Institute</label>
                <div 
                    className="dropdown-trigger" 
                    onClick={() => setUniversityShow(!universityShow)}
                >
                    <span>{ex.institutename || "Select Institute"}</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
                {universityShow && (
                    <div className="dropdown-list">
                        {university.map((elem, idx) => (
                            <div 
                                key={idx} 
                                className="dropdown-item"
                                onClick={() => {
                                    setEx({ ...ex, institutename: elem.name, collagelogo: elem.image });
                                    setUniversityShow(false);
                                    setErrors({...errors, institute_err: ""});
                                }}
                            >
                                {elem.image && <img src={`${WEB_URL}${elem.image}`} alt="" />}
                                <span>{elem.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <span className="error-text">{errors.institute_err}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Course / Degree</label>
                <input 
                    type="text" 
                    name="course" 
                    className="form-input" 
                    placeholder="e.g. B.Tech Computer Science" 
                    value={ex.course || ""} 
                    onChange={handleChange} 
                />
                <span className="error-text">{errors.course_err}</span>
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

            </div>
          )}

        </div>

        {/* Footer (Form View Only) */}
        {modalType === "AddEdit" && (
            <div className="modal-footer">
                {ex._id && (
                    <button className="btn-delete" onClick={handleDelete}>Delete</button>
                )}
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                <button className="btn-save" onClick={ex._id ? handleUpdate : handleInsert}>
                    {ex._id ? "Update Changes" : "Save Education"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default EditEducationModal;