import React, { useEffect, useState } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/EditProfileModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, TextField, Grid, 
  Avatar, Box, Radio, RadioGroup, FormControlLabel, 
  FormControl, FormLabel, Autocomplete
} from "@mui/material";

import {
  Close, CameraAlt, Delete
} from "@mui/icons-material";

// Options for Autocomplete (MUI expects simple array or objects)
const languageOptions = ["English", "Hindi", "Gujarati", "Spanish", "French"];
const skillOptions = ["Python", "Java", "React.js", "JavaScript", "C++", "SQL"];

const EditProfileModal = ({ closeModal, user, getUser }) => {
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({});
  const [dob, setDob] = useState("");
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    if(user) {
        setUserData(user);
        
        let parsedLangs = [];
        try { parsedLangs = JSON.parse(user.languages) || []; } catch(e){}
        setLanguages(parsedLangs); // Store as array of strings ["English", "Hindi"]

        let parsedSkills = [];
        try { parsedSkills = JSON.parse(user.skills) || []; } catch(e){}
        setSkills(parsedSkills);

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

    if (file.size > 3 * 1024 * 1024) { 
        toast.error("Profile photo size cannot exceed 3MB");
        e.target.value = "";
        return;
    }

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

  const validate = () => {
    let input = userData;
    let errs = {};
    let isValid = true;

    if (!input["fname"]) { isValid = false; errs["fname_err"] = "Required"; }
    if (!input["lname"]) { isValid = false; errs["lname_err"] = "Required"; }
    if (!input["email"]) { isValid = false; errs["email_err"] = "Required"; }
    if (input["city"] && input["city"].trim().includes(" ")) { isValid = false; errs["city_err"] = "No spaces allowed"; }
    if (input["state"] && input["state"].trim().includes(" ")) { isValid = false; errs["state_err"] = "No spaces allowed"; }

    setErrors(errs);
    return isValid;
  };

  const handleUpdate = () => {
    if (validate()) {
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
          languages: JSON.stringify(languages), // Send as JSON string
          skills: JSON.stringify(skills),
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
    <Dialog open={true} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle className="ep-modal-title">
        <Typography variant="h6" fontWeight={700}>Edit Profile</Typography>
        <IconButton onClick={closeModal} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent className="ep-modal-content">
        
        {/* Avatar Section */}
        <Box className="ep-avatar-section">
            <Box className="ep-avatar-wrapper" onClick={() => document.getElementById("edit-file-input").click()}>
                <Avatar 
                    src={userData.profilepic ? `${WEB_URL}${userData.profilepic}` : ""} 
                    className="ep-avatar-img"
                />
                <div className="ep-upload-icon"><CameraAlt fontSize="small" /></div>
            </Box>
            {userData.profilepic && (
                <Button className="ep-remove-photo-btn" onClick={handleImageDelete}>Remove Photo</Button>
            )}
            <input type="file" id="edit-file-input" hidden onChange={handleImageUpload} />
        </Box>

        <Box className="ep-form-container">
            {/* Personal Info */}
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField 
                        label="First Name" name="fname" fullWidth variant="outlined" 
                        value={userData.fname || ""} onChange={handleChange} 
                        error={!!errors.fname_err} helperText={errors.fname_err}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                        label="Last Name" name="lname" fullWidth variant="outlined" 
                        value={userData.lname || ""} onChange={handleChange} 
                        error={!!errors.lname_err} helperText={errors.lname_err}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <TextField 
                        label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }}
                        value={dob} onChange={(e) => setDob(e.target.value)} 
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControl>
                        <FormLabel>Gender</FormLabel>
                        <RadioGroup row name="gender" value={userData.gender || ""} onChange={handleChange}>
                            <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" />
                            <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Contact */}
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField 
                        label="Email" name="email" fullWidth variant="outlined" 
                        value={userData.email || ""} onChange={handleChange} 
                        error={!!errors.email_err} helperText={errors.email_err}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                        label="Phone" name="phone" fullWidth variant="outlined" 
                        value={userData.phone || ""} onChange={handleChange} 
                    />
                </Grid>
            </Grid>

            {/* Location */}
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextField 
                        label="City" name="city" fullWidth variant="outlined" 
                        value={userData.city || ""} onChange={handleChange} 
                        error={!!errors.city_err} helperText={errors.city_err}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField 
                        label="State" name="state" fullWidth variant="outlined" 
                        value={userData.state || ""} onChange={handleChange} 
                        error={!!errors.state_err} helperText={errors.state_err}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField 
                        label="Nation" name="nation" fullWidth variant="outlined" 
                        value={userData.nation || ""} onChange={handleChange} 
                    />
                </Grid>
            </Grid>

            {/* Socials */}
            <TextField 
                label="GitHub URL" name="github" fullWidth variant="outlined" 
                value={userData.github || ""} onChange={handleChange} 
            />
            <TextField 
                label="Portfolio URL" name="portfolioweb" fullWidth variant="outlined" 
                value={userData.portfolioweb || ""} onChange={handleChange} 
            />

            {/* Skills & Languages (Autocomplete) */}
            <Autocomplete
                multiple
                options={languageOptions}
                value={languages}
                onChange={(event, newValue) => setLanguages(newValue)}
                renderInput={(params) => <TextField {...params} label="Languages" placeholder="Select languages" />}
            />

            <Autocomplete
                multiple
                options={skillOptions}
                value={skills}
                onChange={(event, newValue) => setSkills(newValue)}
                renderInput={(params) => <TextField {...params} label="Skills" placeholder="Select skills" />}
            />

            <TextField 
                label="About" name="about" multiline rows={3} fullWidth variant="outlined" 
                value={userData.about || ""} onChange={handleChange} 
            />
        </Box>

        {/* Danger Zone */}
        <Box className="ep-danger-zone">
            <Typography variant="subtitle1" className="ep-danger-title">Delete Account</Typography>
            <Typography variant="body2" className="ep-danger-desc">
                Permanently remove your account and all data.
            </Typography>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteAccount} className="ep-delete-btn">
                Delete Account
            </Button>
        </Box>

      </DialogContent>

      <DialogActions className="ep-modal-actions">
        <Button onClick={closeModal} color="inherit">Cancel</Button>
        <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#66bd9e', '&:hover': { bgcolor: '#479378' } }}>
            Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;