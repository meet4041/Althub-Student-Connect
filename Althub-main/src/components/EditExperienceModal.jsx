import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "../styles/EditExperienceModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, List, ListItem, ListItemAvatar, 
  ListItemText, Avatar, TextField, Grid, Box
} from "@mui/material";

import {
  Close, Edit, Add, Business, Delete, CloudUpload, WorkOutline
} from "@mui/icons-material";

const EditExperienceModal = ({ closeModal, experience, getExperience, modal }) => {
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
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({});
    setJoinDate("");
    setEndDate("");
    if (modalType === "AddEdit") setModalType("Edit");
    else closeModal();
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("profilepic", file);
    axios.post(`${WEB_URL}/api/uploadUserImage`, body, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => setEx({ ...ex, companylogo: res.data.data.url }))
      .catch(() => toast.error("Upload failed"));
  };

  const validate = () => {
    let errs = {};
    let isValid = true;
    if (!ex.companyname) { isValid = false; errs.companyname_err = "Required"; }
    if (!ex.position) { isValid = false; errs.position_err = "Required"; }
    if (!joindate) { isValid = false; errs.joindate_err = "Required"; }
    setErrors(errs);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const userID = localStorage.getItem("Althub_Id");
    const payload = {
        userid: userID,
        _id: ex._id, // Only for edit
        companyname: ex.companyname,
        position: ex.position,
        joindate,
        enddate,
        companylogo: ex.companylogo,
        description: ex.description,
    };

    const url = ex._id ? `${WEB_URL}/api/editExperience` : `${WEB_URL}/api/addExperience`;

    axios.post(url, payload).then(() => {
        toast.success(ex._id ? "Updated!" : "Added!");
        getExperience();
        ex._id ? handleCancel() : closeModal();
    }).catch(console.error);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this experience?")) {
      axios.delete(`${WEB_URL}/api/deleteExperience/${ex._id}`).then(() => {
        toast.success("Deleted!");
        getExperience();
        handleCancel();
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
  };

  const prepareEdit = (elem) => {
    setEx(elem);
    setJoinDate(elem.joindate ? elem.joindate.split("T")[0] : "");
    setEndDate(elem.enddate ? elem.enddate.split("T")[0] : "");
    setModalType("AddEdit");
  };

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle className="exp-modal-title">
        <Typography variant="h6" fontWeight={600}>
            {modalType === "Edit" ? "Experience" : (ex._id ? "Edit Experience" : "Add Experience")}
        </Typography>
        <IconButton onClick={closeModal} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent className="exp-modal-content">
        
        {modalType === "Edit" ? (
            /* --- LIST VIEW --- */
            <div>
                {experiences.length > 0 ? (
                    <List>
                        {experiences.map((elem) => (
                            <ListItem key={elem._id} className="exp-list-item"
                                secondaryAction={
                                    <IconButton edge="end" className="exp-edit-btn" onClick={() => prepareEdit(elem)}>
                                        <Edit />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={elem.companylogo ? `${WEB_URL}${elem.companylogo}` : ""} variant="rounded" className="exp-logo-avatar">
                                        <Business />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={<span className="exp-list-primary">{elem.position}</span>}
                                    secondary={
                                        <span className="exp-list-secondary">
                                            {elem.companyname} <br/>
                                            {formatDate(elem.joindate)} - {elem.enddate ? formatDate(elem.enddate) : "Present"}
                                        </span>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <div className="exp-empty-state">
                        <WorkOutline className="exp-empty-icon" />
                        <Typography color="textSecondary">No experience added yet.</Typography>
                    </div>
                )}
                
                <div className="exp-add-btn-wrapper">
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={() => { setEx({}); setJoinDate(""); setEndDate(""); setModalType("AddEdit"); }}
                        sx={{ bgcolor: '#66bd9e', '&:hover': { bgcolor: '#479378' } }}
                    >
                        Add New
                    </Button>
                </div>
            </div>
        ) : (
            /* --- FORM VIEW --- */
            <div className="exp-form-container">
                <Box className="exp-upload-section">
                    <Avatar 
                        src={ex.companylogo ? `${WEB_URL}${ex.companylogo}` : ""} 
                        variant="rounded" 
                        className="exp-upload-preview" 
                    />
                    <Button component="label" startIcon={<CloudUpload />} sx={{ color: '#66bd9e' }}>
                        Upload Logo <input type="file" hidden onChange={handleCompanyLogoChange} />
                    </Button>
                </Box>

                <TextField
                    label="Company Name" name="companyname" fullWidth variant="outlined"
                    value={ex.companyname || ""} onChange={handleChange}
                    error={!!errors.companyname_err} helperText={errors.companyname_err}
                />

                <TextField
                    label="Position / Role" name="position" fullWidth variant="outlined"
                    value={ex.position || ""} onChange={handleChange}
                    error={!!errors.position_err} helperText={errors.position_err}
                />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
                            value={joindate} onChange={(e) => setJoinDate(e.target.value)}
                            error={!!errors.joindate_err} helperText={errors.joindate_err}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
                            value={enddate} onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <TextField
                    label="Description" name="description" multiline rows={4} fullWidth
                    value={ex.description || ""} onChange={handleChange}
                />

                <div className="exp-form-actions">
                    {ex._id && (
                        <Button startIcon={<Delete />} color="error" onClick={handleDelete} style={{ marginRight: 'auto' }}>Delete</Button>
                    )}
                    <Button onClick={handleCancel} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#66bd9e', '&:hover': { bgcolor: '#479378' } }}>
                        {ex._id ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default EditExperienceModal;