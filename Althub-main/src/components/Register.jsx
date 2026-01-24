import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WEB_URL } from "../baseURL";
import { toast } from "react-toastify";
import {
  ArrowLeft, ArrowRight, User, Calendar, MapPin,
  Mail, Phone, Github, Globe, Upload, Lock, Check, School, X, Eye, EyeOff
} from 'lucide-react'; // Added Eye and EyeOff icons
import "../styles/Register.css";

// --- Client-Side Image Compression ---
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
        canvas.width = (scaleSize < 1) ? MAX_WIDTH : img.width;
        canvas.height = (scaleSize < 1) ? img.height * scaleSize : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

export default function Register() {
  const nav = useNavigate();
  const [university, setUniversity] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tag Inputs
  const [langInput, setLangInput] = useState("");
  const [languages, setLanguages] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const [user, setUser] = useState({
    fname: "", lname: "", gender: "", country: "", dob: "", city: "", state: "", profilepic: "",
    phone: "", email: "", password: "", cpassword: "", github: "", portfolioweb: "", role: "student", institute: "",
  });

  const steps = ['Personal', 'Social', 'Details', 'Photo', 'Account'];

  useEffect(() => {
    if (localStorage.getItem("Althub_Id")) nav('/home');
    axios.get(`${WEB_URL}/api/getInstitutes`).then((res) => setUniversity(res.data.data));
  }, [nav]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [`${e.target.name}_err`]: "" }));
  };

  // --- Tag Logic ---
  const handleTagKeyDown = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = type === 'lang' ? langInput.trim() : skillInput.trim();
      if (!val) return;

      if (type === 'lang') {
        if (!languages.includes(val)) setLanguages([...languages, val]);
        setLangInput("");
      } else {
        if (!skills.includes(val)) setSkills([...skills, val]);
        setSkillInput("");
      }
    }
  };

  const removeTag = (tag, type) => {
    if (type === 'lang') setLanguages(languages.filter(t => t !== tag));
    else setSkills(skills.filter(t => t !== tag));
  };

  const handleImgChange = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 3 * 1024 * 1024) return toast.error("Max size 3MB");

    setUploading(true);
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("profilepic", compressed);

    axios.post(`${WEB_URL}/api/uploadUserImage`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        setUser({ ...user, profilepic: res.data.data.url });
        setUploading(false);
        toast.success("Uploaded!");
      })
      .catch(() => {
        setUploading(false);
        toast.error("Upload failed");
      });
  };

  const validateStep = (step) => {
    let errs = {};
    let isValid = true;

    if (step === 0) {
      if (!user.fname) errs.fname_err = "Required";
      if (!user.lname) errs.lname_err = "Required";
      if (!user.dob) errs.dob_err = "Required";
      if (!user.gender) errs.gender_err = "Required";
      if (!user.phone || user.phone.length !== 10) errs.phone_err = "Invalid phone";
      if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) errs.email_err = "Invalid email";
    }
    if (step === 2) {
      if (!user.institute) errs.institute_err = "Required";
      if (!languages.length) errs.languages_err = "Add 1 language";
      if (!skills.length) errs.skills_err = "Add 1 skill";
      if (!user.city) errs.city_err = "Required";
      if (!user.country) errs.country_err = "Required";
    }
    if (step === 4) {
      if (!user.password || user.password.length < 8) errs.password_err = "Min 8 chars";
      if (user.password !== user.cpassword) errs.cpassword_err = "Mismatch";
    }

    if (Object.keys(errs).length > 0) isValid = false;
    setErrors(errs);
    return isValid;
  };

  const handleNext = () => { if (validateStep(activeStep)) setActiveStep(p => p + 1); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      const body = { ...user, languages: JSON.stringify(languages), skills: JSON.stringify(skills) };
      try {
        await axios.post(`${WEB_URL}/api/register`, body, { withCredentials: true });
        toast.success("Welcome aboard!");
        nav("/login");
      } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0: return (
        <div className="input-group animate-fade-in-up">
          <div><label className="input-label">First Name</label><div className="input-wrapper"><User className="input-icon" /><input name="fname" value={user.fname} onChange={handleChange} className="custom-input" placeholder="John" /></div><span className="text-red-500 text-xs">{errors.fname_err}</span></div>
          <div><label className="input-label">Last Name</label><div className="input-wrapper"><User className="input-icon" /><input name="lname" value={user.lname} onChange={handleChange} className="custom-input" placeholder="Doe" /></div><span className="text-red-500 text-xs">{errors.lname_err}</span></div>
          <div><label className="input-label">Date of Birth</label><div className="input-wrapper"><Calendar className="input-icon" /><input type="date" name="dob" value={user.dob} onChange={handleChange} className="custom-input" /></div><span className="text-red-500 text-xs">{errors.dob_err}</span></div>
          <div><label className="input-label">Phone</label><div className="input-wrapper"><Phone className="input-icon" /><input type="number" name="phone" value={user.phone} onChange={handleChange} className="custom-input" placeholder="9876543210" /></div><span className="text-red-500 text-xs">{errors.phone_err}</span></div>
          <div className="full-width"><label className="input-label">Email</label><div className="input-wrapper"><Mail className="input-icon" /><input type="email" name="email" value={user.email} onChange={handleChange} className="custom-input" placeholder="john@example.com" /></div><span className="text-red-500 text-xs">{errors.email_err}</span></div>
          <div className="full-width">
            <label className="input-label">Gender</label>
            <div className="radio-group">
              {['Male', 'Female'].map(g => (
                <div key={g} onClick={() => setUser({ ...user, gender: g })} className={`radio-label ${user.gender === g ? 'selected' : ''}`}>
                  <div className={`radio-circle ${user.gender === g ? 'border-brand-500' : 'border-slate-300'}`}><div className="radio-dot"></div></div>
                  <span className="font-medium text-sm">{g}</span>
                </div>
              ))}
            </div>
            <span className="text-red-500 text-xs">{errors.gender_err}</span>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-6 animate-fade-in-up">
          <div><label className="input-label">GitHub URL</label><div className="input-wrapper"><Github className="input-icon" /><input name="github" value={user.github} onChange={handleChange} className="custom-input" placeholder="https://github.com/..." /></div></div>
          <div><label className="input-label">Portfolio URL</label><div className="input-wrapper"><Globe className="input-icon" /><input name="portfolioweb" value={user.portfolioweb} onChange={handleChange} className="custom-input" placeholder="https://myportfolio.com" /></div></div>
        </div>
      );
      case 2: return (
        <div className="space-y-5 animate-fade-in-up">
          <div>
            <label className="input-label">Institute</label>
            <div className="input-wrapper">
              <School className="input-icon" />
              <select name="institute" value={user.institute} onChange={handleChange} className="custom-input appearance-none bg-white">
                <option value="">Select Institute</option>
                {university.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <span className="text-red-500 text-xs">{errors.institute_err}</span>
          </div>

          <div>
            <label className="input-label">Languages (Type & Enter)</label>
            <div className="tag-container">
              {languages.map(l => <span key={l} className="tag-pill">{l} <X size={14} className="cursor-pointer hover:text-red-600" onClick={() => removeTag(l, 'lang')} /></span>)}
              <input value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => handleTagKeyDown(e, 'lang')} className="tag-input" placeholder="Add..." />
            </div>
            <span className="text-red-500 text-xs">{errors.languages_err}</span>
          </div>

          <div>
            <label className="input-label">Skills (Type & Enter)</label>
            <div className="tag-container">
              {skills.map(s => <span key={s} className="tag-pill">{s} <X size={14} className="cursor-pointer hover:text-red-600" onClick={() => removeTag(s, 'skill')} /></span>)}
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => handleTagKeyDown(e, 'skill')} className="tag-input" placeholder="Add Skill..." />
            </div>
            <span className="text-red-500 text-xs">{errors.skills_err}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">City</label><div className="input-wrapper"><MapPin className="input-icon" /><input name="city" value={user.city} onChange={handleChange} className="custom-input" /></div><span className="text-red-500 text-xs">{errors.city_err}</span></div>
            <div><label className="input-label">State</label><div className="input-wrapper"><MapPin className="input-icon" /><input name="state" value={user.state} onChange={handleChange} className="custom-input" /></div></div>
          </div>
          <div><label className="input-label">Country</label><div className="input-wrapper"><Globe className="input-icon" /><input name="country" value={user.country} onChange={handleChange} className="custom-input" /></div><span className="text-red-500 text-xs">{errors.country_err}</span></div>
        </div>
      );
      case 3: return (
        <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
          <div className="relative">
            {user.profilepic ? (
              <img src={`${WEB_URL}${user.profilepic}`} alt="Preview" className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl" />
            ) : (
              <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center border-4 border-dashed border-slate-300">
                <User className="w-16 h-16 text-slate-300" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-brand-600 p-3 rounded-full text-white cursor-pointer shadow-lg hover:bg-brand-700 transition-transform hover:scale-110">
              <Upload className="w-5 h-5" />
              <input type="file" hidden onChange={handleImgChange} accept="image/*" />
            </label>
          </div>
          <p className="mt-4 text-slate-500 text-sm">Supported: JPG, PNG (Max 3MB)</p>
          {uploading && <span className="text-brand-600 text-sm font-semibold mt-2 animate-pulse">Compressing & Uploading...</span>}
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleChange}
                className="custom-input pr-12" // Added extra padding right
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <span className="text-red-500 text-xs">{errors.password_err}</span>
          </div>

          <div>
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="cpassword"
                value={user.cpassword}
                onChange={handleChange}
                className="custom-input pr-12" // Added extra padding right
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <span className="text-red-500 text-xs">{errors.cpassword_err}</span>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="register-wrapper">
      {/* Visual Side */}
      <div className="register-visual-side">
        <div className="visual-blob bg-brand-300 top-0 left-0 w-96 h-96"></div>
        <div className="visual-blob bg-secondary-300 bottom-0 right-0 w-96 h-96 animation-delay-2000"></div>
        <div className="visual-content">
          <img src="images/search-bro.png" alt="Join" className="w-full max-w-sm mx-auto drop-shadow-2xl mb-8" />
          <h2 className="text-3xl font-bold text-slate-800">Join the Community</h2>
          <p className="text-slate-600 text-lg">Connect, mentor, and grow with your alumni network.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="register-form-side">
        <button onClick={() => nav("/")} className="back-home-btn">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>

        <div className="form-container">
          <div className="text-center mb-8">
            <h1 className="form-title">Create Account</h1>
            <p className="text-slate-500">Step {activeStep + 1} of {steps.length}: {steps[activeStep]}</p>
          </div>

          {/* Custom Stepper */}
          <div className="stepper-container">
            <div className="stepper-line-bg"></div>
            <div className="stepper-line-fill" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}></div>
            {steps.map((label, idx) => (
              <div key={label} className="step-item">
                <div className={`step-circle ${idx <= activeStep ? (idx === activeStep ? 'step-active' : 'step-completed') : 'step-inactive'}`}>
                  {idx < activeStep ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`step-label ${idx <= activeStep ? 'text-brand-600' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <form className="min-h-[300px]">
            {renderStep()}
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <button onClick={() => setActiveStep(p => p - 1)} disabled={activeStep === 0} className="btn-nav btn-prev">
              Back
            </button>

            {activeStep === steps.length - 1 ? (
              <button onClick={handleSubmit} className="btn-nav btn-next">
                Create Account
              </button>
            ) : (
              <button onClick={handleNext} disabled={uploading} className="btn-nav btn-next">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

          <div className="text-center mt-8 text-sm text-slate-500">
            Already have an account? <span onClick={() => nav("/login")} className="text-brand-600 font-bold cursor-pointer hover:underline">Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
}