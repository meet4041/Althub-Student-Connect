import axios from '../../service/axios'; 
import { ALTHUB_API_URL } from '../pages/baseURL';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// COMPANY STANDARD: Import external CSS
import '../../styles/menu.css'; 

function Menu() {
   const navigate = useNavigate();
   const location = useLocation(); 
   const [profileInfo, setProfileInfo] = useState({
      name: 'Institute',
      image: ''
   });

   const isActive = (path) => location.pathname === path ? "active" : "";

   useEffect(() => {
      const id = localStorage.getItem("AlmaPlus_institute_Id");
      if (!id) return;
      getData(id);
   }, []);

   const Logout = () => {
      localStorage.clear(); 
      navigate(`/login`, { replace: true });
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
               <Link to="/dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                  <b>Althub</b>
                  <span className="brand-badge">Institute</span>
               </Link>
            </div>
            
            <ul className="navbar-nav navbar-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
               <li className="dropdown navbar-user">
                  <a href="#" className="dropdown-toggle" data-toggle="dropdown" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
                     <img 
                        src={profileInfo.image ? `${ALTHUB_API_URL}${profileInfo.image}` : 'assets/img/profile1.png'} 
                        alt="Profile"
                     />
                     <span className="d-none d-md-inline">{profileInfo.name}</span> 
                     <b className="caret" style={{ marginLeft: '8px', color: '#94a3b8' }}></b>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right dropdown-menu-modern">
                     <Link to="/profile" className="dropdown-item py-2">
                        <i className="fa fa-user-circle mr-2 opacity-50"></i> Edit Profile
                     </Link>
                     <div className="dropdown-divider"></div>
                     <a onClick={Logout} className="dropdown-item py-2 text-danger font-weight-bold" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-sign-out-alt mr-2"></i> Log Out
                     </a>
                  </div>
               </li>
            </ul>
         </div>
         
         <div id="sidebar" className="sidebar">
            <div data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  <li className={isActive("/dashboard")}>
                     <Link to="/dashboard">
                        <i className="fa fa-columns"></i>
                        <span>Dashboard</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/users")}>
                     <Link to="/users">
                        <i className="fa fa-user-friends"></i>
                        <span>Manage Users</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/events")}>
                     <Link to="/events">
                        <i className="fa fa-calendar-alt"></i>
                        <span>Events</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/posts")}>
                     <Link to="/posts">
                        <i className="fa fa-bullhorn"></i>
                        <span>Announcements</span>
                     </Link>
                  </li>
                  
                  <li className={isActive("/financial-aid")}>
                     <Link to="/financial-aid">
                        <i className="fa fa-graduation-cap"></i>
                        <span>Scholarships</span>
                     </Link>
                  </li>

                  <li className={isActive("/feedback")}>
                     <Link to="/feedback">
                        <i className="fa fa-comment-alt"></i>
                        <span>Student Feedback</span>
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
         <div className="sidebar-bg"></div>
      </>
   )
}

export default Menu;