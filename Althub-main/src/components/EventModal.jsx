import React, { useEffect } from "react";
import Slider from "react-slick";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/EventModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, Grid
} from "@mui/material";

import {
  Close, CalendarMonth, AccessTime, LocationOn, Group, Image as ImageIcon
} from "@mui/icons-material";

const EventModal = ({ closeModal, event, getEvents }) => {
  const userid = localStorage.getItem("Althub_Id");

  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, 
    adaptiveHeight: false
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", timeZone: "Asia/Kolkata" });
  };

  const handleJoin = () => {
    axios.put(`${WEB_URL}/api/participateInEvent/${event._id}`, { userId: userid })
      .then((res) => {
        toast.success(res.data);
        closeModal();
        getEvents();
      })
      .catch((err) => {
        toast.error(err.response?.data || "Error joining event");
        closeModal();
      });
  };

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="sm" fullWidth scroll="body">
      
      {/* Header */}
      <DialogTitle className="evt-modal-title">
        <Typography variant="h6" fontWeight={700}>{event.title}</Typography>
        <IconButton onClick={closeModal} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent className="evt-modal-content">
        
        {/* Image Slider */}
        <Box className="evt-img-container" sx={{ height: event.photos?.length ? 300 : 'auto' }}>
            {event.photos && event.photos.length > 0 ? (
              <Slider {...settings}>
                {event.photos.map((el, index) => (
                  <div key={index} style={{ outline: 'none' }}>
                    <img src={`${WEB_URL}${el}`} alt="Event" className="evt-slider-img" />
                  </div>
                ))}
              </Slider>
            ) : (
              <Box className="evt-no-img">
                <ImageIcon sx={{ mr: 1 }} /> No Images
              </Box>
            )}
        </Box>

        {/* Content Box */}
        <Box className="evt-info-box">
            
            {/* Description */}
            <Box className="evt-desc-section">
                <Typography className="evt-label">About Event</Typography>
                <Typography className="evt-desc-text">
                    {event.description || "No description provided."}
                </Typography>
            </Box>

            {/* Info Grid */}
            <Grid container spacing={3} className="evt-info-grid">
                <Grid item xs={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><CalendarMonth fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Date</Typography>
                            <Typography className="evt-info-sub">{formatDate(event.date)}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><AccessTime fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Time</Typography>
                            <Typography className="evt-info-sub">{formatTime(event.date)}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><LocationOn fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Venue</Typography>
                            <Typography className="evt-info-sub">{event.venue}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><Group fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Participants</Typography>
                            <Typography className="evt-info-sub">{event.participants?.length || 0} Joined</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

        </Box>

      </DialogContent>

      {/* Footer Action */}
      {new Date() < new Date(event.date) && (
        <DialogActions className="evt-modal-actions">
            <Button 
                variant="contained" 
                onClick={handleJoin}
                sx={{ bgcolor: '#66bd9e', '&:hover': { bgcolor: '#479378' }, borderRadius: 6, px: 4 }}
            >
                Confirm & Join
            </Button>
        </DialogActions>
      )}

    </Dialog>
  );
};

export default EventModal;