import React, { useState, useEffect } from "react";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import EventModal from "./EventModal";
import ProtectedImage from "../ProtectedImage";
import "../styles/Events.css"; // <--- Import CSS

// MUI Imports
import {
  Container, Grid, Card, CardContent, CardActions, Typography, 
  Button, Box, Tabs, Tab, IconButton
} from "@mui/material";

import {
  ArrowBack, CalendarMonth, AccessTime, LocationOn, EventBusy
} from "@mui/icons-material";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const closeModal = () => setModal(false);
  const [event, setEvent] = useState({});
  const [showEvent, setShowEvent] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Upcoming, 2: Past
  const nav = useNavigate();

  const getEvents = () => {
    axios.get(`${WEB_URL}/api/getEvents`)
      .then((res) => {
        setEvents(res.data.data);
        setShowEvent(res.data.data);
      })
      .catch(() => toast.error("Something Went Wrong"));
  };

  useEffect(() => { getEvents(); }, []);

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", timeZone: "Asia/Kolkata" }).replace(/(\+|-)\d+:\d+/, "");
  };

  // Filter Logic
  useEffect(() => {
    const currentDate = new Date();
    let filtered = [];
    
    if (tabValue === 0) filtered = events;
    else if (tabValue === 1) filtered = events.filter(e => new Date(e.date) > currentDate);
    else filtered = events.filter(e => new Date(e.date) < currentDate);

    setShowEvent(filtered);
  }, [tabValue, events]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="evt-wrapper">
      <Container maxWidth="xl" className="evt-container">
        
        {/* Header */}
        <Box className="evt-header-card">
          <Box>
            <Typography variant="h4" className="evt-header-title">Events</Typography>
            <Typography variant="body1" className="evt-header-subtitle">Discover, Connect, and Experience</Typography>
          </Box>
          <Box className="evt-header-actions" display="flex" alignItems="center">
            <img src="/images/Events-amico.png" alt="Events" className="evt-header-img" />
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => nav("/home")} 
                className="evt-back-btn" 
                variant="outlined"
            >
                Back to Home
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered 
            className="evt-tabs"
        >
            <Tab label="All Events" className="evt-tab" />
            <Tab label="Upcoming" className="evt-tab" />
            <Tab label="Past" className="evt-tab" />
        </Tabs>

        {/* Grid */}
        {showEvent.length > 0 ? (
          <Grid container spacing={3}>
            {showEvent.map((elem) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={elem._id}>
                <Card className="evt-card">
                  
                  {/* Image Wrapper */}
                  <Box className="evt-card-media">
                    <ProtectedImage 
                      imgSrc={elem.photos && elem.photos[0]} 
                      defaultImage="images/event1.png" 
                      alt={elem.title}
                      style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s'}}
                      // Note: Inline style here is minimal because ProtectedImage doesn't accept className easily for img tag inside sometimes
                      // If ProtectedImage passes props to img, use className="evt-card-img" instead.
                    />
                  </Box>

                  <CardContent className="evt-card-content">
                    <Typography variant="h6" className="evt-card-title" noWrap title={elem.title}>
                        {elem.title}
                    </Typography>
                    
                    <Box className="evt-info-item">
                        <CalendarMonth className="evt-info-icon" />
                        <Typography className="evt-info-text">{formatDate(elem.date)}</Typography>
                    </Box>
                    <Box className="evt-info-item">
                        <AccessTime className="evt-info-icon" />
                        <Typography className="evt-info-text">{formatTime(elem.date)}</Typography>
                    </Box>
                    <Box className="evt-info-item">
                        <LocationOn className="evt-info-icon" />
                        <Typography className="evt-info-text" title={elem.venue}>{elem.venue}</Typography>
                    </Box>
                  </CardContent>

                  <CardActions className="evt-card-actions">
                    <Button 
                        fullWidth 
                        className="evt-view-btn"
                        onClick={() => { setModal(true); setEvent(elem); }}
                    >
                        View Details
                    </Button>
                  </CardActions>

                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box className="evt-no-events">
            <EventBusy className="evt-empty-icon" />
            <Typography variant="h5" color="textSecondary" fontWeight={600}>No Events Found</Typography>
            <Typography variant="body2" color="textSecondary">Check back later for updates.</Typography>
          </Box>
        )}

      </Container>

      {/* Modal */}
      {modal && <EventModal closeModal={closeModal} event={event} getEvents={getEvents} />}
    </div>
  );
}