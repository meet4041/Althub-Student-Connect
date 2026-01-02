import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WEB_URL } from '../baseURL';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Feedback.css"; // <--- New CSS Import

import { 
  Box, Card, Typography, Button, TextField, Rating, Autocomplete, CircularProgress 
} from '@mui/material';

export default function Feedback() {
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [rate, setRate] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const nav = useNavigate();
    const location = useLocation();

    useEffect(() => {
        axios.get(`${WEB_URL}/api/getUsers`, {
            withCredentials: true 
        }).then((res) => {
            if(res.data.success) {
                const formattedOptions = res.data.data.map(user => ({
                    label: `${user.fname} ${user.lname} ${user.degree ? `(${user.degree})` : ""}`,
                    id: user._id
                }));
                setUserList(formattedOptions);

                if (location.state && location.state.selectedUserId) {
                    const targetId = location.state.selectedUserId;
                    const preSelected = formattedOptions.find(opt => opt.id === targetId);
                    if (preSelected) setSelectedUser(preSelected);
                }
            }
        }).catch(err => console.error(err));
    }, [location.state]);

    const handleFeedBack = () => {
        const userID = localStorage.getItem("Althub_Id");
        
        if (!selectedUser) {
            toast.error("Please select a user to review!");
            return;
        }
        if (!feedback && rate === 0) {
            toast.error("Please provide a rating or message!");
            return;
        }

        const htmlPattern = /<(.|\n)*?>/g;
        if (htmlPattern.test(feedback)) {
            toast.error("HTML tags/scripts are not allowed in feedback!");
            return;
        }

        setIsSubmitting(true);

        axios({
            url: `${WEB_URL}/api/addFeedback`,
            method: 'post',
            withCredentials: true,
            data: {
                userid: userID,
                selected_user_id: selectedUser.id,
                message: feedback,
                rate: rate
            }
        }).then((Response) => {
            setIsSubmitting(false);
            toast.success("Feedback submitted successfully!");
            setFeedback("");
            setSelectedUser(null);
            setRate(0);
            setTimeout(() => nav("/home"), 1000); 
        }).catch((error) => {
            setIsSubmitting(false);
            toast.error("Submission Failed.");
        })
    }

    return (
        <Box className="feedback-page-wrapper">
            <Card className="feedback-card">
                <Box sx={{ mb: 3 }}>
                    <img src="/images/Logo1.jpeg" alt="Logo" className="feedback-logo" />
                    <Typography variant="h4" color="secondary" className="feedback-title">
                        Your opinion matters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Share your experience about a specific user.
                    </Typography>
                </Box>

                <Autocomplete
                    options={userList}
                    value={selectedUser}
                    onChange={(event, newValue) => setSelectedUser(newValue)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Select User (Compulsory)" variant="outlined" fullWidth />
                    )}
                    sx={{ mb: 3 }}
                />

                <Box className="rating-container">
                    <Rating 
                        name="simple-controlled"
                        value={rate}
                        onChange={(event, newValue) => setRate(newValue)}
                        size="large"
                        className="large-rating"
                    />
                </Box>

                <TextField
                    label="Feedback Message"
                    multiline
                    rows={4}
                    placeholder="Type your message here..."
                    variant="outlined"
                    fullWidth
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    sx={{ mb: 4 }}
                />

                <Box className="feedback-action-group">
                    <Button variant="outlined" color="inherit" fullWidth onClick={() => nav("/home")}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        onClick={handleFeedBack}
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                    >
                        {isSubmitting ? "Sending..." : "Submit Feedback"}
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}