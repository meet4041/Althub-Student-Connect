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
  }, [experience,modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setEx();
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
        data:{
          _id: ex._id,
          companyname: ex.companyname,
          position: ex.position,
          joindate: joindate,
          enddate: enddate,
          companylogo: ex.companylogo,
          description: ex.description,}
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
    const userID=localStorage.getItem("Althub_Id");
    if (validate()) {
      axios({
        url:`${WEB_URL}/api/addExperience`,
        method:"post",
        data:{userid:userID,
          companyname:ex.companyname,
          position:ex.position,
          joindate:joindate,
          enddate:enddate,
          companylogo:ex.companylogo,
          description:ex.description}
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
    if(date==null){
      return '';
    }
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    switch (month) {
      case "01":
        return `January ${year}`;
      case "02":
        return `February ${year}`;
      case "03":
        return `March ${year}`;
      case "04":
        return `April ${year}`;
      case "05":
        return `May ${year}`;
      case "06":
        return `June ${year}`;
      case "07":
        return `July ${year}`;
      case "08":
        return `August ${year}`;
      case "09":
        return `September ${year}`;
      case "10":
        return `October ${year}`;
      case "11":
        return `November ${year}`;
      case "12":
        return `December ${year}`;
      default:
          return `Sorry`;
    }
  };

  const handleDelete = () => {
    if(window.confirm("Do You Really want to Delete?")===true){
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
          <h2>Edit Experience</h2>
          <i className="fa-solid fa-xmark close-modal"></i>
        </div>
        {modalType === "Edit" ? (
          <>
            {experiences &&
              experiences.map((elem) => (
                <div
                  className="edit-experience"
                >
                  <div><div className="ex_logo">
                    <img
                      alt="Description"
                      src={`${WEB_URL}${elem.companylogo}`}
                      height={70}
                      width={70}
                    />
                  </div>
                  <div className="ex_details">
                    <b>{elem.position}</b>
                    <p>{elem.companyname} &middot; Full-Time</p>
                    <p>
                      {formatDate(elem.joindate)} - {formatDate(elem.enddate)}
                    </p>
                  </div></div>
                  <div className="ex-button">
                    <i
                      className="fa-solid fa-pencil"
                      onClick={() => {
                        setEx({
                          _id: elem._id,
                          companyname: elem.companyname,
                          companylogo: elem.companylogo,
                          position: elem.position,
                          description: elem.description,
                        });
                        setJoinDate(elem.joindate.split("T")[0]);
                        setEndDate(elem.enddate.split("T")[0]);
                        setModalType("AddEdit");
                      }}
                    ></i>
                  </div>
                </div>
              ))}
          </>
        ) : (
          <>
            <div className="addEdit-experience">
              <span>Company Logo</span>
              <div className="profile-uload" style={{ marginBottom: "10px" }}>
                {ex.companylogo ? (
                  <img
                    alt=""
                    src={`${WEB_URL}${ex.companylogo}`}
                    height={70}
                    width={70}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      backgroundColor: "#F3F3F3",
                    }}
                  ></div>
                )}
                <div className="information-profile-upload" style={{ marginTop: "8px" }}>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoChange}
                      name="companylogo"
                    /><span>image</span>
                  </label>
                </div>
              </div>
              <span>Company</span>
              <input
                type="text"
                name="companyname"
                placeholder="Company"
                value={ex.companyname}
                onChange={handleChange}
              />
              <span>Position</span>
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={ex.position}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.position_err}</div>
              <span>Joining Date</span>
              <input
                type="date"
                name="joindate"
                value={joindate}
                onChange={(e) => {
                  setJoinDate(e.target.value);
                }}
              />
              <div className="text-danger">{errors.joindate_err}</div>
              <span>Ending Date</span>
              <input
                type="date"
                name="enddate"
                value={enddate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
              />
              <span>Description</span>
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={ex.description}
                onChange={handleChange}
              />
              <div className="buttons">
                <button
                  type="button"
                  className="action-button-cancel"
                  onClick={handleCancel}
                >Cancel</button>
                {modalType === "AddEdit" ? (
                  <> <button
                  type="button"
                  className="action-button-delete"
                  onClick={handleDelete}
                >
                  Delete
                </button> <button
                    type="button"
                    className="action-button-confirm"
                    onClick={handleUpdate}
                  >
                    Update
                  </button></>
                ) : (
                  <button
                    type="button"
                    className="action-button-confirm"
                    onClick={handleInsert}
                  >Insert</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EditExperienceModal;
