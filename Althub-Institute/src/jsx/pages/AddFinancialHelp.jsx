import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader.jsx'
import Menu from '../layout/Menu.jsx';
import Footer from '../layout/Footer.jsx';

const AddFinancialHelp = () => {
    const navigate = useNavigate();
    const [institute_Id, setInstitute_Id] = useState(null);
    const [institute_Name, setInstitute_Name] = useState(null);
    const [users, setUsers] = useState([]);

    // Theme Constant
    const themeColor = '#2563EB'; 

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");

            const id = localStorage.getItem("AlmaPlus_institute_Id");
            const name = localStorage.getItem("AlmaPlus_institute_Name");
            setInstitute_Id(id);
            setInstitute_Name(name);
        }
    }, []);

    // Fetch Users for Dropdown
    useEffect(() => {
        const getUsersData = () => {
            if (!institute_Name) return;
            const token = localStorage.getItem('token');
            axios({
                method: "get",
                url: `${ALTHUB_API_URL}/api/getUsersOfInstitute/${institute_Name}`, 
                headers: { 'Authorization': `Bearer ${token}` },
            }).then((response) => {
                if (response.data.success) {
                    setUsers(response.data.data || []);
                }
            }).catch((err) => {
                console.error("Failed to fetch users", err);
            });
        };
        getUsersData();
    }, [institute_Name]);

    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const [data, setData] = useState({
        name: "",
        aid: "",
        claimed: "",
        description: "",
        image: "",
        dueDate: ""
    });

    // Handle normal changes
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    // [NEW] Special handler for Name selection to auto-fetch image
    const handleNameChange = (e) => {
        const selectedName = e.target.value;
        let newImage = data.image; // Keep existing image by default

        // Find user by name (exact match logic based on the datalist value)
        const selectedUser = users.find(u => {
            const fullName = `${u.fname} ${u.lname || ''}`.trim();
            return fullName === selectedName;
        });

        // If user found and has a profile pic, use it
        if (selectedUser && selectedUser.profilepic) {
            newImage = selectedUser.profilepic;
            toast.info("User profile image auto-selected");
        }

        setData({ ...data, name: selectedName, image: newImage });
    };

    const handleReset = () => {
        setData({
            name: "",
            aid: "",
            claimed: "",
            description: "",
            image: "",
            dueDate: ""
        });
        document.getElementById('imageInput').value = ""; 
    }

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            toast.error("Invalid file format.");
            e.target.value = null;
            return;
        }

        var body = new FormData();
        body.append("profilepic", file); 

        axios({
            method: "post",
            headers: { "Content-Type": "multipart/form-data" },
            url: `${ALTHUB_API_URL}/api/uploadUserImage`, 
            data: body,
        }).then((response) => {
            if (response.data.success) {
                setData({ ...data, image: response.data.data.url });
                toast.success("Image uploaded successfully");
            }
        }).catch((error) => {
            toast.error("Image upload failed");
        });
    };

    const submitHandler = (e) => {
        e.preventDefault(); 
        if (validate()) {
            setDisable(true)
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/addFinancialAid`,
                data: {
                    institutename: institute_Name,
                    name: data.name,
                    aid: data.aid,
                    claimed: data.claimed,
                    description: data.description,
                    image: data.image,
                    dueDate: data.dueDate
                },
            }).then((response) => {
                handleReset();
                setDisable(false);
                toast.success("Financial aid added successfully");
                setTimeout(() => navigate('/financial-aid'), 1500);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to add financial aid");
            });
        }
    };

    const validate = () => {
        let input = data;
        let errors = {};
        let isValid = true;

        if (!input["name"]) {
            isValid = false;
            errors["name_err"] = "Please Select/Enter Student Name";
        }
        if (!input["aid"]) {
            isValid = false;
            errors["aid_err"] = "Please Enter Aid Amount";
        }
        if (!input["claimed"]) {
            isValid = false;
            errors["claimed_err"] = "Please Enter Claimed Amount";
        }
        if (!input["description"]) {
            isValid = false;
            errors["description_err"] = "Please Enter description";
        }
        if (!input["dueDate"]) {
            isValid = false;
            errors["dueDate_err"] = "Please Enter Due Date";
        }
        setErrors(errors);
        return isValid;
    }

    return (
        <Fragment>
            <ToastContainer />
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content" style={{ backgroundColor: '#F8FAFC' }}>
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: themeColor }}>Dashboard</Link></li>
                        <li className="breadcrumb-item"><Link to="/financial-aid" style={{ color: themeColor }}>Scholarship</Link></li>
                        <li className="breadcrumb-item active">Add Scholarship</li>
                    </ol>
                    <h1 className="page-header">Create Scholarship</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                    <h4 className="card-title mb-0 text-dark">Scholarship Details</h4>
                                    <Link to="/financial-aid" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Back
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <fieldset>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputName">Student Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    id="exampleInputName" 
                                                    list="studentList" 
                                                    placeholder="Search and Select Student..." 
                                                    name="name" 
                                                    value={data.name} 
                                                    onChange={handleNameChange} 
                                                    style={{ height: '45px' }} 
                                                    autoComplete="off"
                                                />
                                                <datalist id="studentList">
                                                    {users.map((user) => (
                                                        <option key={user._id} value={`${user.fname} ${user.lname || ''}`.trim()}>
                                                            {user.email}
                                                        </option>
                                                    ))}
                                                </datalist>
                                                <div className="text-danger small mt-1">{errors.name_err}</div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="courseStream">Total Aid Amount (₹)</label>
                                                    <input type='number' className="form-control" id="courseStream" placeholder="e.g. 50000" name="aid" value={data.aid} onChange={handleChange} style={{ height: '45px' }} />
                                                    <div className="text-danger small mt-1">{errors.aid_err}</div>
                                                </div>

                                                <div className="col-md-6 form-group mb-3">
                                                    <label className="font-weight-bold" htmlFor="exampleInputNumber">Claimed Amount (₹)</label>
                                                    <input type='number' className="form-control" id="exampleInputNumber" placeholder="e.g. 20000" name="claimed" value={data.claimed} onChange={handleChange} style={{ height: '45px' }} />
                                                    <div className="text-danger small mt-1">{errors.claimed_err}</div>
                                                </div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputDesc">Description</label>
                                                <textarea className="form-control" rows="3" id="exampleInputDesc" placeholder="Enter details about the scholarship or aid..." name="description" value={data.description} onChange={handleChange}></textarea>
                                                <div className="text-danger small mt-1">{errors.description_err}</div>
                                            </div>

                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="dueDate">Application Due Date</label>
                                                <input type="date" className="form-control" id="dueDate" name="dueDate" value={data.dueDate} onChange={handleChange} style={{ height: '45px' }} />
                                                <div className="text-danger small mt-1">{errors.dueDate_err}</div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold">Student/Banner Image</label>
                                                <div className="custom-file-container p-3 border rounded bg-light">
                                                    <input type="file" id="imageInput" className='form-control-file' name="image" onChange={handleImgChange} />
                                                    <small className="form-text text-muted">Auto-filled if user has a profile picture. Can be overwritten.</small>

                                                    {data.image && (
                                                        <div className="mt-3 shadow-sm rounded overflow-hidden" style={{ width: '120px', height: '120px', border: '1px solid #e2e8f0' }}>
                                                            <img
                                                                src={`${ALTHUB_API_URL}${data.image}`}
                                                                alt="Preview"
                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <button type="reset" className="btn btn-light mr-2" onClick={handleReset} style={{ minWidth: '100px' }}>Reset</button>
                                                <button type="submit" className="btn btn-primary" disabled={disable}
                                                    style={{ minWidth: '120px', backgroundColor: themeColor, borderColor: themeColor }}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...</> : 'Publish Aid'}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </Fragment>
    )
}

export default AddFinancialHelp;