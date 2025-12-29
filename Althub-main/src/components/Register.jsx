import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import { 
  Box, 
  Button,  
  Typography, 
  TextField, 
  Stepper, 
  Step, 
  StepLabel, 
  Grid, 
  Avatar, 
  CircularProgress,
  Autocomplete,
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  Link
} from "@mui/material";
import { ArrowBack, CloudUpload, ArrowForward } from '@mui/icons-material';
import "../styles/Register.css"; // <--- Import the CSS file here

// --- OPTIMIZATION: Client-Side Image Compression ---
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        ctx.canvas.toBlob((blob) => {
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(newFile);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

export default function Register() {
  const [university, setUniversity] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const nav = useNavigate();
  
  // State for Multiselects
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);

  const [user, setUser] = useState({
    fname: "", lname: "", gender: "", country: "", dob: "", city: "", state: "", profilepic: "",
    phone: "", email: "", password: "", cpassword: "", github: "", portfolioweb: "", role: "student", institute: "",
  });

  const steps = ['Personal', 'Social', 'Details', 'Photo', 'Account'];

  // Static options
  const languageOptions = [
    { label: "English" }, { label: "Hindi" }, { label: "Gujarati" },
    { label: "Bahana Indonesia" }, { label: "Bengali" }, { label: "Dansk" },
    { label: "Deutsch" }, { label: "Spanish" }, { label: "French" }, { label: "Italian" }
  ];

  const skillOptions = [
    { label: "Machine Learning" }, { label: "Python" }, { label: "Java" },
    { label: "SQL" }, { label: "React.js" }, { label: "Node" },
    { label: "Git" }, { label: "Tailwind CSS" }, { label: "JavaScript" },
    { label: "C++" }, { label: "Management" }, { label: "Communication" },
    { label: "Analytical Skills" }, { label: "Marketing" },
    { label: "Finance" }, { label: "Cloud Computing" },
  ];

  useEffect(() => {
    axios.get(`${WEB_URL}/api/getInstitutes`).then((response) => {
      setUniversity(response.data.data);
    });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [`${e.target.name}_err`]: "" }));
  };

  const handleImgChange = async (e) => {
    if (!e.target.files[0]) return;
    const originalFile = e.target.files[0];

    if (originalFile.size > 3 * 1024 * 1024) { 
        toast.error("Image size cannot be more than 3MB");
        return;
    }
    
    setUploading(true);
    const compressedFile = await compressImage(originalFile);
    var body = new FormData();
    body.append("profilepic", compressedFile);
    
    axios({
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      url: `${WEB_URL}/api/uploadUserImage`,
      data: body,
    }).then((response) => {
        setUser({ ...user, profilepic: response.data.data.url });
        setUploading(false);
        toast.success("Image Uploaded");
    }).catch(() => { 
        toast.error("Image upload failed");
        setUploading(false);
    });
  };

  const validateStep = (step) => {
    let isValid = true;
    let stepErrors = {};

    if (step === 0) { // Personal
      if (!user.fname) { isValid = false; stepErrors.fname_err = "First Name is required"; }
      if (!user.lname) { isValid = false; stepErrors.lname_err = "Last Name is required"; }
      if (!user.dob) { isValid = false; stepErrors.dob_err = "Date of Birth is required"; }
      if (!user.gender) { isValid = false; stepErrors.gender_err = "Please select gender"; }
      if (!user.phone || user.phone.length !== 10) { isValid = false; stepErrors.phone_err = "Enter valid 10 digit number"; }
      if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) { isValid = false; stepErrors.email_err = "Valid email is required"; }
    }
    if (step === 2) { // Details
      if (!user.institute) { isValid = false; stepErrors.institute_err = "Institute is required"; }
      if (languages.length === 0) { isValid = false; stepErrors.languages_err = "Select at least one language"; }
      if (skills.length === 0) { isValid = false; stepErrors.skills_err = "Select at least one skill"; }
      if (!user.city) { isValid = false; stepErrors.city_err = "City is required"; }
      if (!user.state) { isValid = false; stepErrors.state_err = "State is required"; }
      if (!user.country) { isValid = false; stepErrors.country_err = "Country is required"; }
    }
    if (step === 4) { // Account
      if (!user.password) { isValid = false; stepErrors.password_err = "Password is required"; }
      else if (user.password.length < 8) { isValid = false; stepErrors.password_err = "Min 8 characters"; }
      if (user.cpassword !== user.password) { isValid = false; stepErrors.cpassword_err = "Passwords do not match"; }
    }
    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    } else {
      toast.error("Please fill required fields correctly");
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      const langValues = languages.map(l => l.label);
      const skillValues = skills.map(s => s.label);
      
      const body = { 
        ...user, 
        languages: JSON.stringify(langValues), 
        skills: JSON.stringify(skillValues) 
      };

      try {
        await axios.post(`${WEB_URL}/api/register`, body, { withCredentials: true });
        toast.success("Registration Successful!");
        nav("/login");
      } catch (err) {
        toast.error(err.response?.data?.msg || "Registration failed");
      }
    }
  };

  // --- Step Content Renderer ---
  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <Typography variant="h5" className="reg-form-title">Personal Details</Typography>
            <Typography variant="body2" className="reg-form-subtitle">Let's get to know you better</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" name="fname" value={user.fname} onChange={handleChange} error={!!errors.fname_err} helperText={errors.fname_err} className="reg-textfield" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" name="lname" value={user.lname} onChange={handleChange} error={!!errors.lname_err} helperText={errors.lname_err} className="reg-textfield" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth type="date" label="Date of Birth" name="dob" value={user.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.dob_err} helperText={errors.dob_err} className="reg-textfield" />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.gender_err}>
                  <FormLabel component="legend">Gender</FormLabel>
                  <RadioGroup row name="gender" value={user.gender} onChange={handleChange}>
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                  {errors.gender_err && <Typography variant="caption" color="error">{errors.gender_err}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Phone" name="phone" value={user.phone} onChange={handleChange} error={!!errors.phone_err} helperText={errors.phone_err} className="reg-textfield" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Email" name="email" value={user.email} onChange={handleChange} error={!!errors.email_err} helperText={errors.email_err} className="reg-textfield" />
              </Grid>
            </Grid>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="h5" className="reg-form-title">Social Presence</Typography>
            <Typography variant="body2" className="reg-form-subtitle">Where can people find you online?</Typography>
            <TextField fullWidth label="GitHub Profile URL" name="github" value={user.github} onChange={handleChange} className="reg-textfield" />
            <TextField fullWidth label="Portfolio Website URL" name="portfolioweb" value={user.portfolioweb} onChange={handleChange} className="reg-textfield" />
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="h5" className="reg-form-title">Academic & Skills</Typography>
            <Typography variant="body2" className="reg-form-subtitle">Tell us about your background</Typography>
            
            <Autocomplete
                options={university.map((u) => u.name)}
                value={user.institute}
                onChange={(event, newValue) => { setUser({ ...user, institute: newValue }); setErrors(prev => ({...prev, institute_err: ""})) }}
                renderInput={(params) => <TextField {...params} label="Select Institute" error={!!errors.institute_err} helperText={errors.institute_err} className="reg-textfield" />}
                className="reg-textfield"
            />

            <Autocomplete
                multiple
                options={languageOptions}
                getOptionLabel={(option) => option.label}
                value={languages}
                onChange={(event, newValue) => { setLanguages(newValue); setErrors(prev => ({...prev, languages_err: ""})) }}
                renderInput={(params) => <TextField {...params} label="Languages Known" error={!!errors.languages_err} helperText={errors.languages_err} className="reg-textfield" />}
                className="reg-textfield"
            />

            <Autocomplete
                multiple
                options={skillOptions}
                getOptionLabel={(option) => option.label}
                value={skills}
                onChange={(event, newValue) => { setSkills(newValue); setErrors(prev => ({...prev, skills_err: ""})) }}
                renderInput={(params) => <TextField {...params} label="Skills" error={!!errors.skills_err} helperText={errors.skills_err} className="reg-textfield" />}
                className="reg-textfield"
            />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField fullWidth label="City" name="city" value={user.city} onChange={handleChange} error={!!errors.city_err} helperText={errors.city_err} className="reg-textfield" />
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth label="State" name="state" value={user.state} onChange={handleChange} error={!!errors.state_err} helperText={errors.state_err} className="reg-textfield" />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label="Country" name="country" value={user.country} onChange={handleChange} error={!!errors.country_err} helperText={errors.country_err} className="reg-textfield" />
                </Grid>
            </Grid>
          </>
        );
      case 3:
        return (
          <div className="reg-upload-box">
            <Typography variant="h5" className="reg-form-title">Profile Picture</Typography>
            <Typography variant="body2" className="reg-form-subtitle">Make sure it's a clear photo</Typography>
            
            {user.profilepic ? ( 
                <img src={`${WEB_URL}${user.profilepic}`} alt="Preview" className="reg-profile-preview" /> 
            ) : ( 
                <Avatar sx={{ width: 150, height: 150, mb: 2 }} /> 
            )}

            {uploading ? (
                <Box display="flex" alignItems="center" gap={1} color="#66bd9e">
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="body2" fontWeight="600">Compressing & Uploading...</Typography>
                </Box>
            ) : (
                <label className="reg-upload-label">
                    <CloudUpload fontSize="small" /> Upload Photo
                    <input type="file" hidden onChange={handleImgChange} accept="image/*" />
                </label>
            )}
          </div>
        );
      case 4:
        return (
          <>
            <Typography variant="h5" className="reg-form-title">Secure Account</Typography>
            <Typography variant="body2" className="reg-form-subtitle">Set a strong password</Typography>
            <TextField fullWidth type="password" label="Create Password" name="password" value={user.password} onChange={handleChange} error={!!errors.password_err} helperText={errors.password_err} className="reg-textfield" />
            <TextField fullWidth type="password" label="Confirm Password" name="cpassword" value={user.cpassword} onChange={handleChange} error={!!errors.cpassword_err} helperText={errors.cpassword_err} className="reg-textfield" />
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Grid container className="register-wrapper">
      
      {/* --- Visual Side --- */}
      <Grid item xs={12} md={5} className="reg-visual-side">
        <button className="reg-back-btn" onClick={() => nav("/")}>
            <ArrowBack fontSize="small" /> Back to Home
        </button>
        
        <div className="reg-visual-content">
            <h1>Join Our Community</h1>
            <p>Connect with alumni, find mentors, and explore career opportunities. Start your journey with us today.</p>
            <div className="reg-login-redirect">
                Already a member? 
                <Link component="button" className="reg-login-link" onClick={() => nav("/login")}>Log In</Link>
            </div>
        </div>
        <img src="/images/Usability testing-bro.png" alt="Register Visual" className="reg-img" loading="lazy" />
      </Grid>

      {/* --- Form Side --- */}
      <Grid item xs={12} md={7} className="reg-form-side">
        <div className="reg-form-container">
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {getStepContent(activeStep)}

            <div className="reg-btn-group">
                <Button disabled={activeStep === 0} onClick={handleBack} className="reg-btn-prev">
                    Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                    <Button onClick={handleSubmit} className="reg-btn-submit">
                        Create Account
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="reg-btn-next" disabled={uploading}>
                        Next Step <ArrowForward fontSize="small" sx={{ ml: 1 }} />
                    </Button>
                )}
            </div>
        </div>
      </Grid>
    </Grid>
  );
}