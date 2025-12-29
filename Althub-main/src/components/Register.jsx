import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

// --- STYLES REMAIN SAME ---
const styles = `
  .register-page-wrapper { min-height: 100vh; display: flex; font-family: 'Poppins', sans-serif; background-color: #fff; }
  .reg-visual-section { flex: 1; background: linear-gradient(135deg, #e3fdf5 0%, #ffe6fa 100%); display: flex; flex-direction: column; justify-content: center; padding: 60px; position: relative; color: #2d3436; }
  .back-home-btn { position: absolute; top: 40px; left: 40px; padding: 10px 20px; background: rgba(255,255,255,0.8); border-radius: 30px; text-decoration: none; color: #333; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; border: none; cursor: pointer; transition: all 0.2s; }
  .back-home-btn:hover { background: #fff; transform: translateX(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
  .reg-visual-content { max-width: 500px; z-index: 1; }
  .reg-visual-content h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 20px; color: #2d3436; }
  .reg-visual-content p { font-size: 1.1rem; color: #636e72; line-height: 1.6; margin-bottom: 30px; }
  .login-redirect { font-weight: 500; }
  .login-redirect a { color: #66bd9e; text-decoration: none; font-weight: 700; margin-left: 5px; }
  .login-redirect a:hover { text-decoration: underline; }
  .reg-img { margin-top: 40px; width: 90%; max-width: 450px; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.08)); }
  .reg-form-section { flex: 1.2; padding: 40px; display: flex; align-items: center; justify-content: center; background: #fff; }
  .reg-form-container { width: 100%; max-width: 600px; }
  .progress-bar-container { margin-bottom: 40px; display: flex; justify-content: space-between; position: relative; }
  .progress-step { flex: 1; text-align: center; font-size: 0.8rem; color: #ccc; font-weight: 500; position: relative; cursor: default; padding-bottom: 10px; border-bottom: 3px solid #eee; transition: all 0.3s; }
  .progress-step.active { color: #66bd9e; border-bottom-color: #66bd9e; }
  .form-title { font-size: 1.8rem; font-weight: 700; color: #333; margin-bottom: 5px; }
  .form-subtitle { color: #888; margin-bottom: 30px; font-size: 0.95rem; }
  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .form-group { margin-bottom: 20px; }
  .form-control { width: 100%; padding: 12px 15px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; background: #fcfcfc; }
  .form-control:focus { border-color: #66bd9e; background: #fff; }
  .error-text { color: #ff4757; font-size: 0.8rem; margin-top: 5px; display: block; }
  .gender-group { display: flex; gap: 20px; margin-top: 10px; }
  .gender-option { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 20px; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.2s; }
  .gender-option.selected { background: #f0f9f6; border-color: #66bd9e; color: #66bd9e; }
  .btn-group { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
  .btn-next, .btn-submit { padding: 12px 30px; background: #66bd9e; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-next:hover, .btn-submit:hover { background: #479378; transform: translateY(-2px); }
  .btn-prev { padding: 12px 30px; background: #f1f3f5; color: #555; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-prev:hover { background: #e9ecef; }
  .profile-upload-box { display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .profile-preview { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #f0f9f6; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  .upload-label { padding: 10px 20px; border: 1px dashed #66bd9e; color: #66bd9e; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
  .upload-label:hover { background: #f0f9f6; }
  @media (max-width: 900px) { .register-page-wrapper { flex-direction: column; } .reg-visual-section { padding: 40px 20px; flex: none; } .reg-form-section { padding: 30px 20px; } .input-grid { grid-template-columns: 1fr; } }
`;

export default function Register() {
  const [universityShow, setUniversityShow] = useState(false);
  const [university, setUniversity] = useState([]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false); // Added loading state for image
  const nav = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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
          const MAX_WIDTH = 800; // Profile pics don't need to be huge
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
          }, 'image/jpeg', 0.7); // 70% Quality
        };
      };
    });
  };

  const handleImgChange = async (e) => {
    if (!e.target.files[0]) return;
    
    const originalFile = e.target.files[0];

    // --- NEW: Check Size Limit (3MB) ---
    if (originalFile.size > 3 * 1024 * 1024) { // 3MB in bytes
        toast.error("Image size cannot be more than 3MB");
        e.target.value = ""; // Clear file input to allow re-selection
        return;
    }
    
    setUploading(true); // Start loading UI
    
    // Compress
    const compressedFile = await compressImage(originalFile);

    var body = new FormData();
    body.append("profilepic", compressedFile);
    
    axios({
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      url: `${WEB_URL}/api/uploadUserImage`,
      data: body,
    })
      .then((response) => {
        setUser({ ...user, profilepic: response.data.data.url });
        setErrors((prev) => ({ ...prev, profilepic_err: "" }));
        setUploading(false); // Stop loading UI
        toast.success("Image Uploaded");
      })
      .catch((error) => { 
        toast.error("Image upload failed");
        setUploading(false);
      });
  };

  const option1 = [
    { value: "English", label: "English" }, { value: "Hindi", label: "Hindi" }, { value: "Gujarati", label: "Gujarati" },
    { value: "Bahana Indonesia", label: "Bahana Indonesia" }, { value: "Bengali", label: "Bengali" }, { value: "Dansk", label: "Dansk" },
    { value: "Deutsch", label: "Deutsch" }, { value: "Spanish", label: "Spanish" }, { value: "French", label: "French" }, { value: "Italian", label: "Italian" }
  ];

  const option2 = [
    { value: "Machine Learning", label: "Machine Learning" }, { value: "Python", label: "Python" }, { value: "Java", label: "Java" },
    { value: "SQL", label: "SQL" }, { value: "React.js", label: "React.js" }, { value: "Node", label: "Node" },
    { value: "Git", label: "Git" }, { value: "Tailwind CSS", label: "Tailwind CSS" }, { value: "JavaScript", label: "JavaScript" },
    { value: "C++", label: "C++" }, { value: "Management", label: "Management" }, { value: "Communication", label: "Communication" },
    { value: "Analytical Skills", label: "Analytical Skills" }, { value: "Marketing", label: "Marketing" },
    { value: "Finance", label: "Finance" }, { value: "Cloud Computing", label: "Cloud Computing" },
  ];

  const colorStyle = {
    control: (styles) => ({ ...styles, padding: "2px", border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "none", "&:hover": { borderColor: "#66bd9e" } }),
    option: (styles, { isFocused, isSelected }) => ({ ...styles, backgroundColor: isSelected ? "#66bd9e" : isFocused ? "#f0f9f6" : null, color: isSelected ? "white" : "#333", }),
  };

  const handleSelect1 = (e) => { setLanguages(e); setErrors((prev) => ({ ...prev, languages_err: "" })); };
  const handleSelect2 = (e) => { setSkills(e); setErrors((prev) => ({ ...prev, skills_err: "" })); };

  const [user, setUser] = useState({
    fname: "", lname: "", gender: "", country: "", dob: "", city: "", state: "", profilepic: "",
    phone: "", email: "", password: "", cpassword: "", github: "", portfolioweb: "", role: "", institute: "",
  });

  const increaseStep = () => { if (validateStep(step)) { setStep(step + 1); } else { toast.error("Please fill in the required fields correctly."); } };
  const decraseStep = () => { setStep(step - 1); };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    const fieldName = e.target.name;
    setErrors((prev) => ({ ...prev, [`${fieldName}_err`]: "" }));
  };

  const validateEmail = (email) => { const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/; return regex.test(String(email).toLowerCase()); };
  const validatePhone = (phone) => { const digitsOnly = String(phone).replace(/\D/g, ""); return digitsOnly.length === 10; };

  const validateStep = (currentStep) => {
    let input = user;
    let stepErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!input["fname"]) { isValid = false; stepErrors["fname_err"] = "First Name is required"; }
      if (!input["lname"]) { isValid = false; stepErrors["lname_err"] = "Last Name is required"; }
      if (!input["dob"]) { isValid = false; stepErrors["dob_err"] = "Date of Birth is required"; }
      if (!input["gender"]) { isValid = false; stepErrors["gender_err"] = "Please select gender"; }
      if (!input["phone"]) { isValid = false; stepErrors["phone_err"] = "Phone is required"; } else if (!validatePhone(input["phone"])) { isValid = false; stepErrors["phone_err"] = "Enter 10 digit number"; }
      if (!input["email"]) { isValid = false; stepErrors["email_err"] = "Email is required"; } else if (!validateEmail(input["email"])) { isValid = false; stepErrors["email_err"] = "Invalid email format"; }
    }
    if (currentStep === 3) {
      if (!input["institute"]) { isValid = false; stepErrors["institute_err"] = "Institute is required"; }
      if (!languages || languages.length === 0) { isValid = false; stepErrors["languages_err"] = "Select at least one language"; }
      if (!skills || skills.length === 0) { isValid = false; stepErrors["skills_err"] = "Select at least one skill"; }
      if (!input["country"]) { isValid = false; stepErrors["country_err"] = "Country is required"; }
      if (!input["state"]) { isValid = false; stepErrors["state_err"] = "State is required"; }
      if (!input["city"]) { isValid = false; stepErrors["city_err"] = "City is required"; }
    }
    if (currentStep === 5) {
        if (!input["password"]) { isValid = false; stepErrors["password_err"] = "Password is required"; }
        else if (input["password"].length < 8) { isValid = false; stepErrors["password_err"] = "Min 8 characters"; }
        if (input["cpassword"] !== input["password"]) { isValid = false; stepErrors["cpassword_err"] = "Passwords do not match"; }
    }
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(5)) {
      var lang = languages.map((elem) => elem.value);
      var skill = skills.map((elem) => elem.value);
      var body = { ...user, languages: JSON.stringify(lang), skills: JSON.stringify(skill) };
      const myurl = `${WEB_URL}/api/register`;

      axios.post(myurl, body,{ withCredentials: true })
        .then((res) => { toast.success("Register Successful!"); nav("/login"); })
        .catch((err) => { toast.error(err.response?.data?.msg || "Registration failed"); });
    }
  };

  const getUniversity = () => {
    axios.get(`${WEB_URL}/api/getInstitutes`).then((response) => {
      setUniversity(response.data.data);
    });
  };

  useEffect(() => { getUniversity(); }, []);

  return (
    <div className="register-page-wrapper">
      <div className="reg-visual-section">
        <button className="back-home-btn" onClick={() => nav("/")}><i className="fa-solid fa-arrow-left"></i> Back to Home</button><br></br><br></br>
        <div className="reg-visual-content">
            <h1>Join Our Community</h1>
            <p>Connect with alumni, find mentors, and explore career opportunities. Start your journey with us today.</p>
            <div className="login-redirect">Already a member? <a href="#" onClick={(e) => {e.preventDefault(); nav("/login")}}>Log In</a></div>
        </div>
        <img src="/images/Usability testing-bro.png" alt="Register Visual" className="reg-img" loading="lazy" />
      </div>

      <div className="reg-form-section">
        <div className="reg-form-container">
            <div className="progress-bar-container">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>Personal</div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>Social</div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>Details</div>
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>Photo</div>
                <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>Account</div>
            </div>

            {step === 1 && (
                <div>
                    <h2 className="form-title">Personal Details</h2>
                    <p className="form-subtitle">Let's get to know you better</p>
                    <div className="input-grid">
                        <div className="form-group"><input type="text" name="fname" className="form-control" placeholder="First Name" value={user.fname} onChange={handleChange} />{errors.fname_err && <span className="error-text">{errors.fname_err}</span>}</div>
                        <div className="form-group"><input type="text" name="lname" className="form-control" placeholder="Last Name" value={user.lname} onChange={handleChange} />{errors.lname_err && <span className="error-text">{errors.lname_err}</span>}</div>
                    </div>
                    <div className="form-group"><label style={{fontSize: '0.9rem', color: '#666'}}>Date of Birth</label><input type="date" name="dob" className="form-control" value={user.dob} onChange={handleChange} />{errors.dob_err && <span className="error-text">{errors.dob_err}</span>}</div>
                    <div className="form-group">
                        <label style={{fontSize: '0.9rem', color: '#666'}}>Gender</label>
                        <div className="gender-group">
                            <div className={`gender-option ${user.gender === "Male" ? "selected" : ""}`} onClick={() => {setUser({...user, gender: "Male"}); setErrors(p=>({...p, gender_err: ""}))}}><i className="fa-solid fa-mars"></i> Male</div>
                            <div className={`gender-option ${user.gender === "Female" ? "selected" : ""}`} onClick={() => {setUser({...user, gender: "Female"}); setErrors(p=>({...p, gender_err: ""}))}}><i className="fa-solid fa-venus"></i> Female</div>
                        </div>
                        {errors.gender_err && <span className="error-text">{errors.gender_err}</span>}
                    </div>
                    <div className="input-grid">
                        <div className="form-group"><input type="text" name="phone" className="form-control" placeholder="Phone Number" value={user.phone} onChange={handleChange} />{errors.phone_err && <span className="error-text">{errors.phone_err}</span>}</div>
                        <div className="form-group"><input type="text" name="email" className="form-control" placeholder="Email Address" value={user.email} onChange={handleChange} />{errors.email_err && <span className="error-text">{errors.email_err}</span>}</div>
                    </div>
                    <div className="btn-group"><button className="btn-next" onClick={increaseStep}>Next Step <i className="fa-solid fa-arrow-right"></i></button></div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="form-title">Social Presence</h2>
                    <p className="form-subtitle">Where can people find you online?</p>
                    <div className="form-group"><input type="text" name="github" className="form-control" placeholder="GitHub Profile URL" value={user.github} onChange={handleChange} /></div>
                    <div className="form-group"><input type="text" name="portfolioweb" className="form-control" placeholder="Portfolio Website URL" value={user.portfolioweb} onChange={handleChange} /></div>
                    <div className="btn-group"><button className="btn-prev" onClick={decraseStep}>Back</button><button className="btn-next" onClick={increaseStep}>Next Step</button></div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2 className="form-title">Academic & Skills</h2>
                    <p className="form-subtitle">Tell us about your background</p>
                    <div className="form-group"><Select options={university.map(u => ({label: u.name, value: u.name}))} onChange={(opt) => {setUser({...user, institute: opt.value}); setErrors(p=>({...p, institute_err: ""}));}} placeholder="Select Institute" styles={colorStyle}/>{errors.institute_err && <span className="error-text">{errors.institute_err}</span>}</div>
                    <div className="form-group"><Select options={option1} isMulti onChange={handleSelect1} placeholder="Languages Known" value={languages} styles={colorStyle} />{errors.languages_err && <span className="error-text">{errors.languages_err}</span>}</div>
                    <div className="form-group"><Select options={option2} isMulti onChange={handleSelect2} placeholder="Skills" value={skills} styles={colorStyle} />{errors.skills_err && <span className="error-text">{errors.skills_err}</span>}</div>
                    <div className="input-grid">
                        <div className="form-group"><input type="text" name="city" className="form-control" placeholder="City" value={user.city} onChange={handleChange} />{errors.city_err && <span className="error-text">{errors.city_err}</span>}</div>
                        <div className="form-group"><input type="text" name="state" className="form-control" placeholder="State" value={user.state} onChange={handleChange} />{errors.state_err && <span className="error-text">{errors.state_err}</span>}</div>
                    </div>
                    <div className="form-group"><input type="text" name="country" className="form-control" placeholder="Country" value={user.country} onChange={handleChange} />{errors.country_err && <span className="error-text">{errors.country_err}</span>}</div>
                    <div className="btn-group"><button className="btn-prev" onClick={decraseStep}>Back</button><button className="btn-next" onClick={increaseStep}>Next Step</button></div>
                </div>
            )}

            {step === 4 && (
                <div className="profile-upload-box">
                    <h2 className="form-title">Profile Picture</h2>
                    <p className="form-subtitle">Make sure it's a clear photo</p>
                    {user.profilepic ? ( <img src={`${WEB_URL}${user.profilepic}`} alt="Preview" className="profile-preview" /> ) : ( <div className="profile-preview" style={{background: '#f0f0f0'}}></div> )}
                    
                    {/* --- OPTIMIZATION: Loading State --- */}
                    {uploading ? (
                      <span style={{color: '#66bd9e', fontWeight:'600'}}>Compressing & Uploading...</span>
                    ) : (
                      <label className="upload-label"><i className="fa-solid fa-camera"></i> Upload Photo<input type="file" hidden onChange={handleImgChange} accept="image/*"/></label>
                    )}
                    <div className="btn-group" style={{width: '100%'}}><button className="btn-prev" onClick={decraseStep}>Back</button><button className="btn-next" onClick={increaseStep} disabled={uploading}>Next Step</button></div>
                </div>
            )}

            {step === 5 && (
                <div>
                    <h2 className="form-title">Secure Account</h2>
                    <p className="form-subtitle">Set a strong password</p>
                    <div className="form-group"><input type="password" name="password" className="form-control" placeholder="Create Password" value={user.password} onChange={handleChange} />{errors.password_err && <span className="error-text">{errors.password_err}</span>}</div>
                    <div className="form-group"><input type="password" name="cpassword" className="form-control" placeholder="Confirm Password" value={user.cpassword} onChange={handleChange} />{errors.cpassword_err && <span className="error-text">{errors.cpassword_err}</span>}</div>
                    <div className="btn-group"><button className="btn-prev" onClick={decraseStep}>Back</button><button className="btn-submit" onClick={handleSubmit}>Create Account</button></div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}