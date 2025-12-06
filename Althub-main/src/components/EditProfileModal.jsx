import axios from "axios";
import React, { useEffect, useState } from "react";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

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
    max-width: 700px;
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

  /* Profile Image Section */
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
  }

  .avatar-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: 15px;
    cursor: pointer;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #f8f9fa;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .upload-icon-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #66bd9e;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border: 2px solid #fff;
  }

  .remove-photo-btn {
    font-size: 0.8rem;
    color: #ff4757;
    background: transparent;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .remove-photo-btn:hover { text-decoration: underline; }

  /* Form Layout */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
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
    padding: 10px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #2d3436;
    outline: none;
    transition: border-color 0.2s;
    background: #fcfcfc;
  }

  .form-input:focus {
    border-color: #66bd9e;
    background: #fff;
  }

  .error-msg {
    color: #ff4757;
    font-size: 0.75rem;
    margin-top: 5px;
    display: block;
  }

  /* Radio Group */
  .radio-group {
    display: flex;
    gap: 20px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #555;
  }

  /* Danger Zone */
  .danger-zone {
    margin-top: 40px;
    padding: 20px;
    border: 1px solid #ffeded;
    background: #fff5f5;
    border-radius: 12px;
  }

  .danger-title {
    color: #c0392b;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .danger-desc {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-bottom: 15px;
  }

  .delete-btn {
    background: #fff;
    color: #c0392b;
    border: 1px solid #c0392b;
    padding: 8px 20px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-btn:hover {
    background: #c0392b;
    color: #fff;
  }

  /* Footer */
  .modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    flex-shrink: 0;
  }

  .btn-cancel {
    background: #f1f2f6;
    color: #636e72;
    border: none;
    padding: 10px 25px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-save {
    background: #66bd9e;
    color: #fff;
    border: none;
    padding: 10px 30px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(102, 189, 158, 0.3);
  }

  .btn-save:hover { background: #479378; }

  /* Select Override */
  .react-select-container { width: 100%; }
`;

// Options for Select
const option1 = [
    { value: "English", label: "English" }, { value: "Hindi", label: "Hindi" }, { value: "Gujarati", label: "Gujarati" },
    { value: "Spanish", label: "Spanish" }, { value: "French", label: "French" }
];
const option2 = [
    { value: "Python", label: "Python" }, { value: "Java", label: "Java" }, { value: "React.js", label: "React.js" },
    { value: "JavaScript", label: "JavaScript" }, { value: "C++", label: "C++" }, { value: "SQL", label: "SQL" }
];

const colorStyle = {
    control: (styles) => ({
      ...styles,
      padding: "2px",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      boxShadow: "none",
      "&:hover": { borderColor: "#66bd9e" }
    }),
};

const EditProfileModal = ({ closeModal, user, getUser }) => {
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({});
  const [dob, setDob] = useState("");
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate(); 

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    if(user) {
        setUserData(user);
        let arr = [];
        if(user.languages) JSON.parse(user.languages).forEach((elem) => arr.push({ value: elem, label: elem }));
        setLanguages(arr);
        arr = [];
        if(user.skills) JSON.parse(user.skills).forEach((elem) => arr.push({ value: elem, label: elem }));
        setSkills(arr);
        setDob(user.dob ? user.dob.split("T")[0] : "");
    }
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userid", user._id);

    axios.put(`${WEB_URL}/api/updateProfilePic`, formData) 
      .then((res) => {
        toast.success("Picture updated!");
        setUserData(prev => ({ ...prev, profilepic: res.data.data.profilepic }));
        getUser(); 
      })
      .catch(() => toast.error("Upload failed."));
  };

  const handleImageDelete = () => {
    if (!window.confirm("Remove profile picture?")) return;
    axios.put(`${WEB_URL}/api/deleteProfilePic/${user._id}`)
      .then(() => {
        toast.success("Picture removed.");
        setUserData(prev => ({ ...prev, profilepic: "" }));
        getUser();
      })
      .catch(() => toast.error("Failed to remove."));
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      axios.delete(`${WEB_URL}/api/deleteUser/${user._id}`)
        .then(() => {
          toast.success("Account Deleted");
          localStorage.clear();
          closeModal();
          navigate("/"); 
        })
        .catch(() => toast.error("Deletion failed."));
    }
  };

  const triggerFileInput = () => document.getElementById("edit-modal-file-input").click();

  const validate = () => {
    let input = userData;
    let errs = {};
    let isValid = true;

    if (!input["fname"]) { isValid = false; errs["fname_err"] = "First Name is required"; }
    if (!input["lname"]) { isValid = false; errs["lname_err"] = "Last Name is required"; }
    if (!input["email"]) { isValid = false; errs["email_err"] = "Email is required"; }
    
    if (input["city"] && input["city"].trim().includes(" ")) {
        isValid = false;
        errs["city_err"] = "City must be a single word (no spaces).";
    }
    if (input["state"] && input["state"].trim().includes(" ")) {
        isValid = false;
        errs["state_err"] = "State must be a single word (no spaces).";
    }

    setErrors(errs);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
      var lang = languages.map((elem) => elem.value);
      var skill = skills.map((elem) => elem.value);
      
      axios.post(`${WEB_URL}/api/userProfileEdit`, {
          id: userData._id,
          fname: userData.fname,
          lname: userData.lname,
          gender: userData.gender,
          dob: dob,
          city: userData.city,
          state: userData.state,
          nation: userData.nation,
          phone: userData.phone,
          email: userData.email,
          github: userData.github,
          portfolioweb: userData.portfolioweb,
          about: userData.about,
          languages: JSON.stringify(lang),
          skills: JSON.stringify(skill),
        })
        .then(() => {
          toast.success("Profile Updated!");
          getUser();
          closeModal();
        })
        .catch(() => toast.error("Update failed"));
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {/* Body */}
        <div className="modal-body">
          
          {/* Avatar Upload */}
          <div className="avatar-section">
            <div className="avatar-wrapper" onClick={triggerFileInput}>
                <img 
                  src={userData.profilepic ? `${WEB_URL}${userData.profilepic}` : "images/profile1.png"} 
                  alt="Avatar" 
                  className="avatar-img" 
                />
                <div className="upload-icon-overlay"><i className="fa-solid fa-camera"></i></div>
            </div>
            {userData.profilepic && (
                <button className="remove-photo-btn" onClick={handleImageDelete}>Remove Photo</button>
            )}
            <input type="file" id="edit-modal-file-input" hidden onChange={handleImageUpload} />
          </div>

          {/* Personal Info */}
          <div className="form-grid">
            <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" name="fname" value={userData.fname || ""} onChange={handleChange} />
                <span className="error-msg">{errors.fname_err}</span>
            </div>
            <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" name="lname" value={userData.lname || ""} onChange={handleChange} />
                <span className="error-msg">{errors.lname_err}</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="radio-group">
                    <label className="radio-option">
                        <input type="radio" name="gender" value="Male" checked={userData.gender === "Male"} onChange={handleChange} /> Male
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="gender" value="Female" checked={userData.gender === "Female"} onChange={handleChange} /> Female
                    </label>
                </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="form-grid">
             <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" name="email" value={userData.email || ""} onChange={handleChange} />
                <span className="error-msg">{errors.email_err}</span>
             </div>
             <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={userData.phone || ""} onChange={handleChange} />
             </div>
          </div>

          <div className="form-grid">
             <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" name="city" value={userData.city || ""} onChange={handleChange} />
                <span className="error-msg">{errors.city_err}</span>
             </div>
             <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" name="state" value={userData.state || ""} onChange={handleChange} />
                <span className="error-msg">{errors.state_err}</span>
             </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Nation</label>
            <input className="form-input" name="nation" value={userData.nation || ""} onChange={handleChange} />
          </div>

          {/* Socials */}
          <div className="form-group">
             <label className="form-label">GitHub URL</label>
             <input className="form-input" name="github" value={userData.github || ""} onChange={handleChange} />
          </div>
          <div className="form-group">
             <label className="form-label">Portfolio URL</label>
             <input className="form-input" name="portfolioweb" value={userData.portfolioweb || ""} onChange={handleChange} />
          </div>

          {/* Skills & Lang */}
          <div className="form-group">
             <label className="form-label">Languages</label>
             <Select options={option1} isMulti onChange={setLanguages} value={languages} styles={colorStyle} />
          </div>
          <div className="form-group">
             <label className="form-label">Skills</label>
             <Select options={option2} isMulti onChange={setSkills} value={skills} styles={colorStyle} />
          </div>

          <div className="form-group">
             <label className="form-label">About</label>
             <textarea 
                className="form-input" 
                name="about" 
                rows="3" 
                value={userData.about || ""} 
                onChange={handleChange}
                style={{resize: 'none'}} 
             />
          </div>

          {/* Danger Zone */}
          <div className="danger-zone">
            <div className="danger-title">Delete Account</div>
            <p className="danger-desc">Permanently remove your account and all data.</p>
            <button type="button" className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={closeModal}>Cancel</button>
          <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;