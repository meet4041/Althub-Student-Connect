/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from '../../service/axios'; 
import { ALTHUB_API_URL } from '../pages/baseURL';

function Menu() {
   const navigate = useNavigate();
   const location = useLocation(); // Use standard hook for cleaner URL checking
   const [profileInfo, setProfileInfo] = useState({
      name: 'Institute',
      image: ''
   });

   // Simplified class calculation based on current path
   const isActive = (path) => location.pathname.includes(path) ? "active" : "";

   useEffect(() => {
      const id = localStorage.getItem("AlmaPlus_institute_Id");
      if (!id) return;
      getData(id);
   }, [navigate]);

   const Logout = () => {
      localStorage.clear(); 
      navigate(`/login`);
   }

   const getData = (id) => {
      if (id) {
         axios.get(`/api/getInstituteById/${id}`)
         .then((response) => {
            if (response.data.success === true) {
               setProfileInfo({
                  name: response.data.data.name,
                  image: response.data.data.image
               })
            }
         })
         .catch(err => console.error("Menu fetch error", err));
      }
   };

   return (
      <>
         <div id="header" className="header navbar-default">
            <div className="navbar-header">
               <Link to="/dashboard" className="navbar-brand">
                  {/* Ensure logo fits the blue/white theme */}
                  <img src='Logo1.jpeg' style={{ marginRight: '10px' , width:"30px", borderRadius: "4px"}} alt="logo" />
                  <b>Institute</b>
               </Link>
               <button type="button" className="navbar-toggle" data-click="sidebar-toggled">
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
               </button>
            </div>
            
            <ul className="navbar-nav navbar-right">
               <li className="dropdown navbar-user">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" style={{cursor: 'pointer'}}>
                     <img 
                        src={profileInfo.image ? `${ALTHUB_API_URL}${profileInfo.image}` : 'assets/img/profile1.png'} 
                        alt="Profile"
                        style={{objectFit: 'cover'}} 
                     />
                     <span className="d-none d-md-inline" style={{color: '#333'}}>{profileInfo.name}</span> <b className="caret"></b>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                     <Link to="/profile" className="dropdown-item">Edit Profile</Link>
                     <div className="dropdown-divider"></div>
                     <a onClick={Logout} className="dropdown-item" style={{cursor: 'pointer'}}>Log Out</a>
                  </div>
               </li>
            </ul>
         </div>
         
         <div id="sidebar" className="sidebar">
            <div data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  
                  <li className={isActive("/dashboard")}>
                     <Link to="/dashboard">
                        <i className="fa fa-th-large"></i>
                        <span>Dashboard</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/users")}>
                     <Link to="/users">
                        <i className="fa fa-users"></i>
                        <span>Users</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/events")}>
                     <Link to="/events">
                        <i className="fa fa-calendar"></i>
                        <span>Events</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/posts")}>
                     <Link to="/posts">
                        <i className="fa fa-address-card"></i>
                        <span>Post</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/financial-aid")}>
                     <Link to="/financial-aid">
                        <i className="fa-solid fa-sack-dollar"></i>
                        <span>Scholarship</span>
                     </Link>
                  </li>

                  {/* Removed 'text-success' so it follows the blue theme active state */}
                  <li className={isActive("/feedback")}>
                     <Link to="/feedback">
                        <i className="fa fa-comment-dots"></i>
                        <span>Student Feedback</span>
                     </Link>
                  </li>
                  
                  <li>
                     <a href="javascript:;" className="sidebar-minify-btn" data-click="sidebar-minify">
                        <i className="fa fa-angle-double-left"></i>
                     </a>
                  </li>
               </ul>
            </div>
         </div>
         <div className="sidebar-bg"></div>
      </>
   )
}

export default Menu;