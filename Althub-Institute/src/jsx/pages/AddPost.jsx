import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';

import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

const AddPost = () => {
    const navigate = useNavigate();
    
    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    const [description, setDescription] = useState("");
    const [fileList, setFileList] = useState([]);
    const [disable, setDisable] = useState(false);

    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        const element = document.getElementById("page-container");
        if (element) element.classList.add("show");
    }, []);

    const imgChange = (e) => {
        setFileList([...e.target.files]);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!description) {
            toast.error("Please enter a description");
            return;
        }

        setDisable(true);
        const formData = new FormData();
        
        // 1. Get Institute ID (Sender)
        const organizerId = localStorage.getItem("AlmaPlus_institute_Id");
        if (organizerId) {
            formData.append("senderid", organizerId);
        }

        // 2. Append Text Data
        formData.append("title", "Institute Update"); // Optional default title
        formData.append("description", description);
        formData.append("date", new Date().toISOString());

        // 3. Append Files
        if (fileList.length > 0) {
            fileList.forEach((file) => {
                formData.append('photos', file);
            });
        }

        // 4. Get Auth Token
        const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user')).token);

        try {
            await axios.post(`${ALTHUB_API_URL}/api/addPost`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}` // Critical for requireAuth
                },
            });

            toast.success("Post Created Successfully!");
            setTimeout(() => {
                navigate('/posts');
            }, 1500);

        } catch (error) {
            console.error("Add Post Error:", error);
            const errorMsg = error.response?.data?.msg || error.response?.data?.message || "Failed to create post";
            toast.error(errorMsg);
            setDisable(false);
        }
    };

    return (
        <Fragment>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{backgroundColor: '#F8FAFC'}}>
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard" style={{color: themeColor}}>Dashboard</Link></li>
                        <li className="breadcrumb-item"><Link to="/posts" style={{color: themeColor}}>Posts</Link></li>
                        <li className="breadcrumb-item active">Add Post</li>
                    </ol>
                    <h1 className="page-header">Create New Post</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                                <div className="card-header bg-white border-bottom p-3">
                                    <h4 className="card-title mb-0">Post Details</h4>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <div className="form-group mb-3">
                                            <label className="font-weight-bold">Description</label>
                                            <textarea 
                                                className="form-control" 
                                                rows="5" 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Share an update with your students..."
                                                required
                                            />
                                        </div>

                                        <div className="form-group mb-4">
                                            <label className="font-weight-bold">Upload Photos (Optional)</label>
                                            <div className="custom-file-container p-3 border rounded bg-light">
                                                <input 
                                                    type="file" 
                                                    className="form-control-file" 
                                                    onChange={imgChange} 
                                                    multiple 
                                                    accept="image/*"
                                                />
                                                <small className="text-muted d-block mt-2">You can select multiple images.</small>
                                                
                                                {/* Preview */}
                                                {fileList.length > 0 && (
                                                    <div className="row mt-3 px-2">
                                                        {fileList.map((file, index) => (
                                                            <div className="col-auto mb-2" key={index}>
                                                                <img 
                                                                    src={URL.createObjectURL(file)} 
                                                                    alt="preview" 
                                                                    style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}} 
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end">
                                            <Link to="/posts" className="btn btn-light mr-2">Cancel</Link>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary px-4" 
                                                disabled={disable}
                                                style={{backgroundColor: themeColor, borderColor: themeColor}}
                                            >
                                                {disable ? 'Posting...' : 'Create Post'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    );
};

export default AddPost;