import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../layout/Loader'
import Menu from '../layout/Menu';
import Footer from '../layout/Footer';
import { ALTHUB_API_URL } from './baseURL';
import SweetAlert from 'react-bootstrap-sweetalert';
import axios from 'axios';

const Courses = () => {
    const [institute_Id, setInstitute_Id] = useState(null);
    let navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [displayCourses, setDisplayCourses] = useState([]);
    const rows = [10, 20, 30];
    const [coursesPerPage, setCoursesPerPage] = useState(rows[0]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loader = document.getElementById('page-loader');
            const element = document.getElementById("page-container");
            if (loader) loader.style.display = 'none';
            if (element && element.classList) element.classList.add("show");
            
            const id = localStorage.getItem("AlmaPlus_institute_Id");
            setInstitute_Id(id);
        }
    }, []);

    const getCoursesData = useCallback(() => {
        if (institute_Id) {
            axios({
                method: "get",
                url: `${ALTHUB_API_URL}/api/getCourseByInstitute/${institute_Id}`,
            }).then((response) => {
                setCourses(response.data.data || []);
            }).catch(() => {
                setCourses([]);
            });
        }
    }, [institute_Id]);

    useEffect(() => {
        if (institute_Id) {
            getCoursesData();
        }
    }, [getCoursesData]);

    useEffect(() => {
        setDisplayCourses(courses);
    }, [courses]);

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = displayCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(displayCourses.length / coursesPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (num) => {
        setCurrentPage(num);
    }

    const handleSearch = (e) => {
        const value = e.target.value || '';
        if (value) {
            const search = value.toLowerCase();
            setDisplayCourses(
                courses.filter((elem) =>
                    (elem.name || '').toLowerCase().includes(search) ||
                    (elem.stream || '').toLowerCase().includes(search)
                )
            );
            setCurrentPage(1);
        } else {
            setDisplayCourses(courses);
        }
    }
    const [deleteId, setDeleteId] = useState('');
    const [alert, setAlert] = useState(false);
    const [alert2, setAlert2] = useState(false);

    const handleDeleteCourse = (id) => {
        setDeleteId(id);
        setAlert(true);
    }

    const DeleteCourse = () => {
        axios({
            method: "delete",
            url: `${ALTHUB_API_URL}/api/deleteCourse/${deleteId}`,
        }).then((response) => {
            if (response.data.success === true) {
                getCoursesData();
                setDeleteId('');
                setAlert(false);
                setAlert2(true);
            }
        })
    }

    return (
        <Fragment>
            <Loader />
            <div id="page-container" className="fade page-sidebar-fixed page-header-fixed">
                <Menu />
                <div id="content" className="content">
                    <ol className="breadcrumb float-xl-right">
                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Courses</li>
                    </ol>

                    <h1 className="page-header">Courses
                        <Link to="/add-course" className="btn btn-success mx-3" ><i className="fa fa-plus"></i></Link>
                    </h1>

                    <div className="card">
                        <div className="card-body">
                            <div className="form-outline mb-4">
                                <input type="search" className="form-control" id="datatable-search-input" placeholder='Search Course' onChange={handleSearch} />
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="table-responsive">
                                        <table id="product-listing" className="table">
                                            <thead>
                                                <tr>
                                                    <th>Sr. No.</th>
                                                    <th>Name</th>
                                                    <th>Stream</th>
                                                    <th>Duration</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentCourses.length > 0 ? currentCourses.map((elem, index) =>
                                                    <tr key={elem._id || index}>
                                                        <td align='left'>{indexOfFirstCourse + index + 1}</td>
                                                        <td>{elem.name}</td>
                                                        <td>{elem.stream}</td>
                                                        <td>{elem.duration}</td>
                                                        <td>
                                                            <i
                                                                className='fa fa-edit'
                                                                style={{ color: "green", cursor: "pointer" }}
                                                                onClick={() => { navigate('/edit-course', { state: { data: elem } }) }}
                                                            />
                                                            <i
                                                                className='fa fa-trash'
                                                                style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                                                                onClick={() => { handleDeleteCourse(elem._id) }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ) : <tr><td colSpan={5}>No Record Found..</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="gt-pagination" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <ul className="pagination">
                                                {pageNumbers.map((number) => (
                                                    <li key={number} className={currentPage === number ? "page-item active" : "page-item"} aria-current={currentPage === number ? "page" : undefined}>
                                                        <button type="button" className="page-link" onClick={() => paginate(number)}>{number}</button>
                                                    </li>
                                                ))}
                                        </ul>
                                        <div className='filter-pages' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <label htmlFor='selection' style={{ marginBottom: '0' }}>Users Per Page :</label>
                                                <select
                                                    id="selection"
                                                    className='selection'
                                                    style={{ outline: '0', borderWidth: '0 0 1px', borderColor: 'black', marginLeft: '10px' }}
                                                    value={coursesPerPage}
                                                    onChange={(e) => setCoursesPerPage(Number(e.target.value))}
                                                >
                                                    {rows.map(value => (
                                                        <option key={value} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {alert === true ? <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes, delete it!"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    onConfirm={DeleteCourse}
                    onCancel={() => { setAlert(false); setDeleteId(''); }}
                >
                    You will not be able to recover this user!
                </SweetAlert> : ''
                }
                {alert2 === true ? <SweetAlert
                    success
                    title="User Deleted Successfully!"
                    onConfirm={() => { setAlert2(false); getCoursesData(); }}
                />
                    : ''}
                <Footer />
            </div>
        </Fragment>
    )
}

export default Courses