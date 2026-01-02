import axios from "axios";
import React, { useState } from "react";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "../styles/ChangePasswordModal.css"; // <--- Import the new CSS

const ChangePasswordModal = ({ closeModal }) => {
  const [errors, setErrors] = useState({});
  const [pass, setPass] = useState({ old: "", new: "", confirm: "" });

  const handleChange = (e) => {
    setPass({ ...pass, [e.target.name]: e.target.value });
    if (errors[e.target.name + "_err"]) {
        setErrors({ ...errors, [e.target.name + "_err"]: "" });
    }
  };

  const validate = () => {
    let input = pass;
    let errors = {};
    let isValid = true;

    if (!input["old"]) { 
        isValid = false; 
        errors["old_err"] = "Current Password is required"; 
    }
    if (!input["new"]) { 
        isValid = false; 
        errors["new_err"] = "New Password is required"; 
    } else if (input["new"].length < 8) { 
        isValid = false; 
        errors["new_err"] = "Password must be at least 8 characters"; 
    }
    if (input["confirm"] !== input["new"]) { 
        isValid = false; 
        errors["confirm_err"] = "Passwords do not match"; 
    }

    setErrors(errors);
    return isValid;
  };

  const handleChangePassword = () => {
    if (validate()) {
        axios({
            url: `${WEB_URL}/api/updatePassword`, 
            method: "post",
            withCredentials: true,
            data: {
                oldpassword: pass.old,
                newpassword: pass.new
            }
        }).then((res) => {
            if (res.data.success) {
                toast.success("Password Updated. Logging out...");
                
                localStorage.removeItem("Althub_Token");
                localStorage.removeItem("Althub_Id");
                closeModal();
                
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            }
        }).catch((error) => {
            console.error("Change Password Error:", error);
            const msg = error.response?.data?.msg || "Failed to update password";
            toast.error(msg);
        });
    }
  };

  return (
    <div className="password-modal-overlay" onClick={closeModal}>
      <div className="password-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h2 className="password-modal-title">Change Password</h2>
          <button className="password-close-btn" onClick={closeModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="password-modal-body">
          <div className="password-form-group">
            <label className="password-form-label">Current Password</label>
            <input 
                type="password" 
                name="old" 
                className="password-form-input" 
                value={pass.old} 
                onChange={handleChange} 
            />
            <span className="password-error-text">{errors.old_err}</span>
          </div>
          <div className="password-form-group">
            <label className="password-form-label">New Password</label>
            <input 
                type="password" 
                name="new" 
                className="password-form-input" 
                value={pass.new} 
                onChange={handleChange} 
            />
            <span className="password-error-text">{errors.new_err}</span>
          </div>
          <div className="password-form-group">
            <label className="password-form-label">Confirm New Password</label>
            <input 
                type="password" 
                name="confirm" 
                className="password-form-input" 
                value={pass.confirm} 
                onChange={handleChange} 
            />
            <span className="password-error-text">{errors.confirm_err}</span>
          </div>
        </div>
        <div className="password-modal-footer">
          <button className="password-btn-cancel" onClick={closeModal}>Cancel</button>
          <button className="password-btn-save" onClick={handleChangePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;