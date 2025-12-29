import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import "../styles/ViewProfile.css"; // <--- Import CSS

// MUI Components
import {
  Container, Grid, Card, CardContent, Typography, Avatar, Box, IconButton,
  Button, Menu, MenuItem, Chip, Divider, ListItemIcon
} from "@mui/material";

// Icons
import {
  Edit, Add, MoreVert, Delete, Lock, GitHub, Language,
  Place, School, Work
} from "@mui/icons-material";

// Modals (Assume these are refactored or adapt to props)
import EditProfileModal from "./EditProfileModal";
import EditExperienceModal from "./EditExperienceModal";
import EditEducationModal from "./EditEducationModal";
import ChangePasswordModal from "./ChangePasswordModal";
import FollowerModal from "./FollowerModal";

export default function ViewProfile() {
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [language, setLanguage] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditExp, setShowEditExp] = useState(false);
  const [showEditEdu, setShowEditEdu] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  
  const [modalType, setModalType] = useState(""); // "Add" or "Edit"
  const [anchorEl, setAnchorEl] = useState(null); // Menu anchor
  const [followerTab, setFollowerTab] = useState("Follower"); 
  const userID = localStorage.getItem("Althub_Id");

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  // --- Data Fetching ---
  const getUser = useCallback(() => {
    axios.get(`${WEB_URL}/api/searchUserById/${userID}`).then((res) => {
      if (res.data?.data) {
        const u = res.data.data[0];
        setUser(u);
        u.languages && setLanguage(JSON.parse(u.languages));
        u.skills && setSkills(JSON.parse(u.skills));
      }
    });
  }, [userID]);

  const getEducation = useCallback(() => {
    axios.post(`${WEB_URL}/api/getEducation`, { userid: userID }).then((res) => setEducation(res.data.data || []));
  }, [userID]);

  const getExperience = useCallback(() => {
    axios.post(`${WEB_URL}/api/getExperience`, { userid: userID }).then((res) => setExperience(res.data.data || []));
  }, [userID]);

  const getNewUsers = useCallback(() => {
    axios.post(`${WEB_URL}/api/getRandomUsers`, { userid: userID }).then((res) => setTopUsers(res.data.data));
  }, [userID]);

  useEffect(() => {
    getUser(); getEducation(); getExperience(); getNewUsers();
  }, [getUser, getEducation, getExperience, getNewUsers]);

  // --- Handlers ---
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      axios.delete(`${WEB_URL}/api/deleteUser/${userID}`).then(() => {
        toast.success("Account Deleted"); localStorage.clear(); nav("/");
      });
    }
  };

  const handleSocialClick = (link) => {
    if (!link) toast.info("Link not added");
    else window.open(link.startsWith('http') ? link : `https://${link}`, "_blank");
  };

  const isAlumni = useMemo(() => {
    if (!education.length) return false;
    let maxYear = 0;
    education.forEach(edu => { 
        const d = new Date(edu.enddate); 
        if (d.getFullYear() > maxYear) maxYear = d.getFullYear(); 
    });
    return new Date() > new Date(maxYear, 4, 15);
  }, [education]);

  const formatDate = (date) => {
    if (!date) return "Present";
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="vp-wrapper">
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          
          {/* LEFT COLUMN: MAIN PROFILE */}
          <Grid item xs={12} lg={8.5}>
            
            {/* Header Card */}
            <Card className="vp-header-card">
              <div className="vp-cover"></div>
              
              <div className="vp-header-body">
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                    <div className="vp-avatar-container">
                        <Avatar 
                            src={user.profilepic ? `${WEB_URL}${user.profilepic}` : ""} 
                            className="vp-avatar"
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="vp-header-actions">
                        <IconButton onClick={() => setShowEditProfile(true)} sx={{ border: '1px solid #ddd' }}>
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={openMenu} sx={{ border: '1px solid #ddd' }}>
                            <MoreVert fontSize="small" />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                            <MenuItem onClick={() => { setModalType("Add"); setShowEditExp(true); closeMenu(); }}>
                                <ListItemIcon><Work fontSize="small" /></ListItemIcon> Add Experience
                            </MenuItem>
                            <MenuItem onClick={() => { setModalType("Add"); setShowEditEdu(true); closeMenu(); }}>
                                <ListItemIcon><School fontSize="small" /></ListItemIcon> Add Education
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => { setShowChangePass(true); closeMenu(); }}>
                                <ListItemIcon><Lock fontSize="small" /></ListItemIcon> Change Password
                            </MenuItem>
                            <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>
                                <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon> Delete Account
                            </MenuItem>
                        </Menu>
                    </div>
                </Box>

                <div className="vp-details">
                    <Typography variant="h4" className="vp-name">
                        {user.fname} {user.lname} 
                        {isAlumni && <Chip label="Alumni" color="primary" size="small" sx={{ ml: 1, verticalAlign: 'middle' }} />}
                    </Typography>
                    <Typography className="vp-role">{user.institute || "Student"}</Typography>
                    
                    <Typography className="vp-location">
                        <Place fontSize="small" /> {user.city ? `${user.city}, ${user.state}` : "Location not set"}
                    </Typography>

                    <div className="vp-stats">
                        <span className="vp-stat-item" onClick={() => { setFollowerTab("Follower"); setShowFollowers(true); }}>
                            {user.followers?.length || 0} Followers
                        </span>
                        <span className="vp-stat-item" onClick={() => { setFollowerTab("Following"); setShowFollowers(true); }}>
                            {user.followings?.length || 0} Connections
                        </span>
                    </div>

                    <div className="vp-social-links">
                        <IconButton size="small" onClick={() => handleSocialClick(user.github)}><GitHub /></IconButton>
                        <IconButton size="small" onClick={() => handleSocialClick(user.portfolioweb)}><Language /></IconButton>
                    </div>
                </div>
              </div>
            </Card>

            {/* About Section */}
            {user.about && (
                <Card className="vp-section-card">
                    <CardContent>
                        <Box className="vp-section-header">
                            <Typography variant="h6" fontWeight={700}>About</Typography>
                            <IconButton size="small" onClick={() => setShowEditProfile(true)}><Edit fontSize="small" /></IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{user.about}</Typography>
                    </CardContent>
                </Card>
            )}

            {/* Experience Section */}
            <Card className="vp-section-card">
                <CardContent>
                    <Box className="vp-section-header">
                        <Typography variant="h6" fontWeight={700}>Experience</Typography>
                        <IconButton className="vp-add-btn" onClick={() => { setModalType("Add"); setShowEditExp(true); }}>
                            <Add />
                        </IconButton>
                    </Box>
                    {experience.length > 0 ? experience.map(exp => (
                        <Box key={exp._id} className="vp-list-item" display="flex">
                            <img src={`${WEB_URL}${exp.companylogo}`} alt="" className="vp-list-logo" />
                            <Box flex={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={600}>{exp.position}</Typography>
                                    <Edit fontSize="small" className="vp-edit-icon" onClick={() => { setModalType("Edit"); setShowEditExp(true); }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">{exp.companyname}</Typography>
                                <Typography variant="caption" color="text.disabled">{formatDate(exp.joindate)} - {formatDate(exp.enddate)}</Typography>
                                <Typography variant="body2" mt={1}>{exp.description}</Typography>
                            </Box>
                        </Box>
                    )) : <Typography variant="body2" color="text.disabled">No experience added.</Typography>}
                </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="vp-section-card">
                <CardContent>
                    <Box className="vp-section-header">
                        <Typography variant="h6" fontWeight={700}>Education</Typography>
                        <IconButton className="vp-add-btn" onClick={() => { setModalType("Add"); setShowEditEdu(true); }}>
                            <Add />
                        </IconButton>
                    </Box>
                    {education.length > 0 ? education.map(edu => (
                        <Box key={edu._id} className="vp-list-item" display="flex">
                            <img src={`${WEB_URL}${edu.collagelogo}`} alt="" className="vp-list-logo" />
                            <Box flex={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={600}>{edu.institutename}</Typography>
                                    <Edit fontSize="small" className="vp-edit-icon" onClick={() => { setModalType("Edit"); setShowEditEdu(true); }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">{edu.course}</Typography>
                                <Typography variant="caption" color="text.disabled">{formatDate(edu.joindate)} - {formatDate(edu.enddate)}</Typography>
                            </Box>
                        </Box>
                    )) : <Typography variant="body2" color="text.disabled">No education added.</Typography>}
                </CardContent>
            </Card>

          </Grid>

          {/* RIGHT COLUMN: SIDEBAR */}
          <Grid item xs={12} lg={3.5}>
            {/* Skills */}
            <Card className="vp-sidebar-card">
                <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Skills</Typography>
                    <Box display="flex" flexWrap="wrap">
                        {skills.length > 0 ? skills.map((s, i) => <Chip key={i} label={s} className="vp-chip" />) : "No skills added"}
                    </Box>
                </CardContent>
            </Card>

            {/* Languages */}
            <Card className="vp-sidebar-card">
                <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Languages</Typography>
                    <Box display="flex" flexWrap="wrap">
                        {language.length > 0 ? language.map((l, i) => <Chip key={i} label={l} variant="outlined" className="vp-chip" />) : "No languages added"}
                    </Box>
                </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="vp-sidebar-card">
                <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>People you may know</Typography>
                    {topUsers.map(u => (
                        <Box key={u._id} className="vp-suggestion-item">
                            <Avatar src={u.profilepic ? `${WEB_URL}${u.profilepic}` : ""} sx={{ width: 40, height: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle2">{u.fname} {u.lname}</Typography>
                                <Typography variant="caption" color="text.secondary">{u.city || "Student"}</Typography>
                            </Box>
                            <Button size="small" className="vp-view-btn" onClick={() => nav("/view-search-profile", { state: { id: u._id } })}>View</Button>
                        </Box>
                    ))}
                </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* Modals */}
      {showEditProfile && <EditProfileModal closeModal={() => setShowEditProfile(false)} user={user} getUser={getUser} />}
      {showEditExp && <EditExperienceModal closeModal={() => setShowEditExp(false)} experience={experience} getExperience={getExperience} modal={modalType} />}
      {showEditEdu && <EditEducationModal closeModal={() => setShowEditEdu(false)} education={education} getEducation={getEducation} modal={modalType} />}
      {showChangePass && <ChangePasswordModal closeModal={() => setShowChangePass(false)} />}
      {showFollowers && <FollowerModal closeModal={() => setShowFollowers(false)} user={user} getUser={getUser} initialType={followerTab} />}
    </div>
  );
}