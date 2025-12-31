import axios from "axios";
import React, { useState, useEffect } from "react";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";

// ... (Styles remain unchanged) ...
const styles = `
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; }
  .modal-card { background: #fff; width: 100%; max-width: 480px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; animation: slideUp 0.3s ease-out; overflow: hidden; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { padding: 20px 30px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
  .modal-title { margin: 0; font-size: 1.2rem; font-weight: 700; color: #2d3436; }
  .close-btn { background: transparent; border: none; font-size: 1.2rem; color: #b2bec3; cursor: pointer; }
  .modal-body { padding: 30px; }
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #636e72; margin-bottom: 8px; }
  .form-input { width: 100%; padding: 12px 15px; border: 1px solid #e0e0e0; border-radius: 8px; outline: none; background: #fcfcfc; }
  .form-input:focus { border-color: #66bd9e; background: #fff; }
  .error-text { color: #ff4757; font-size: 0.75rem; margin-top: 5px; display: block; }
  .modal-footer { padding: 20px 30px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }
  .btn-cancel { background: #f1f2f6; color: #636e72; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .btn-save { background: #66bd9e; color: #fff; border: none; padding: 10px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(102, 189, 158, 0.3); }
`;

const ChangePasswordModal = ({ closeModal }) => {
  const [errors, setErrors] = useState({});
  const [pass, setPass] = useState({ old: "", new: "", confirm: "" });

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleChange = (e) => {
    setPass({ ...pass, [e.target.name]: e.target.value });
    if (errors[e.target.name + "_err"]) setErrors({ ...errors, [e.target.name + "_err"]: "" });
  };

  const validate = () => {
    let input = pass;
    let errors = {};
    let isValid = true;

    if (!input["old"]) { isValid = false; errors["old_err"] = "Current Password is required"; }
    if (!input["new"]) { isValid = false; errors["new_err"] = "New Password is required"; }
    else if (input["new"].length < 8) { isValid = false; errors["new_err"] = "Password must be at least 8 characters"; }
    if (input["confirm"] !== input["new"]) { isValid = false; errors["confirm_err"] = "Passwords do not match"; }

    setErrors(errors);
    return isValid;
  };

  const handleChangePassword = () => {
    if (validate()) {
        axios({
            // FIX: Changed from /userUpdatePassword to /updatePassword to match userRoute.js
            url: `${WEB_URL}/api/updatePassword`, 
            method: "post",
            withCredentials: true, // MANDATORY: Sends the Secure Cookie
            data: {
                // We ONLY send passwords. The backend knows 'who' we are from the cookie.
                oldpassword: pass.old,
                newpassword: pass.new
            }
        }).then((res) => {
            if (res.data.success) {
                toast.success("Password Updated. Logging out...");
                
                // Cleanup and Redirect
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
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Change Password</h2>
          <button className="close-btn" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" name="old" className="form-input" value={pass.old} onChange={handleChange} />
            <span className="error-text">{errors.old_err}</span>
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" name="new" className="form-input" value={pass.new} onChange={handleChange} />
            <span className="error-text">{errors.new_err}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" name="confirm" className="form-input" value={pass.confirm} onChange={handleChange} />
            <span className="error-text">{errors.confirm_err}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={closeModal}>Cancel</button>
          <button className="btn-save" onClick={handleChangePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;