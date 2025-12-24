/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';
import { ALTHUB_API_URL } from './baseURL';
import axios from 'axios';
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';

const AddPost = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    const [iname, setiname] = useState('');
    const [image, setImage] = useState("");
    const navigate = useNavigate();

    // Theme Constant
    const themeColor = '#2563EB'; // Royal Blue

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element) element.classList.add("show");

            const id = localStorage.getItem("AlmaPlus_institute_Id");
            setInstitute_Id(id);
        }
    }, []);
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(false);

    const [data, setData] = useState({
        description: "",
    });
    const [fileList, setFileList] = useState(null);
    const files = fileList ? [...fileList] : [];

    const imgChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = [];
        let hasInvalid = false;

        selectedFiles.forEach(file => {
            if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                validFiles.push(file);
            } else {
                hasInvalid = true;
            }
        });

        if (hasInvalid) {
            toast.error("Some files were skipped. Only .jpg, .jpeg, .png, .gif are allowed.");
        }

        if (validFiles.length > 0) {
            setFileList(validFiles);
        } else {
            e.target.value = null; // clear input if no valid files
        }
    }

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setData({
            description: "",
        });
        setFileList(null);
        document.getElementById("exampleInputfile").value = "";
    }

    const getData = () => {
        if (!institute_Id) return;
        const myurl = `${ALTHUB_API_URL}/api/getInstituteById/${institute_Id}`;
        axios({
            method: "get",
            url: myurl,
        }).then((response) => {
            if (response.data.success === true) {
                setiname(response.data.data.name);
            }
        });
    };

    const getInstitute = () => {
        axios({
            url: `${ALTHUB_API_URL}/api/getInstituteById/${institute_Id}`,
            method: "get",
        }).then((Response) => {
            setImage(Response.data.data.image && Response.data.data.image);
        })
    }

    useEffect(() => {
        getData();
        getInstitute();
    }, [institute_Id]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (validate() && institute_Id) {
            setDisable(true)
            const body = new FormData();
            body.append("userid", institute_Id);
            body.append("fname", iname);
            body.append("description", data.description);
            files.forEach((file, i) => {
                body.append(`photos`, file, file.name);
            });
            body.append("profilepic", image);
            body.append("date", new Date());
            axios({
                method: "post",
                url: `${ALTHUB_API_URL}/api/instituteAddPost`,
                data: body,
                headers: {
                    "content-type": "multipart/form-data"
                },
            }).then((response) => {
                handleReset();
                setDisable(false);
                toast.success("Post Added Successfully");
                setTimeout(() => {
                    navigate('/posts');
                }, 1500);
            }).catch((error) => {
                setDisable(false);
                toast.error("Failed to add post");
            });
        }
    };

    const validate = () => {
        let input = data;
        let errors = {};
        let isValid = true;

        if (!input["description"]) {
            isValid = false;
            errors["description_err"] = "Please Enter Description";
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
                        <li className="breadcrumb-item"><Link to="/posts" style={{ color: themeColor }}>Posts</Link></li>
                        <li className="breadcrumb-item active">Add Post</li>
                    </ol>
                    <h1 className="page-header">Create New Post</h1>

                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                    <h4 className="card-title mb-0 text-dark">Post Details</h4>
                                    <Link to="/posts" className="btn btn-light btn-sm shadow-sm">
                                        <i className="fa fa-arrow-left mr-1"></i> Back
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={submitHandler}>
                                        <fieldset>
                                            <div className="form-group mb-3">
                                                <label className="font-weight-bold" htmlFor="exampleInputdesc">What's happening?</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="5"
                                                    id="exampleInputdesc"
                                                    placeholder="Share news, updates, or announcements..."
                                                    name="description"
                                                    value={data.description}
                                                    onChange={handleChange}
                                                    style={{ resize: 'none' }}
                                                ></textarea>
                                                <div className="text-danger small mt-1">{errors.description_err}</div>
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="font-weight-bold" htmlFor="exampleInputfile">Attach Media</label>
                                                <div className="custom-file-container p-3 border rounded bg-light">
                                                    <input
                                                        type='file'
                                                        multiple
                                                        className="form-control-file"
                                                        id="exampleInputfile"
                                                        name="photos"
                                                        onChange={imgChange}
                                                    />
                                                    <small className="text-muted d-block mt-2">Add photos to make your post engaging.</small>

                                                    {files.length > 0 && (
                                                        <div className="selected-img row mt-3 px-2">
                                                            {files.map((elem, index) =>
                                                                <div className='col-auto mb-2' key={index}>
                                                                    <div className="shadow-sm rounded overflow-hidden" style={{ width: '100px', height: '100px' }}>
                                                                        <img src={window.URL.createObjectURL(elem)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <button type="reset" className="btn btn-light mr-2" onClick={handleReset} style={{ minWidth: '100px' }}>Reset</button>
                                                <button type="submit" className="btn btn-primary" disabled={disable}
                                                    style={{ minWidth: '120px', backgroundColor: themeColor, borderColor: themeColor }}>
                                                    {disable ? <><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Posting...</> : 'Publish Post'}
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

export default AddPost;