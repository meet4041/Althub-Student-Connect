import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "../styles/EditExperienceModal.css";

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, Button, IconButton, Typography, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Grid, Box
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
const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setExperiences(experience);
    setModalType(modal);
  }, [experience, modal]);

  const handleChange = (e) => {
    setEx({ ...ex, [e.target.name]: e.target.value });
    setErrors({ ...errors, [`${e.target.name}_err`]: "" });
  };

  const handleCancel = () => {
    setEx({ _id: "", companyname: "", position: "", companylogo: "", description: "" });
    setJoinDate("");
    setEndDate("");
    if (modalType === "AddEdit") setModalType("Edit");
    else closeModal();
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) { 
      toast.error("Logo size cannot exceed 3MB");
      e.target.value = "";
      return;
    }

    setUploading(true);

    const body = new FormData();
    body.append("companylogo", file); // Key must match backend storage setup

    axios.post(`${WEB_URL}/api/uploadCompanyLogo`, body, { 
        headers: { "Content-Type": "multipart/form-data" } 
    })
    .then((res) => {
        // Backend returns: { success: true, data: { url: "/api/images/{fileId}" } }
        const imagePath = res.data.data?.url; 
        if (imagePath) {
            setEx((prev) => ({ ...prev, companylogo: imagePath }));
            toast.success("Logo uploaded successfully!");
        } else {
            toast.error("No image path returned from server");
        }
    })
    .catch((err) => {
        console.error("Upload error:", err);
        toast.error(err.response?.data?.msg || "Upload failed");
        e.target.value = "";
      })
      .finally(() => setUploading(false));
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
      _id: ex._id || "",
      companyname: ex.companyname,
      position: ex.position,
      joindate,
      enddate,
      companylogo: ex.companylogo,
      description: ex.description,
    };

    const url = ex._id ? `${WEB_URL}/api/editExperience` : `${WEB_URL}/api/addExperience`;
    console.log('Submitting experience payload:', payload, 'to', url);
    axios.post(url, payload)
      .then((res) => {
        if (res.data && res.data.success) {
          toast.success(ex._id ? "Updated!" : "Added!");
          getExperience();
          ex._id ? setModalType("Edit") : closeModal();
        } else {
          console.error('Save failed response:', res.data);
          toast.error(res.data?.msg || 'Save failed');
        }
      })
      .catch((err) => {
        console.error('Save error:', err);
        toast.error(err.response?.data?.msg || 'Save failed');
      });
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
        <IconButton onClick={closeModal} size="small" style={{position:'absolute', right:8, top:8}}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers className="exp-modal-content">
        
        {modalType === "Edit" ? (
            /* --- LIST VIEW --- */
            <div>
                {experiences.length > 0 ? (
                    <List>
                        {experiences.map((elem) => (
                            <ListItem key={elem._id} className="exp-list-item"
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => prepareEdit(elem)}><Edit /></IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar 
                                        src={elem.companylogo ? (elem.companylogo.startsWith('http') ? elem.companylogo : `${WEB_URL}${elem.companylogo}`) : ""} 
                                        variant="rounded" 
                                    >
                                        <Business />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={elem.position}
                                    secondary={`${elem.companyname} | ${formatDate(elem.joindate)} - ${elem.enddate ? formatDate(elem.enddate) : "Present"}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box textAlign="center" py={3}>
                        <WorkOutline fontSize="large" color="disabled" />
                        <Typography color="textSecondary">No experience added yet.</Typography>
                    </Box>
                )}
                <Button fullWidth variant="contained" startIcon={<Add />} onClick={() => { setEx({_id:"", companyname:"", position:"", companylogo:"", description:""}); setModalType("AddEdit"); }} sx={{ mt: 2, bgcolor: '#66bd9e' }}>
                    Add New
                </Button>
            </div>
        ) : (
            /* --- FORM VIEW --- */
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Avatar 
                        src={ex.companylogo ? (ex.companylogo.startsWith('http') ? ex.companylogo : `${WEB_URL}${ex.companylogo}`) : ""} 
                        variant="rounded" 
                        sx={{ width: 80, height: 80, border: '1px solid #eee' }}
                    >
                        <Business sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Button component="label" startIcon={<CloudUpload />} size="small" disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload Logo"}
                      <input type="file" hidden accept="image/*" onChange={handleCompanyLogoChange} disabled={uploading} />
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <TextField label="Company Name" name="companyname" fullWidth value={ex.companyname} onChange={handleChange} error={!!errors.companyname_err} helperText={errors.companyname_err} />
                </Grid>

                <Grid item xs={12}>
                    <TextField label="Position / Role" name="position" fullWidth value={ex.position} onChange={handleChange} error={!!errors.position_err} helperText={errors.position_err} />
                </Grid>

                <Grid item xs={6}>
                    <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={joindate} onChange={(e) => setJoinDate(e.target.value)} error={!!errors.joindate_err} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={enddate} onChange={(e) => setEndDate(e.target.value)} />
                </Grid>

                <Grid item xs={12}>
                    <TextField label="Description" name="description" multiline rows={3} fullWidth value={ex.description} onChange={handleChange} />
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

export default EditExperienceModal;