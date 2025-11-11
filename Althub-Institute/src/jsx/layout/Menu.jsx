/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import axios from 'axios';
import { ALTHUB_API_URL } from '../pages/baseURL';

function Menu() {
   const navigate = useNavigate();
   const [institute_Id, setInstitute_Id] = useState(null);
   const [dashboardClass, setDashboardClass] = useState("");
   const [usersClass, setUsersClass] = useState("");
   const [coursesClass, setCoursesClass] = useState("");
   const [eventsClass, setEventsClass] = useState("");
   const [postsClass, setPostsClass] = useState("");
   const [aidClass, setAidClass] = useState("");

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const id = localStorage.getItem("AlmaPlus_institute_Id");
         if (id == null) {
            toast.error("Please login first...!");
            navigate(`/`);
            return;
         }
         setInstitute_Id(id);
         
         // Set active class based on current pathname
         const pathname = window.location.pathname;
         setDashboardClass(pathname.match(/^\/dashboard/) ? "active" : "");
         setUsersClass(pathname.match(/^\/users/) ? "active" : "");
         setCoursesClass(pathname.match(/^\/courses/) ? "active" : "");
         setEventsClass(pathname.match(/^\/events/) ? "active" : "");
         setPostsClass(pathname.match(/^\/posts/) ? "active" : "");
         setAidClass(pathname.match(/^\/financial-aid/) ? "active" : "");
      }
   }, [navigate]);

   const Logout = () => {
      if (typeof window !== 'undefined') {
         localStorage.removeItem('AlmaPlus_institute_Id');
      }
      navigate(`/`);
   }
   const [profileInfo, setProfileInfo] = useState({
      name: '',
      image: ''
   });

   const getData = () => {
      if (institute_Id) {
         const myurl = `${ALTHUB_API_URL}/api/getInstituteById/${institute_Id}`;
         axios({
            method: "get",
            url: myurl,
         }).then((response) => {
            if (response.data.success === true) {
               setProfileInfo({
                  name: response.data.data.name,
                  image: response.data.data.image
               })
            }
         });
      }
   };
   useEffect(() => getData(), [institute_Id])

   return (
      <>
         <div id="header" className="header navbar-default">
            <div className="navbar-header">
               <Link to="/dashboard" className="navbar-brand">
                  <img src='Logo1.jpeg' style={{ marginRight: '5px' , width:"1000px"}} alt="logo" />
                  <b>Institute</b></Link>
            </div>
            <ul className="navbar-nav navbar-right">
               <li className="dropdown navbar-user">
                  <a className="dropdown-toggle" data-toggle="dropdown">
                     <img src={`${ALTHUB_API_URL}${profileInfo.image}`} alt="" />
                     <span className="d-none d-md-inline">{profileInfo.name}</span> <b className="caret"></b>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                     <Link to="/profile" className="dropdown-item">Edit Profile</Link>
                     <a onClick={Logout} className="dropdown-item">Log Out</a>
                  </div>
               </li>
            </ul>
         </div>
         <div id="sidebar" className="sidebar">
            <div data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  <li className={dashboardClass}>
                     <Link to="/dashboard" >
                        <i className="fa fa-th-large"></i>
                        <span>Dashboard</span>
                     </Link>
                  </li>
                  <li className={usersClass}>
                     <Link to="/users" >
                        <i className="fa fa-users"></i>
                        <span>Users</span>
                     </Link>
                  </li>
                  <li className={coursesClass}>
                     <Link to="/courses" >
                        <i className="fa fa-graduation-cap"></i>
                        <span>Courses</span>
                     </Link>
                  </li>
                  <li className={eventsClass}>
                     <Link to="/events" >
                        <i className="fa fa-calendar"></i>
                        <span>Events</span>
                     </Link>
                  </li>
                  <li className={postsClass}>
                     <Link to="/posts" >
                        <i className="fa fa-address-card"></i>
                        <span>Post</span>
                     </Link>
                  </li>
                  <li className={aidClass}>
                     <Link to="/financial-aid" >
                        <i className="fa-solid fa-sack-dollar"></i>
                        <span>Financial Aid</span>
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
         <div className="sidebar-bg"></div>
      </>
   )
}

export default Menu