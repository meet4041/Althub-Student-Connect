import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // Ensure this import exists
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  CircularProgress, 
  Container, 
  Link 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { WEB_URL } from "../baseURL";

// 1. The Left Side Visual Wrapper
const VisualSide = styled(Box)(({ theme }) => ({
  flex: 1,
  background: 'linear-gradient(135deg, #e3fdf5 0%, #ffe6fa 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  // Responsive: Matches your @media (max-width: 900px)
  [theme.breakpoints.down('md')]: {
    minHeight: '300px',
    flex: 'none',
    order: -1, 
  },
  // The Circle Decoration (::before replacement)
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: '#fff',
    opacity: 0.3,
    borderRadius: '50%',
    top: '-150px',
    right: '-150px',
  }
}));

// 2. Custom Styled TextField to match your "Modern Login" look
const CustomTextField = styled(TextField)({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    transition: 'all 0.3s',
    '& fieldset': { 
      border: '2px solid #f1f2f6', // Your specific border
    },
    '&:hover fieldset': { 
      borderColor: '#66bd9e', 
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 4px 15px rgba(102, 189, 158, 0.1)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#66bd9e',
      borderWidth: '2px', // Prevent MUI from making it thicker
    },
  },
  '& .MuiInputBase-input': {
    padding: '15px 20px',
    fontSize: '1rem',
    color: '#333',
  },
});

export default function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

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
      axios({
        method: "post",
        data: {
          email: user.email,
          password: user.password,
        },
        url: `${WEB_URL}/api/userLogin`,
        withCredentials: true // <--- FIX: Add this line
      }).then((response) => {
        toast.success("Login Successful");
        localStorage.setItem("Althub_Id", response.data.data._id);
        setTimeout(() => {
          nav("/home");
        }, 1000) // Added small delay to let toast show
      }).catch((err) => {
        // Safe access to error message
        const msg = err.response ? err.response.data.msg : "Login Failed";
        toast.error(msg);
      })
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("Althub_Id")) {
      nav('/home');
    }
  }, [nav]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, // Responsive Layout logic
      fontFamily: "'Poppins', sans-serif",
      bgcolor: '#fff' 
    }}>
      
      {/* --- LEFT SIDE: VISUALS --- */}
      <VisualSide>
        <Box 
          component="img" 
          src="images/register-animate.svg" 
          alt="Welcome" 
          sx={{ 
            width: { xs: '60%', md: '80%' }, 
            maxWidth: '600px', 
            position: 'relative', 
            zIndex: 1, 
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
            mt: { xs: 2, md: 0 }
          }} 
        />
      </VisualSide>

      {/* --- RIGHT SIDE: FORM --- */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: { xs: 3, md: 5 }, 
        position: 'relative',
        bgcolor: '#fff' 
      }}>
        
        {/* Back Button (Absolute Position) */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => nav("/")}
          sx={{ 
            position: 'absolute', 
            top: 30, 
            left: 30, 
            color: '#666', 
            bgcolor: '#f8f9fa',
            borderRadius: '30px',
            px: 3,
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            '&:hover': { 
              bgcolor: '#e9ecef', 
              color: '#333',
              transform: 'translateX(-3px)' 
            },
            transition: 'all 0.2s'
          }}
        >
          Back to Main
        </Button>

        <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
          
          {/* Logo */}
          <Box 
            component="img" 
            src="images/Logo1.jpeg" 
            alt="Logo" 
            sx={{ width: '200px', borderRadius: '12px', mb: 3 }} 
          />
          
          {/* Title */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3436', mb: 1, fontSize: '2rem' }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: '#b2bec3' }}>
              Please enter your details to sign in
            </Typography>
          </Box>

          {/* Form Inputs */}
          <CustomTextField
            fullWidth
            placeholder="Email Address"
            name="email"
            value={user.email}
            onChange={handleChange}
            variant="outlined"
          />

          <CustomTextField
            fullWidth
            placeholder="Password"
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            variant="outlined"
          />

          {/* Login Button */}
          <Button
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.8,
              bgcolor: '#66bd9e',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 189, 158, 0.3)',
              transition: 'all 0.3s',
              display: 'flex',
              gap: 1,
              '&:hover': {
                bgcolor: '#479378',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 189, 158, 0.4)',
              },
              '&:disabled': {
                bgcolor: '#a5d6c5',
                color: '#fff',
                cursor: 'not-allowed'
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: '#fff' }} />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </Button>

          {/* Footer Options */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5, color: '#636e72', fontSize: '0.9rem' }}>
            <Typography 
              onClick={() => nav("/forget-password")}
              sx={{ 
                color: '#66bd9e', 
                cursor: 'pointer', 
                fontWeight: 500, 
                transition: 'color 0.2s',
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              Forgot Password?
            </Typography>
            
            <Typography>
              Don't have an account?{' '}
              <Link 
                component="span" 
                onClick={() => nav("/register")}
                sx={{ 
                  color: '#66bd9e', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

        </Container>
      </Box>
    </Box>
  );
}