import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "../styles/EditEducationModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, List, ListItem, ListItemAvatar, 
  ListItemText, Avatar, TextField, Grid, Autocomplete, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

import {
  Close, Edit, Add, School, Delete
} from "@mui/icons-material";

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

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(60), (val, index) => currentYear + 5 - index);

  useEffect(() => {
    setEducations(education);
    setModalType(modal); // "Edit" (List) or "Add" (Form)
    axios.get(`${WEB_URL}/api/getInstitutes`).then((res) => setUniversity(res.data.data));
  }, [education, modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({});
    setJoinDate("");
    setEndDate("");
    setErrors({});
    if (modalType === "AddEdit") {
      setModalType("Edit"); // Go back to list
    } else {
      closeModal();
    }
  };

  const validate = () => {
    let input = ex;
    let errs = {};
    let isValid = true;

    if (!input["course"]) { isValid = false; errs["course_err"] = "Course Name is required"; }
    if (!input["institutename"]) { isValid = false; errs["institute_err"] = "Institute is required"; }
    if (!joindate) { isValid = false; errs["joindate_err"] = "Start Year is required"; }
    
    setErrors(errs);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const userID = localStorage.getItem("Althub_Id");
    const payload = {
        userid: userID,
        id: ex._id,
        institutename: ex.institutename,
        course: ex.course,
        joindate: joindate.toString(),
        enddate: enddate ? enddate.toString() : "",
        collagelogo: ex.collagelogo,
    };

    const url = ex._id ? `${WEB_URL}/api/editEducation` : `${WEB_URL}/api/addEducation`;

    axios.post(url, payload)
        .then(() => {
            toast.success(ex._id ? "Education Updated!" : "Education Added!");
            getEducation();
            ex._id ? handleCancel() : closeModal();
        })
        .catch((error) => console.log(error));
  };

  const handleDelete = () => {
    if (window.confirm("Delete this education record?")) {
      axios.delete(`${WEB_URL}/api/deleteEducation/${ex._id}`)
        .then(() => {
          toast.success("Deleted!");
          getEducation();
          handleCancel();
        });
    }
  };

  // Date Formatting Helper
  const formatDateDisplay = (date) => {
    if (!date) return "";
    if (!date.includes("-") && !date.includes("T") && date.length === 4) return date;
    return new Date(date).getFullYear().toString();
  };

  // Pre-fill form helpers
  const prepareEdit = (elem) => {
    setEx(elem);
    setJoinDate(formatDateDisplay(elem.joindate));
    setEndDate(formatDateDisplay(elem.enddate));
    setModalType("AddEdit");
  };

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle className="edu-modal-title">
        <Typography variant="h6" fontWeight={600}>
            {modalType === "Edit" ? "Education History" : (ex._id ? "Edit Education" : "Add Education")}
        </Typography>
        <IconButton onClick={closeModal} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent className="edu-modal-content">
        
        {modalType === "Edit" ? (
            /* --- LIST VIEW --- */
            <div className="edu-list-view">
                {educations.length > 0 ? (
                    <List>
                        {educations.map((elem) => (
                            <ListItem key={elem._id} className="edu-list-item"
                                secondaryAction={
                                    <IconButton edge="end" className="edu-edit-icon-btn" onClick={() => prepareEdit(elem)}>
                                        <Edit />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={elem.collagelogo ? `${WEB_URL}${elem.collagelogo}` : ""} variant="rounded" className="edu-logo-avatar">
                                        <School />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={<span className="edu-list-text-primary">{elem.course}</span>}
                                    secondary={
                                        <span className="edu-list-text-secondary">
                                            {elem.institutename} <br/>
                                            {formatDateDisplay(elem.joindate)} - {elem.enddate ? formatDateDisplay(elem.enddate) : "Present"}
                                        </span>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <div className="edu-empty-state">
                        <School className="edu-empty-icon" />
                        <Typography color="textSecondary">No education added yet.</Typography>
                    </div>
                )}
                
                <div className="edu-add-btn-wrapper">
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
            <div className="edu-form-container">
                {/* Institute Autocomplete */}
                <Autocomplete
                    options={university}
                    getOptionLabel={(option) => option.name || ""}
                    value={university.find(u => u.name === ex.institutename) || null}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            setEx({ ...ex, institutename: newValue.name, collagelogo: newValue.image });
                            setErrors({ ...errors, institute_err: "" });
                        }
                    }}
                    renderOption={(props, option) => (
                        <li {...props} className="edu-institute-option">
                            <img src={`${WEB_URL}${option.image}`} alt="" className="edu-institute-img" />
                            {option.name}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Institute" 
                            variant="outlined" 
                            error={!!errors.institute_err} 
                            helperText={errors.institute_err}
                        />
                    )}
                />

                <TextField
                    label="Course / Degree"
                    name="course"
                    value={ex.course || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.course_err}
                    helperText={errors.course_err}
                />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth error={!!errors.joindate_err}>
                            <InputLabel>Start Year</InputLabel>
                            <Select
                                value={joindate}
                                label="Start Year"
                                onChange={(e) => setJoinDate(e.target.value)}
                            >
                                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                            </Select>
                            {errors.joindate_err && <Typography variant="caption" color="error">{errors.joindate_err}</Typography>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>End Year</InputLabel>
                            <Select
                                value={enddate}
                                label="End Year"
                                onChange={(e) => setEndDate(e.target.value)}
                            >
                                <MenuItem value="">Present</MenuItem>
                                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <div className="edu-form-actions">
                    {ex._id && (
                        <Button startIcon={<Delete />} color="error" onClick={handleDelete} style={{ marginRight: 'auto' }}>
                            Delete
                        </Button>
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

export default EditEducationModal;