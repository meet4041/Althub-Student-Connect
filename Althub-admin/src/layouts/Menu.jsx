/* eslint-disable no-unused-vars, jsx-a11y/anchor-is-valid */
import axios from '../service/axios'; 
import { ALTHUB_API_URL } from '../pages/baseURL';
import { getImageUrl, getImageOnError, FALLBACK_IMAGES } from '../utils/imageUtils';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// COMPANY STANDARD: Import external CSS
import '../styles/menu.css'; 

function Menu() {
   const navigate = useNavigate();
   const location = useLocation(); 
   const userRole = localStorage.getItem('userRole');
   const [profileInfo, setProfileInfo] = useState({
      name: 'DAU',
      image: ''
   });

   const isActive = (path) => location.pathname === path ? "active" : "";
   const isOfficeActive = (path) => location.pathname.startsWith(path) ? "active" : "";
   const isOfficeRoute = location.pathname.startsWith("/alumni-office") || location.pathname.startsWith("/placement-office");
   const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
   const isAlumniOffice = userRole === 'alumni_office';
   const isPlacementOffice = userRole === 'placement_cell';

   useEffect(() => {
      const id = localStorage.getItem("AlmaPlus_institute_Id");
      if (!id) return;
      getData(id);
   }, []);

   useEffect(() => {
      if (isOfficeRoute) {
         setOfficeDropdownOpen(true);
      }
   }, [location.pathname, isOfficeRoute]);

   const Logout = async () => {
      try {
         await axios.get('/api/instituteLogout');
      } catch (err) {
         console.error("Logout error", err);
      } finally {
         localStorage.removeItem('userDetails');
         localStorage.removeItem('userRole');
         localStorage.removeItem('AlmaPlus_institute_Id');
         localStorage.removeItem('AlmaPlus_institute_Name');
         localStorage.removeItem('token');
         localStorage.removeItem('althub_remembered_email');
         localStorage.removeItem('althub_remember_me_status');
         navigate('/login', { replace: true });
      }
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
               <Link to="/dashboard" className="navbar-brand navbar-brand-link">
                  <b>Althub</b>
                  <span className="brand-badge">{profileInfo.name}</span>
               </Link>
            </div>
            
            <ul className="navbar-nav navbar-right navbar-right-group">
               <li className="dropdown navbar-user">
                  <a href="#" className="dropdown-toggle navbar-user-link" data-toggle="dropdown" onClick={(e) => e.preventDefault()}>
                     <img 
                        src={getImageUrl(profileInfo.image, FALLBACK_IMAGES.profile)} 
                        alt="Profile"
                        onError={getImageOnError(FALLBACK_IMAGES.profile)}
                     />
                     <span className="d-none d-md-inline">{profileInfo.name}</span> 
                     <b className="caret navbar-caret"></b>
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
            <div className="sidebar-scroll" data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  {isAlumniOffice ? (
                     <>
                        <li className={isActive("/alumni-members")}>
                           <Link to="/alumni-members">
                              <i className="fa fa-user-friends"></i>
                              <span>Alumni Members</span>
                           </Link>
                        </li>
                        <li className={isActive("/alumni-events")}>
                           <Link to="/alumni-events">
                              <i className="fa fa-calendar-alt"></i>
                              <span>Alumni Events</span>
                           </Link>
                        </li>
                        <li className={isActive("/alumni-posts")}>
                           <Link to="/alumni-posts">
                              <i className="fa fa-bullhorn"></i>
                              <span>Alumni Posts</span>
                           </Link>
                        </li>
                     </>
                  ) : isPlacementOffice ? (
                     <>
                        <li className={isActive("/placement-events")}>
                           <Link to="/placement-events">
                              <i className="fa fa-calendar-alt"></i>
                              <span>Placement Events</span>
                           </Link>
                        </li>
                        <li className={isActive("/placement-posts")}>
                           <Link to="/placement-posts">
                              <i className="fa fa-bullhorn"></i>
                              <span>Placement Posts</span>
                           </Link>
                        </li>
                     </>
                  ) : (
                     <>
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
                              <span>Post</span>
                           </Link>
                        </li>
                        

                        {/* --- NEW LEADERBOARD LINK --- */}
                        <li className={isActive("/leaderboard")}>
                           <Link to="/leaderboard">
                              <i className="fa fa-trophy text-warning"></i>
                              <span>Leaderboard</span>
                           </Link>
                        </li>

                        {/* --- OFFICES DROPDOWN --- */}
                        <li
                           className={`nav-dropdown ${(isOfficeActive("/alumni-office") || isOfficeActive("/placement-office")) ? "active" : ""} ${officeDropdownOpen ? "open" : ""}`}
                           onMouseEnter={() => setOfficeDropdownOpen(true)}
                           onMouseLeave={() => setOfficeDropdownOpen(isOfficeRoute)}
                        >
                           <a href="#" onClick={(e) => { e.preventDefault(); setOfficeDropdownOpen(!officeDropdownOpen); }}>
                              <i className="fa fa-building"></i>
                              <span>Offices</span>
                              <b className="caret navbar-caret"></b>
                           </a>
                           <ul className={`nav-dropdown-submenu ${officeDropdownOpen ? "open" : ""}`}>
                              <li>
                                 <Link to="/alumni-office" className={isOfficeActive("/alumni-office")} onClick={() => setOfficeDropdownOpen(false)}>
                                    <i className="fa fa-graduation-cap"></i>
                                    <span>Alumni Office</span>
                                 </Link>
                              </li>
                              <li>
                                 <Link to="/placement-office" className={isOfficeActive("/placement-office")} onClick={() => setOfficeDropdownOpen(false)}>
                                    <i className="fa fa-briefcase"></i>
                                    <span>Placement Office</span>
                                 </Link>
                              </li>
                           </ul>
                        </li>

                        <li className={isActive("/feedback")}>
                           <Link to="/feedback">
                              <i className="fa fa-comment-alt"></i>
                              <span>Student Feedback</span>
                           </Link>
                        </li>
                     </>
                  )}
               </ul>
            </div>
         </div>
         <div className="sidebar-bg"></div>
      </>
   )
}

export default Menu;
