import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../services/axios';

// IMPORT NEW STYLES
import '../styles/menu.css';

function Menu() {
   const navigate = useNavigate();
   const location = useLocation();
   const admin_Id = localStorage.getItem("AlmaPlus_admin_Id");

   const [admin, setAdmin] = useState({
      name: localStorage.getItem('AlmaPlus_admin_Name') || 'Admin',
      profilepic: localStorage.getItem('AlmaPlus_admin_Pic') || ''
   });

   const Logout = async () => {
      try {
         await axiosInstance.get('/api/adminLogout');
      } catch (err) {
         console.error("Logout error", err);
      } finally {
         localStorage.clear();
         navigate(`/`);
      }
   }

   const getData = useCallback(() => {
      if (!admin_Id) return;
      axiosInstance.get(`/api/getAdminById/${admin_Id}`).then((response) => {
         if (response.data.success === true && response.data.data?.[0]) {
            const adminData = response.data.data[0];
            setAdmin({
               name: adminData.name,
               profilepic: adminData.profilepic,
            });
            localStorage.setItem('AlmaPlus_admin_Name', adminData.name);
            localStorage.setItem('AlmaPlus_admin_Pic', adminData.profilepic);
         }
      }).catch(err => console.error(err));
   }, [admin_Id]);

   useEffect(() => {
      if (!admin_Id) navigate(`/`);
      else getData();
   }, [getData, admin_Id, navigate]);

   const isActive = (path) => location.pathname === path ? "active" : "";

   return (
      <Fragment>
         {/* MODERN HEADER */}
         <header className="admin-header">
            <Link to="/dashboard" className="admin-logo-link">
               {/* <img src='Logo1.png' className="admin-logo-img" alt="logo" /> */}
               <span className="admin-brand-name">Althub Admin</span>
            </Link>

            <div className="dropdown">
               <button
                  className="user-dropdown-btn dropdown-toggle border-0"
                  data-toggle="dropdown"
                  aria-haspopup="true" 
                  aria-expanded="false"
               >
                  <span className="user-name-label">{admin?.name}</span>
                  <i className="fa fa-chevron-down small ml-2 text-muted"></i>
               </button>

               <div className="dropdown-menu dropdown-menu-right border-0 shadow-lg mt-2">
                  <div className="dropdown-header text-uppercase small font-weight-bold">Account Settings</div>
                  <Link to="/profile" className="dropdown-item">
                     <i className="fa fa-user-edit mr-2 text-primary"></i> Edit Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={Logout} className="dropdown-item text-danger border-0 bg-transparent w-100 text-left">
                     <i className="fa fa-sign-out-alt mr-2"></i> Log Out
                  </button>
               </div>
            </div>
         </header>

         {/* MODERN SIDEBAR */}
         <aside className="admin-sidebar">
            <div className="sidebar-profile">
               <span className="profile-name">{admin.name}</span>
               <span className="profile-role">Administrator</span>
            </div>

            <div className="nav-header-text">Main Navigation</div>

            <ul className="admin-nav-list">
               <li className="admin-nav-item">
                  <Link to="/dashboard" className={`admin-nav-link ${isActive("/dashboard")}`}>
                     <i className="fa fa-th-large"></i> <span>Dashboard</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/institute" className={`admin-nav-link ${isActive("/institute")}`}>
                     <i className="fa fa-university"></i> <span>All Institutes</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/users" className={`admin-nav-link ${isActive("/users")}`}>
                     <i className="fa fa-users"></i> <span>All Users</span>
                  </Link>
               </li>

               {/* NEW: PLACEMENT CELL BUTTON */}
               <li className="admin-nav-item">
                  <Link to="/placement-cell" className={`admin-nav-link ${isActive("/placement-cell")}`}>
                     <i className="fa fa-briefcase"></i> <span>All Placement Cells</span>
                  </Link>
               </li>

               {/* NEW: ALUMNI OFFICE BUTTON */}
               <li className="admin-nav-item">
                  <Link to="/alumni-office" className={`admin-nav-link ${isActive("/alumni-office")}`}>
                     <i className="fa fa-graduation-cap"></i> <span>All Alumni Offices</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/feedback" className={`admin-nav-link ${isActive("/feedback")}`}>
                     <i className="fa fa-comments"></i> <span>Feedback</span>
                  </Link>
               </li>
            </ul>
         </aside>
      </Fragment>
   )
}

export default Menu;
