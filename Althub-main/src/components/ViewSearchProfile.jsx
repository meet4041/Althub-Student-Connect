import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import FollowerModal from "./FollowerModal";
import ProtectedImage from "../ProtectedImage";

import { 
  Box, Container, Grid, Paper, Avatar, Typography, Button, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, Stack 
} from '@mui/material';
import { 
  Add, Check, Message, Star,Place, 
} from '@mui/icons-material';

export default function ViewSearchProfile({ socket }) {
  const location = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [language, setLanguage] = useState([]);
  const myID = localStorage.getItem("Althub_Id");
  const [userID, setUserID] = useState("");
  const [self, setSelf] = useState({});
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  const [followerTab, setFollowerTab] = useState("Follower");
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => { if (location.state && location.state.id) setUserID(location.state.id); }, [location.state]);

  const getUser = useCallback((signal) => {
    if (userID) {
      axios.get(`${WEB_URL}/api/searchUserById/${userID}`, { signal }).then((res) => {
        if (res.data.data) {
          setUser(res.data.data[0]);
          res.data.data[0].skills && setSkills(JSON.parse(res.data.data[0].skills));
          res.data.data[0].languages && setLanguage(JSON.parse(res.data.data[0].languages));
        }
      });
    }
  }, [userID]);

  const getSelf = useCallback((signal) => {
    if (userID) axios.get(`${WEB_URL}/api/searchUserById/${myID}`, { signal }).then((res) => { if (res.data.data) setSelf(res.data.data[0]); });
  }, [userID, myID]);

  const getEducation = useCallback((signal) => {
    if (userID) axios.post(`${WEB_URL}/api/getEducation`, { userid: userID }, { signal }).then((res) => setEducation(res.data.data || []));
  }, [userID]);

  const getExperience = useCallback((signal) => {
    if (userID) axios.post(`${WEB_URL}/api/getExperience`, { userid: userID }, { signal }).then((res) => setExperience(res.data.data || []));
  }, [userID]);

  const handleFollow = () => {
    const msg = `${self.fname} ${self.lname} Started Following You`;
    socket.emit("sendNotification", { receiverid: userID, title: "New Follower", msg });
    axios.post(`${WEB_URL}/api/addNotification`, { userid: userID, msg, image: self.profilepic || "", title: "New Follower", date: new Date().toISOString() });

    axios.put(`${WEB_URL}/api/follow/${userID}`, { userId: myID }).then((res) => {
        toast.success(res.data);
        getUser();
        if (!user.followings.includes(myID.toString())) axios.post(`${WEB_URL}/api/newConversation`, { senderId: myID, receiverId: userID });
    });
  };

  const confirmUnfollow = () => {
    axios.put(`${WEB_URL}/api/unfollow/${userID}`, { userId: myID }).then(() => {
        toast.info("Unfollowed successfully.");
        setShowUnfollowModal(false);
        getUser();
    });
  };

  const handleGiveFeedback = () => {
    if (user.followers && user.followers.includes(myID.toString())) nav("/feedback", { state: { selectedUserId: user._id } });
    else toast.error("You must follow this user to give feedback!");
  };

  const isAlumni = useMemo(() => {
    if (!education.length) return false;
    let maxYear = 0;
    education.forEach(edu => { const d = new Date(edu.enddate); if (d.getFullYear() > maxYear) maxYear = d.getFullYear(); });
    return new Date() > new Date(maxYear, 4, 15);
  }, [education]);

  useEffect(() => {
    const controller = new AbortController();
    if (userID) { getSelf(controller.signal); getUser(controller.signal); getEducation(controller.signal); getExperience(controller.signal); }
    return () => controller.abort();
  }, [userID, getSelf, getUser, getEducation, getExperience]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Main Profile Card */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ height: 200, background: 'linear-gradient(135deg, #66bd9e 0%, #26a69a 100%)' }} />
              <Box sx={{ px: 4, pb: 4, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <Box sx={{ mt: -8 }}>
                    <Avatar sx={{ width: 150, height: 150, border: '5px solid #fff', boxShadow: 3 }}>
                        <ProtectedImage imgSrc={user.profilepic} defaultImage="/images/profile1.png" style={{ width: '100%', height: '100%' }} />
                    </Avatar>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {user.followers && user.followers.includes(myID.toString()) ? (
                        <Button variant="contained" color="secondary" onClick={() => setShowUnfollowModal(true)} startIcon={<Check />}>Following</Button>
                    ) : (
                        <Button variant="contained" onClick={handleFollow} startIcon={<Add />}>Follow</Button>
                    )}
                    <Button variant="outlined" onClick={() => nav("/message", { state: user })} startIcon={<Message />}>Message</Button>
                    <Button variant="outlined" color="warning" onClick={handleGiveFeedback} startIcon={<Star />}>Feedback</Button>
                  </Stack>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {user.fname} {user.lname} {isAlumni && <Chip label="Alumni" color="primary" size="small" sx={{ verticalAlign: 'middle', ml: 1 }} />}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">{user.institute || "Student"}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Place fontSize="small" /> {user.city || "Location not set"}
                    </Typography>
                    
                    <Stack direction="row" spacing={3} sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}>
                        <span onClick={() => { setFollowerTab("Follower"); setShowFollowerModal(true); }}>{user.followers?.length || 0} Followers</span>
                        <span onClick={() => { setFollowerTab("Following"); setShowFollowerModal(true); }}>{user.followings?.length || 0} Connections</span>
                    </Stack>
                </Box>
              </Box>
            </Paper>

            {/* About & Details */}
            {user.about && (
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>About</Typography>
                    <Typography variant="body1">{user.about}</Typography>
                </Paper>
            )}

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Experience</Typography>
                {experience.length > 0 ? experience.map(exp => (
                    <Box key={exp._id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar variant="rounded" src={`${WEB_URL}${exp.companylogo}`} sx={{ width: 56, height: 56 }} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{exp.position}</Typography>
                            <Typography variant="body2">{exp.companyname}</Typography>
                            <Typography variant="caption" color="text.secondary">Full-time</Typography>
                        </Box>
                    </Box>
                )) : <Typography color="text.secondary">No experience listed.</Typography>}
            </Paper>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Education</Typography>
                {education.length > 0 ? education.map(edu => (
                    <Box key={edu._id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar variant="rounded" src={`${WEB_URL}${edu.collagelogo}`} sx={{ width: 56, height: 56 }} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{edu.institutename}</Typography>
                            <Typography variant="body2">{edu.course}</Typography>
                        </Box>
                    </Box>
                )) : <Typography color="text.secondary">No education listed.</Typography>}
            </Paper>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skills.length > 0 ? skills.map((s, i) => <Chip key={i} label={s} />) : "No skills"}
                </Box>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Languages</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {language.length > 0 ? language.map((l, i) => <Chip key={i} label={l} variant="outlined" />) : "No languages"}
                </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Unfollow Confirmation Dialog */}
      <Dialog open={showUnfollowModal} onClose={() => setShowUnfollowModal(false)}>
        <DialogTitle>Unfollow User?</DialogTitle>
        <DialogContent><Typography>Are you sure you want to stop following <b>{user.fname}</b>?</Typography></DialogContent>
        <DialogActions>
            <Button onClick={() => setShowUnfollowModal(false)} color="inherit">Cancel</Button>
            <Button onClick={confirmUnfollow} color="error" variant="contained">Yes, Unfollow</Button>
        </DialogActions>
      </Dialog>

      {showFollowerModal && <FollowerModal closeModal={() => setShowFollowerModal(false)} user={user} getUser={getUser} initialType={followerTab} />}
    </Box>
  );
}