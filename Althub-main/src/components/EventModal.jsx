import React from "react";
import Slider from "react-slick";
import { WEB_URL } from "../baseURL";
import axios from "axios";
import { toast } from "react-toastify";
import ProtectedImage from "../ProtectedImage";
import "../styles/EventModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, Grid, Chip
} from "@mui/material";

import {
  Close, CalendarMonth, AccessTime, LocationOn, Group, Image as ImageIcon
} from "@mui/icons-material";

const EventModal = ({ closeModal, event, getEvents }) => {
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
    axios.put(`${WEB_URL}/api/participateInEvent/${event._id}`, {})
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

  const isUpcoming = new Date() < new Date(event.date);

  return (
    <Dialog open={true} onClose={closeModal} maxWidth="md" fullWidth scroll="body" PaperProps={{ className: "evt-modal-paper" }}>
      <DialogTitle className="evt-modal-title">
        <Box className="evt-modal-title-wrap">
          <Typography className="evt-modal-kicker">Event Details</Typography>
          <Typography variant="h5" fontWeight={700} className="evt-modal-heading">{event.title}</Typography>
        </Box>
        <IconButton onClick={closeModal} size="small" className="evt-modal-close"><Close /></IconButton>
      </DialogTitle>

      <DialogContent className="evt-modal-content">
        <Box className="evt-modal-shell">
          <Box className="evt-modal-hero">
            <Box className="evt-img-container" sx={{ height: event.photos?.length ? 360 : "100%" }}>
              {event.photos && event.photos.length > 0 ? (
                <>
                  <Slider {...settings}>
                    {event.photos.map((el, index) => (
                      <div key={index} style={{ outline: "none" }}>
                        <ProtectedImage imgSrc={el} alt="Event" className="evt-slider-img" defaultImage="images/event1.png" />
                      </div>
                    ))}
                  </Slider>
                  <Box className="evt-hero-overlay" />
                  <Box className="evt-hero-meta">
                    <Chip label={isUpcoming ? "Upcoming" : "Past Event"} className="evt-status-chip" />
                    <Typography className="evt-hero-date">{formatDate(event.date)}</Typography>
                    <Typography className="evt-hero-venue">{event.venue || "Venue to be announced"}</Typography>
                  </Box>
                </>
              ) : (
                <Box className="evt-no-img">
                  <ImageIcon sx={{ mr: 1 }} /> No Images
                </Box>
              )}
            </Box>
          </Box>

          <Box className="evt-info-box">
            <Box className="evt-desc-section">
                <Typography className="evt-label">About Event</Typography>
                <Typography className="evt-desc-text">
                  {event.description || "No description provided."}
                </Typography>
            </Box>

            <Grid container spacing={3} className="evt-info-grid">
                <Grid item xs={12} sm={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><CalendarMonth fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Date</Typography>
                            <Typography className="evt-info-sub">{formatDate(event.date)}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><AccessTime fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Time</Typography>
                            <Typography className="evt-info-sub">{formatTime(event.date)}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box className="evt-info-item">
                        <Box className="evt-icon-box"><LocationOn fontSize="small" /></Box>
                        <Box>
                            <Typography className="evt-info-header">Venue</Typography>
                            <Typography className="evt-info-sub">{event.venue || "Venue to be announced"}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
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
        </Box>
      </DialogContent>

      {isUpcoming && (
        <DialogActions className="evt-modal-actions">
            <Button 
                variant="contained" 
                onClick={handleJoin}
                className="evt-join-btn"
            >
                Confirm & Join
            </Button>
        </DialogActions>
      )}

    </Dialog>
  );
};

export default EventModal;
