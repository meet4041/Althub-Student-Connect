import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Main.css"; 

// MUI Imports
import {
  AppBar, Toolbar, Button, Container, Grid, Typography, Box, 
  Card, CardContent, Chip, List, ListItem, Link as MuiLink
} from '@mui/material';

// Icons
import {
  CheckCircle, Phone, Email, LinkedIn, GitHub
} from '@mui/icons-material';

export default function Main() {
    const nav = useNavigate();
    
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="landing-wrapper">
            
            {/* --- NAVBAR --- */}
            <AppBar position="fixed" className="landing-appbar" elevation={0}>
                <Toolbar className="landing-toolbar">
                    <img src="images/Logo1.jpeg" alt="AltHub" className="landing-logo" />
                    <Box>
                        <Button variant="outlined" className="landing-nav-btn btn-nav-login" onClick={() => nav('/login')}>
                            Login
                        </Button>
                        <Button variant="contained" className="landing-nav-btn btn-nav-register" onClick={() => nav('/register')}>
                            Register
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* --- HERO SECTION --- */}
            <Box className="hero-section">
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h2" className="hero-title">
                                Connecting Students & Alumni Together
                            </Typography>
                            <Typography variant="h6" className="hero-subtitle">
                                A comprehensive platform bridging the gap between college management, current students, and alumni. 
                                Unlock career advice, mentorship, and job opportunities in one place.
                            </Typography>
                            <Button 
                                variant="contained" 
                                className="hero-cta-btn btn-nav-register" 
                                onClick={() => nav('/register')}
                            >
                                Get Started
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} display="flex" justifyContent="center">
                            {/* Priority loading for Hero Image */}
                            <img src="images/connect.png" alt="Connection" className="hero-img" loading="eager" />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- FEATURES GRID --- */ }
            <Box className="features-section">
                <Container maxWidth="lg">
                    <Box className="section-title">
                        <Typography variant="h3" component="h2">Explore Althub</Typography>
                        <Typography variant="h6">Everything you need to stay connected</Typography>
                    </Box>
                    
                    <Grid container spacing={4}>
                        {[
                            { img: "images/event.png", title: "Events", desc: "Keep up with reunions, webinars, and casual hangouts happening at your alma mater." },
                            { img: "images/alumini-directory.png", title: "Alumni Directory", desc: "Find lost classmates, discover mentors, and build a professional network that matters." },
                            { img: "images/content-library.png", title: "Secure Messaging", desc: "Directly connect with like-minded people using our secure, on-demand messaging system." }
                        ].map((feature, idx) => (
                            <Grid item xs={12} md={4} key={idx}>
                                <Card className="feature-card" elevation={0}>
                                    {/* Lazy load feature icons */}
                                    <img src={feature.img} alt={feature.title} className="feature-icon" loading="lazy" />
                                    <CardContent>
                                        <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body1" color="textSecondary">
                                            {feature.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* --- JOB TAGS --- */}
            <Box className="tags-section">
                <Container maxWidth="md">
                    <Box className="section-title">
                        <Typography variant="h3" component="h2">Find the Right Connections</Typography>
                        <Typography variant="h6">Connect with professionals across various fields</Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1.5}>
                        {[
                            "Network Administrator", "Designer", "System Analyst", 
                            "Database Administrator", "Full-stack Developer", 
                            "Software Engineer", "Data Scientist", "Cloud Engineer", 
                            "IT Security Specialist", "Analytics Manager"
                        ].map((job, index) => (
                            <Chip key={index} label={job} className="tag-chip" clickable />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* --- INFO SECTIONS --- */}
            <Box className="info-section">
                <Container maxWidth="lg">
                    {/* Why Althub */}
                    <Grid container spacing={6} alignItems="center" className="info-container">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" fontWeight={700} gutterBottom>Why Choose Althub?</Typography>
                            <List>
                                {[
                                    "Provide alumni a reason to give back their time & talent.",
                                    "Build alumni-centric programs designed for engagement.",
                                    "No app downloads required – accessible everywhere.",
                                    "Simple for any age group to participate from anywhere."
                                ].map((text, i) => (
                                    <ListItem key={i} className="info-list-item">
                                        <CheckCircle className="info-icon" />
                                        <Typography variant="body1" color="textSecondary">{text}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6} className="info-img-wrapper">
                            {/* Lazy load secondary images */}
                            <img src="images/Alumni-2.svg" alt="Why Althub" className="info-img" loading="lazy" />
                        </Grid>
                    </Grid>

                    {/* Alumni Center */}
                    <Grid container spacing={6} alignItems="center" direction={{xs: 'column-reverse', md: 'row'}}>
                        <Grid item xs={12} md={6} className="info-img-wrapper">
                            <img src="images/Usability testing-bro.png" alt="Alumni Center" className="info-img" loading="lazy" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" fontWeight={700} gutterBottom>Alumni at the Center</Typography>
                            <Typography variant="body1" color="textSecondary" paragraph fontSize="1.1rem" lineHeight={1.8}>
                                We believe that a strong alumni network is the backbone of any institution. 
                                In today's value-focused reality, we provide the technology and strategy to make connecting easier, 
                                more meaningful, and mutually beneficial.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- FOOTER --- */}
            <footer className="landing-footer">
                <Container maxWidth="lg">
                    <Grid container spacing={5}>
                        {/* About */}
                        <Grid item xs={12} md={4} className="footer-col">
                            <Typography variant="h5" className="footer-heading">About Althub</Typography>
                            <Typography variant="body2" color="grey.400" lineHeight={1.8}>
                                Althub bridges the gap between college management, current students, and alumni. 
                                It enables seamless communication for job vacancies, career advice, and mentorship.
                            </Typography>
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={12} md={4} className="footer-col">
                            <Typography variant="h5" className="footer-heading">Contact Us</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <div className="footer-link"><Phone className="footer-icon" /> +91 6352314322</div>
                                <MuiLink href="mailto:althub.daiict@gmail.com" className="footer-link" underline="none">
                                    <Email className="footer-icon" /> althub.daiict@gmail.com
                                </MuiLink>
                            </Box>
                        </Grid>

                        {/* Socials */}
                        <Grid item xs={12} md={4} className="footer-col">
                            <Typography variant="h5" className="footer-heading">Follow Us</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <MuiLink href="https://www.linkedin.com/in/meetgandhi4041/" target="_blank" className="footer-link" underline="none">
                                    <LinkedIn className="footer-icon" /> LinkedIn
                                </MuiLink>
                                <MuiLink href="https://github.com/meet4041" target="_blank" className="footer-link" underline="none">
                                    <GitHub className="footer-icon" /> GitHub
                                </MuiLink>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box className="footer-bottom">
                        <Typography variant="body2">&copy; {new Date().getFullYear()} Althub. All rights reserved.</Typography>
                    </Box>
                </Container>
            </footer>

        </div>
    )
}