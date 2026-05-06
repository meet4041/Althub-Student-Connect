import { useAuth } from '../auth/session';
import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/client';

import '../styles/menu.css';

function Menu() {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const admin_Id = (user?._id);
   const normalizeAdminName = (name) => {
      if (!name || name === 'Althub Admin') return 'Althub Super Admin';
      return name;
   };

   const [admin, setAdmin] = useState({
      name: normalizeAdminName((user?.name || '')),
      profilepic: (user?.profilepic || '') || ''
   });

   const clearAdminSession = () => {
      logout();
   };

   const Logout = async () => {
      try {
         await axiosInstance.get('/api/v1/adminLogout');
      } catch (err) {
         console.error("Logout error", err);
      } finally {
         clearAdminSession();
      }
   }

   const getData = useCallback(() => {
      if (!admin_Id) return;
      axiosInstance.get(`/api/v1/getAdminById/${admin_Id}`).then((response) => {
         const raw = response.data?.data;
         const adminData = Array.isArray(raw) ? raw[0] : raw;

         if (response.data.success === true && adminData) {
            const adminName = normalizeAdminName(adminData.name);
            setAdmin({
               name: adminName,
               profilepic: adminData.profilepic || '',
            });
         }
      }).catch(err => console.error(err));
   }, [admin_Id]);

   useEffect(() => {
      if (!admin_Id) navigate('/login', { replace: true });
      else getData();
   }, [getData, admin_Id, navigate]);

   const isActive = (path) => location.pathname === path ? "active" : "";

   return (
      <Fragment>
         <header className="admin-header">
            <Link to="/dashboard" className="admin-logo-link">
               <span className="admin-brand-name">Althub super admin</span>
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

               <li className="admin-nav-item">
                  <Link to="/placement-cell" className={`admin-nav-link ${isActive("/placement-cell")}`}>
                     <i className="fa fa-briefcase"></i> <span>All Placement Cells</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/alumni-office" className={`admin-nav-link ${isActive("/alumni-office")}`}>
                     <i className="fa fa-graduation-cap"></i> <span>All Alumni Offices</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/connected" className={`admin-nav-link ${isActive("/connected")}`}>
                     <i className="fa fa-project-diagram"></i> <span>Connected</span>
                  </Link>
               </li>

               <li className="admin-nav-item">
                  <Link to="/announcement" className={`admin-nav-link ${isActive("/announcement")}`}>
                     <i className="fa fa-bullhorn"></i> <span>Announcement</span>
                  </Link>
               </li>

            </ul>
         </aside>
      </Fragment>
   )
}

export default Menu;
