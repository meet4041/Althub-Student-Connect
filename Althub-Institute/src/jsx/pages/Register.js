import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// This line was causing the error; it will now work if Step 1 is done
import axiosInstance from '../../service/axios'; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        masterKey: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Security check: passwords must match
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        setLoading(true);
        try {
            // POST request to your secured register route
            const response = await axiosInstance.post('/api/registerInstitute', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                masterKey: formData.masterKey // Authorizes registration
            });

            if (response.data.success) {
                toast.success("Institute Registered Successfully!");
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            // Displays specific error (e.g., "Invalid Master Key")
            toast.error(error.response?.data?.msg || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (document.getElementById('page-loader')) {
            document.getElementById('page-loader').style.display = 'none';
        }
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
    }, []);

    return (
        <div className="login-cover">
            <ToastContainer />
            <div className="login-cover-bg"></div>
            <div id="page-container" className="fade">
                <div className="login login-v2">
                    <div className="login-header">
                        <div className="brand">
                            <b>Althub</b> Institute
                            <small>Secure Institute Registration</small>
                        </div>
                    </div>
                    <div className="login-content">
                        <form onSubmit={submitHandler}>
                            <div className="form-group m-b-15">
                                <input type="text" name="name" className="form-control form-control-lg" placeholder="Institute Name" onChange={handleInput} required />
                            </div>
                            <div className="form-group m-b-15">
                                <input type="email" name="email" className="form-control form-control-lg" placeholder="Email Address" onChange={handleInput} required />
                            </div>
                            <div className="form-group m-b-15">
                                <input type="text" name="phone" className="form-control form-control-lg" placeholder="Phone Number" onChange={handleInput} required />
                            </div>
                            <div className="form-group m-b-15">
                                <input type="password" name="password" className="form-control form-control-lg" placeholder="Password" onChange={handleInput} required />
                            </div>
                            <div className="form-group m-b-15">
                                <input type="password" name="confirmPassword" className="form-control form-control-lg" placeholder="Confirm Password" onChange={handleInput} required />
                            </div>
                            <div className="form-group m-b-15">
                                <label className="text-white">Security Master Key:</label>
                                <input 
                                    type="password" 
                                    name="masterKey" 
                                    className="form-control form-control-lg" 
                                    style={{ border: '2px solid #ff5b57', background: '#2d353c', color: '#fff' }} 
                                    placeholder="Enter Security Key" 
                                    onChange={handleInput} 
                                    required 
                                />
                            </div>
                            <div className="login-buttons">
                                <button type="submit" className="btn btn-success btn-block btn-lg" disabled={loading}>
                                    {loading ? "Registering..." : "Register Now"}
                                </button>
                            </div>
                            <div className="m-t-20 text-white">
                                Already registered? <Link to="/login" className="text-success">Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;