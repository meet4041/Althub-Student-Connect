import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  CircularProgress, 
  Container, 
  Link,
  Grid 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { WEB_URL } from "../baseURL";
import "../styles/Login.css"; // <--- Import the CSS file here

export default function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ email: "", password: "" });

  useEffect(() => {
    if (localStorage.getItem("Althub_Id")) {
      nav('/home');
    }
  }, [nav]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!user.email) {
      toast.error("Please Enter Email");
      return false;
    }
    if (!user.password) {
      toast.error("Please Enter Password");
      return false;
    }
    return true;
  };

  const handleLogin = () => {
    if (validate()) {
      setLoading(true);
      axios({
        method: "post",
        data: {
          email: user.email,
          password: user.password,
        },
        url: `${WEB_URL}/api/userLogin`,
        withCredentials: true 
      }).then((response) => {
        toast.success("Login Successful");
        localStorage.setItem("Althub_Id", response.data.data._id);
        if (response.data.token) {
            localStorage.setItem("Althub_Token", response.data.token);
        }
        setTimeout(() => nav("/home"), 1000);
      }).catch((err) => {
        setLoading(false);
        const msg = err.response ? err.response.data.msg : "Login Failed";
        toast.error(msg);
      })
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      
      {/* --- LEFT SIDE (Visual) --- */}
      <Grid item xs={12} md={7} sx={{ position: 'relative' }}>
        <Box className="login-visual-side">
          <Box 
            component="img" 
            src="images/register-animate.svg" 
            alt="Welcome" 
            sx={{ width: '80%', maxWidth: '600px', position: 'relative', zIndex: 1 }} 
          />
        </Box>
        
        <Button 
          className="login-back-btn"
          startIcon={<ArrowBackIcon />} 
          onClick={() => nav("/")}
        >
          Back to Main
        </Button>
      </Grid>

      {/* --- RIGHT SIDE (Form) --- */}
      <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="xs">
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box component="img" src="images/Logo1.jpeg" alt="Logo" sx={{ width: '180px', borderRadius: '12px', mb: 3 }} />
            <Typography variant="h4" fontWeight="700" sx={{ color: '#2d3436', mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: '#b2bec3' }}>
              Please enter your details to sign in
            </Typography>
          </Box>

          <Box component="form" noValidate>
            <TextField
              fullWidth
              className="login-textfield"
              placeholder="Email Address"
              name="email"
              value={user.email}
              onChange={handleChange}
              variant="outlined"
            />

            <TextField
              fullWidth
              className="login-textfield"
              placeholder="Password"
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              variant="outlined"
            />

            <Button
              fullWidth
              className="login-submit-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Link 
                component="button"
                className="login-link"
                onClick={() => nav("/forget-password")}
                sx={{ fontWeight: 500 }}
              >
                Forgot Password?
              </Link>
              
              <Typography variant="body2" sx={{ color: '#636e72' }}>
                Don't have an account?{' '}
                <Link 
                  component="button" 
                  className="login-link"
                  onClick={() => nav("/register")}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>

        </Container>
      </Grid>
    </Grid>
  );
}