import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { useNavigate } from "react-router-dom";
import ProtectedImage from "../ProtectedImage";
import { toast } from "react-toastify";
import FilterModal from "./FilterModal"; // We will refactor this next or keep as is, wrapper handles styling

// MUI Imports
import { 
  Box, Container, Grid, Card, CardContent, Typography, Button, TextField, 
  IconButton, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  InputAdornment, useTheme
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Tune as TuneIcon, 
  ArrowBack, 
  School, 
  GitHub, 
  Language, 
  CheckCircle 
} from '@mui/icons-material';

export default function SearchProfile({ socket }) {
  const [name, setName] = useState("");
  const [showUsers, setShowUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const nav = useNavigate();
  const theme = useTheme();
  
  // Filter Modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Unfollow Confirmation
  const [unfollowId, setUnfollowId] = useState(null); 

  // Filter States
  const [add, setAdd] = useState("");
  const [skill, setSkill] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");

  const userID = localStorage.getItem("Althub_Id");
  const [self, setSelf] = useState({});

  useEffect(() => {
    if(userID) {
      axios.get(`${WEB_URL}/api/searchUserById/${userID}`)
        .then((res) => { if (res?.data?.data) setSelf(res.data.data[0]); })
        .catch(console.error);
    }
  }, [userID]);

  const performSearch = useCallback((overrideParams = {}) => {
    setIsSearching(true);
    const payload = {
        search: overrideParams.name !== undefined ? overrideParams.name : name,
        location: overrideParams.add !== undefined ? overrideParams.add : add,
        skill: overrideParams.skill !== undefined ? overrideParams.skill : skill,
        degree: overrideParams.degree !== undefined ? overrideParams.degree : degree,
        year: overrideParams.year !== undefined ? overrideParams.year : year
    };

    axios.post(`${WEB_URL}/api/searchUser`, payload)
      .then((res) => {
        setShowUsers(res.data.data || []);
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
        setShowUsers([]);
      });
  }, [name, add, skill, degree, year]);

  useEffect(() => {
    const delay = setTimeout(() => performSearch({ name }), 300);
    return () => clearTimeout(delay);
  }, [name, performSearch]); 

  const handleFollow = (targetId) => {
    const msg = `${self.fname} ${self.lname} Started Following You`;
    if (socket) socket.emit("sendNotification", { receiverid: targetId, title: "New Follower", msg: msg });
    
    axios.post(`${WEB_URL}/api/addNotification`, { 
        userid: targetId, msg: msg, image: self.profilepic || "", title: "New Follower", date: new Date().toISOString() 
    });

    axios.put(`${WEB_URL}/api/follow/${targetId}`, { userId: userID })
        .then(() => {
            toast.success("Following!");
            performSearch(); 
            // Check/Create Conversation
            axios.post(`${WEB_URL}/api/searchConversations`, { person1: targetId, person2: userID })
            .then((res) => {
                if (res.data.data.length <= 0) {
                    axios.post(`${WEB_URL}/api/newConversation`, { senderId: userID, receiverId: targetId });
                }
            });
        })
        .catch(() => toast.error("Action failed."));
  };

  const confirmUnfollow = () => {
    if (!unfollowId) return;
    axios.put(`${WEB_URL}/api/unfollow/${unfollowId}`, { userId: userID })
        .then(() => {
            toast.info("Unfollowed.");
            setUnfollowId(null);
            performSearch();
        })
        .catch(() => { toast.error("Failed."); setUnfollowId(null); });
  };

  const getSocialLink = (input, platform) => {
    if (!input) return "#";
    let clean = input.trim();
    if (clean.startsWith("http")) return clean;
    return platform === 'github' ? `https://github.com/${clean}` : `https://${clean}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4, alignItems: 'center' }}>
        <Button startIcon={<ArrowBack />} onClick={() => nav("/home")} sx={{ color: 'text.secondary' }}>
            Back
        </Button>
        
        <TextField
            fullWidth
            placeholder="Search people by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
            }}
            sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 1 }}
        />
        
        <IconButton 
            onClick={() => setShowFilterModal(true)} 
            sx={{ 
                bgcolor: 'background.paper', 
                boxShadow: 2, 
                width: 50, height: 50,
                color: (add || skill || degree || year) ? 'primary.main' : 'text.secondary'
            }}
        >
            <TuneIcon />
        </IconButton>
      </Box>

      {/* Grid */}
      {isSearching ? <Typography textAlign="center">Searching...</Typography> : (
        <Grid container spacing={3}>
            {showUsers.length > 0 ? showUsers.map((elem) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={elem._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {/* Banner */}
                        <Box sx={{ height: 80, background: `linear-gradient(135deg, ${theme.palette.primary.main}, #479378)` }} />
                        
                        {/* Avatar */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6 }}>
                            <Avatar 
                                sx={{ width: 90, height: 90, border: '4px solid #fff', boxShadow: 3 }}
                            >
                                <ProtectedImage imgSrc={elem.profilepic} defaultImage="/images/profile1.png" style={{ width: '100%', height: '100%' }} />
                            </Avatar>
                        </Box>

                        <CardContent sx={{ textAlign: 'center', flexGrow: 1, pt: 1 }}>
                            <Typography 
                                variant="h6" 
                                onClick={() => nav(elem._id === userID ? "/view-profile" : "/view-search-profile", { state: { id: elem._id } })}
                                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            >
                                {elem.fname} {elem.lname}
                            </Typography>
                            
                            {elem.isAlumni && (
                                <Chip label="Alumni" size="small" icon={<School fontSize="small" />} color="primary" variant="outlined" sx={{ mt: 0.5, height: 24 }} />
                            )}

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {elem.city || "Student"}
                            </Typography>

                            {elem.latestCourse && (
                                <Typography variant="caption" color="primary" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                                    {elem.latestCourse}
                                </Typography>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                {elem.github && <IconButton size="small" href={getSocialLink(elem.github, 'github')} target="_blank"><GitHub fontSize="small" /></IconButton>}
                                {elem.portfolioweb && <IconButton size="small" href={getSocialLink(elem.portfolioweb, 'website')} target="_blank"><Language fontSize="small" /></IconButton>}
                            </Box>
                        </CardContent>

                        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                color="inherit"
                                onClick={() => nav(elem._id === userID ? "/view-profile" : "/view-search-profile", { state: { id: elem._id } })}
                            >
                                View
                            </Button>
                            
                            {elem._id !== userID && (
                                elem.followers && elem.followers.includes(userID) ? (
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        sx={{ bgcolor: 'action.disabledBackground', color: 'text.secondary', '&:hover': { bgcolor: 'action.disabledBackground' } }}
                                        onClick={() => setUnfollowId(elem._id)}
                                        endIcon={<CheckCircle fontSize="small" />}
                                    >
                                        Following
                                    </Button>
                                ) : (
                                    <Button fullWidth variant="contained" onClick={() => handleFollow(elem._id)}>
                                        Follow
                                    </Button>
                                )
                            )}
                        </Box>
                    </Card>
                </Grid>
            )) : (
                <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
                    <img src="images/search-bro.png" alt="No results" style={{ maxWidth: 250, opacity: 0.7 }} />
                    <Typography variant="h6" color="text.secondary">No users found</Typography>
                </Box>
            )}
        </Grid>
      )}

      {/* Unfollow Confirmation Dialog */}
      <Dialog open={!!unfollowId} onClose={() => setUnfollowId(null)}>
        <DialogTitle>Unfollow User?</DialogTitle>
        <DialogContent>
            <Typography>Are you sure you want to stop following this user?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setUnfollowId(null)} color="inherit">Cancel</Button>
            <Button onClick={confirmUnfollow} color="error" variant="contained">Yes, Unfollow</Button>
        </DialogActions>
      </Dialog>

      {/* Render Filter Modal (passing props as before, assuming it wraps a Dialog or is a Dialog itself) */}
      {showFilterModal && (
        <FilterModal 
            closeModal={() => setShowFilterModal(false)}
            add={add} setAdd={setAdd}
            skill={skill} setSkill={setSkill}
            degree={degree} setDegree={setDegree}
            year={year} setYear={setYear}
            handleFilter={() => { setShowFilterModal(false); performSearch(); }}
        />
      )}
    </Container>
  );
}