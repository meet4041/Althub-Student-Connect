import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "../styles/EditEducationModal.css"; 

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, Button, IconButton, Typography, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, 
  Grid, Autocomplete, MenuItem, Select, FormControl, InputLabel,Box
} from "@mui/material";

import { Close, Edit, Add, School, Delete } from "@mui/icons-material";

const EditEducationModal = ({ closeModal, education, getEducation, modal }) => {
  const [ex, setEx] = useState({
    _id: "",
    institutename: "",
    course: "",
    collagelogo: "",
  });
  const [joindate, setJoinDate] = useState(""); // Stores Year only
  const [enddate, setEndDate] = useState("");   // Stores Year only
  const [errors, setErrors] = useState({});
  const [educations, setEducations] = useState([]);
  const [modalType, setModalType] = useState("");
  const [university, setUniversity] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(60), (val, index) => currentYear + 5 - index);

  useEffect(() => {
    setEducations(education);
    setModalType(modal); 
    axios.get(`${WEB_URL}/api/getInstitutes`).then((res) => setUniversity(res.data.data));
  }, [education, modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({ _id: "", institutename: "", course: "", collagelogo: "" });
    setJoinDate("");
    setEndDate("");
    setErrors({});
    if (modalType === "AddEdit") setModalType("Edit"); 
    else closeModal();
  };

  const validate = () => {
    let errs = {};
    let isValid = true;
    if (!ex.course) { isValid = false; errs["course_err"] = "Course Name is required"; }
    if (!ex.institutename) { isValid = false; errs["institute_err"] = "Institute is required"; }
    if (!joindate) { isValid = false; errs["joindate_err"] = "Start Year is required"; }
    setErrors(errs);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const userID = localStorage.getItem("Althub_Id");

    // --- LOGIC FOR DEFAULT MONTHS ---
    // Start Year becomes July (Year-07-01)
    const formattedJoinDate = joindate ? `${joindate}-07-01` : "";
    
    // End Year becomes April (Year-04-30)
    const formattedEndDate = enddate ? `${enddate}-04-30` : "";

    const payload = {
        userid: userID,
        id: ex._id,
        institutename: ex.institutename,
        course: ex.course,
        joindate: formattedJoinDate, // July Default
        enddate: formattedEndDate,   // April Default
        collagelogo: ex.collagelogo,
    };

    const url = ex._id ? `${WEB_URL}/api/editEducation` : `${WEB_URL}/api/addEducation`;

    axios.post(url, payload)
        .then(() => {
            toast.success(ex._id ? "Education Updated!" : "Education Added!");
            getEducation();
            ex._id ? setModalType("Edit") : closeModal();
        })
        .catch((error) => console.log(error));
  };

  const handleDelete = () => {
    if (window.confirm("Delete this record?")) {
      axios.delete(`${WEB_URL}/api/deleteEducation/${ex._id}`).then(() => {
          toast.success("Deleted!");
          getEducation();
          handleCancel();
      });
    }
  };

  // Extract just the year from DB string "YYYY-MM-DD" to display in dropdown
  const extractYear = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.substring(0, 4);
  };

  const prepareEdit = (elem) => {
    setEx(elem);
    setJoinDate(extractYear(elem.joindate));
    setEndDate(extractYear(elem.enddate));
    setModalType("AddEdit");
  };

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle className="edu-modal-title">
        <Typography variant="h6" fontWeight={600}>
            {modalType === "Edit" ? "Education History" : (ex._id ? "Edit Education" : "Add Education")}
        </Typography>
        <IconButton onClick={closeModal} size="small" style={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers className="edu-modal-content">
        
        {modalType === "Edit" ? (
            <div className="edu-list-view">
                {educations.length > 0 ? (
                    <List>
                        {educations.map((elem) => (
                            <ListItem key={elem._id} secondaryAction={<IconButton edge="end" onClick={() => prepareEdit(elem)}><Edit /></IconButton>}>
                                <ListItemAvatar>
                                    <Avatar src={elem.collagelogo ? `${WEB_URL}${elem.collagelogo}` : ""} variant="rounded"><School /></Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={elem.course}
                                    secondary={`${elem.institutename} | ${extractYear(elem.joindate)} - ${elem.enddate ? extractYear(elem.enddate) : "Present"}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box textAlign="center" py={3}>
                        <School fontSize="large" color="disabled" />
                        <Typography color="textSecondary">No education added.</Typography>
                    </Box>
                )}
                <Button fullWidth variant="contained" startIcon={<Add />} onClick={() => { setEx({_id:"", institutename:"", course:"", collagelogo:""}); setModalType("AddEdit"); }} sx={{ mt: 2, bgcolor: '#66bd9e' }}>
                    Add New
                </Button>
            </div>
        ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <Autocomplete
                        options={university}
                        getOptionLabel={(option) => option.name || ""}
                        value={university.find(u => u.name === ex.institutename) || null}
                        onChange={(event, newValue) => {
                            if (newValue) setEx({ ...ex, institutename: newValue.name, collagelogo: newValue.image });
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <img src={`${WEB_URL}${option.image}`} alt="" style={{ width: 30, marginRight: 10 }} />
                                {option.name}
                            </li>
                        )}
                        renderInput={(params) => <TextField {...params} label="Institute" error={!!errors.institute_err} helperText={errors.institute_err} />}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField label="Course" name="course" fullWidth value={ex.course} onChange={handleChange} error={!!errors.course_err} helperText={errors.course_err} />
                </Grid>

                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Start Year</InputLabel>
                        <Select value={joindate} label="Start Year" onChange={(e) => setJoinDate(e.target.value)}>
                            {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>End Year</InputLabel>
                        <Select value={enddate} label="End Year" onChange={(e) => setEndDate(e.target.value)}>
                            <MenuItem value="">Present</MenuItem>
                            {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 2 }}>
                    {ex._id && <Button color="error" onClick={handleDelete} sx={{ mr: 'auto' }}>Delete</Button>}
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#66bd9e' }}>Save</Button>
                </Grid>
            </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEducationModal;