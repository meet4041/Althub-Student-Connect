import axios from "axios";
import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

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

  useEffect(() => {
    setExperiences(experience);
    setModalType(modal);
  }, [experience, modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setEx({});
    closeModal();
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

    if (!input["position"]) {
      isValid = false;
      errors["position_err"] = "Please Enter Position";
    }
    if (!joindate) {
      isValid = false;
      errors["joindate_err"] = "Please Choose Joining Date";
    }
    setErrors(errors);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
      axios({
        method: "post",
        url: `${WEB_URL}/api/editExperience`,
        data: {
          _id: ex._id,
          companyname: ex.companyname,
          position: ex.position,
          joindate: joindate,
          enddate: enddate,
          companylogo: ex.companylogo,
          description: ex.description,
        },
      })
        .then((response) => {
          toast.success("Experience Updated!!");
          closeModal();
          getExperience();
          setEx({});
          joindate("");
          enddate("");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleInsert = () => {
    const userID = localStorage.getItem("Althub_Id");
    if (validate()) {
      axios({
        url: `${WEB_URL}/api/addExperience`,
        method: "post",
        data: {
          userid: userID,
          companyname: ex.companyname,
          position: ex.position,
          joindate: joindate,
          enddate: enddate,
          companylogo: ex.companylogo,
          description: ex.description,
        },
      })
        .then((response) => {
          toast.success("Experience Added!!");
          closeModal();
          getExperience();
          setEx({});
          joindate("");
          enddate("");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const formatDate = (date) => {
    if (date == null) {
      return "";
    }
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    switch (month) {
      case "01": return `January ${year}`;
      case "02": return `February ${year}`;
      case "03": return `March ${year}`;
      case "04": return `April ${year}`;
      case "05": return `May ${year}`;
      case "06": return `June ${year}`;
      case "07": return `July ${year}`;
      case "08": return `August ${year}`;
      case "09": return `September ${year}`;
      case "10": return `October ${year}`;
      case "11": return `November ${year}`;
      case "12": return `December ${year}`;
      default: return `Sorry`;
    }
  };

  const handleDelete = () => {
    if (window.confirm("Do You Really want to Delete?") === true) {
      axios({
        method: "delete",
        url: `${WEB_URL}/api/deleteExperience/${ex._id}`,
      }).then((response) => {
        closeModal();
        toast.success("Experience Deleted!!");
        getExperience();
      });
    }
  };

  return (
    <>
      <div className="modal-wrapper" onClick={closeModal}></div>
      <div className="modal-container">
        <div className="edit-profile-header" onClick={closeModal}>
          <h2>{modalType === "Edit" ? "Experience List" : "Add/Edit Experience"}</h2>
          <i className="fa-solid fa-xmark close-modal"></i>
        </div>

        {/* Added wrapper with padding for better alignment */}
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "80vh" }}>
          
          {modalType === "Edit" ? (
            <>
              {experiences && experiences.length > 0 ? (
                experiences.map((elem) => (
                  <div className="edit-experience" key={elem._id}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div className="ex_logo">
                        <img
                          alt="Company Logo"
                          src={
                            elem.companylogo && elem.companylogo !== "undefined"
                              ? `${WEB_URL}${elem.companylogo}`
                              : "/images/profile1.png" // Fallback image
                          }
                          height={60}
                          width={60}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="ex_details">
                        <h4 style={{ margin: "0 0 5px 0" }}>{elem.position}</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                          {elem.companyname} &middot; Full-Time
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                          {formatDate(elem.joindate)} - {formatDate(elem.enddate)}
                        </p>
                      </div>
                    </div>
                    <div className="ex-button">
                      <i
                        className="fa-solid fa-pencil"
                        style={{ cursor: "pointer", color: "#007bff" }}
                        onClick={() => {
                          setEx({
                            _id: elem._id,
                            companyname: elem.companyname,
                            companylogo: elem.companylogo,
                            position: elem.position,
                            description: elem.description,
                          });
                          setJoinDate(elem.joindate ? elem.joindate.split("T")[0] : "");
                          setEndDate(elem.enddate ? elem.enddate.split("T")[0] : "");
                          setModalType("AddEdit");
                        }}
                      ></i>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#777" }}>No experiences found.</p>
              )}
            </>
          ) : (
            <div className="addEdit-experience">
              
              {/* Image Upload Section - Improved UI */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f9f9f9"
                  }}
                >
                  {ex.companylogo ? (
                    <img
                      alt="Preview"
                      src={`${WEB_URL}${ex.companylogo}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <i className="fa-regular fa-image" style={{ fontSize: "24px", color: "#ccc" }}></i>
                  )}
                </div>
                <div>
                  <label 
                    htmlFor="company-logo-upload" 
                    style={{ 
                      cursor: "pointer", 
                      color: "#007bff", 
                      fontWeight: "500",
                      display: "flex", 
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload Company Logo
                  </label>
                  <input
                    id="company-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoChange}
                    name="companylogo"
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* Form Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Company Name</label>
                  <input
                    type="text"
                    name="companyname"
                    placeholder="e.g. Google, Microsoft"
                    value={ex.companyname}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Position</label>
                  <input
                    type="text"
                    name="position"
                    placeholder="e.g. Software Engineer"
                    value={ex.position}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
                  />
                  <div className="text-danger" style={{ fontSize: "12px", marginTop: "2px" }}>{errors.position_err}</div>
                </div>

                {/* Dates Row - Side by Side */}
                <div style={{ display: "flex", gap: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Joining Date</label>
                    <input
                      type="date"
                      name="joindate"
                      value={joindate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
                    />
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "2px" }}>{errors.joindate_err}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Ending Date</label>
                    <input
                      type="date"
                      name="enddate"
                      value={enddate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe your role and achievements..."
                    value={ex.description}
                    onChange={handleChange}
                    rows="4"
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="buttons" style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="action-button-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {modalType === "AddEdit" ? (
                  <>
                    <button
                      type="button"
                      className="action-button-delete"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="action-button-confirm"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="action-button-confirm"
                    onClick={handleInsert}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditExperienceModal;