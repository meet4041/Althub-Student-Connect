import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axios'; 
import { ALTHUB_API_URL } from '../../baseURL';

function Menu() {
   const navigate = useNavigate();
   const admin_Id = localStorage.getItem("AlmaPlus_admin_Id");

   // FIX: Initialize state with localStorage to prevent "undefined" crash on page switch
   const [admin, setAdmin] = useState({
      name: localStorage.getItem('AlmaPlus_admin_Name') || 'Admin',
      profilepic: localStorage.getItem('AlmaPlus_admin_Pic') || ''
   });

   const Logout = () => {
      localStorage.removeItem('AlmaPlus_admin_Id');
      localStorage.removeItem('AlmaPlus_admin_Email');
      localStorage.removeItem('AlmaPlus_admin_Name');
      localStorage.removeItem('AlmaPlus_admin_Pic');
      localStorage.removeItem('AlmaPlus_admin_Token');
      navigate(`/`);
   }

   const getData = useCallback(() => {
      if (!admin_Id) return;
      
      const myurl = `/api/getAdminById/${admin_Id}`;
      axiosInstance.get(myurl).then((response) => {
         // FIX: Use optional chaining (?.[0]) to safely check if data array has elements
         if (response.data.success === true && response.data.data?.[0]) {
            const adminData = response.data.data[0];
            setAdmin({
               name: adminData.name,
               profilepic: adminData.profilepic,
            });
            // Sync localStorage in case name was updated in database
            localStorage.setItem('AlmaPlus_admin_Name', adminData.name);
            localStorage.setItem('AlmaPlus_admin_Pic', adminData.profilepic);
         }
      }).catch((err) => {
         console.error("Error fetching admin profile:", err);
      });
   }, [admin_Id]);
   
   useEffect(() => {
      if (!admin_Id) {
         navigate(`/`);
      } else {
         getData();
      }
   }, [getData, admin_Id, navigate]);
   
   useEffect(() => {
      var element = document.getElementById("page-container");
      if (element) element.classList.add("show");
   }, []);

   const path = window.location.pathname;
   const dashboardClass = path === "/dashboard" ? "active" : "";
   const usersClass = path === "/users" ? "active" : "";
   const instituteClass = path === "/institute" ? "active" : "";
   const feedbackClass = path === "/feedback" ? "active" : "";

   return (
      <>
         <div id="header" className="header navbar-default">
            <div className="navbar-header">
               <Link to="/dashboard" className="navbar-brand">
                  <img src='Logo1.png' style={{ marginRight: '6px' }} alt="logo" />
                  <b>Admin</b>
               </Link>
            </div>
            <ul className="navbar-nav navbar-right">
               <li className="dropdown navbar-user">
                  {/* FIX: The ?. ensures that if admin is null, the app doesn't crash */}
                  <button className="dropdown-toggle btn btn-link" data-toggle="dropdown">
                     <span className="d-none d-md-inline">{admin?.name || 'Admin'}</span> <b className="caret"></b>
                  </button>
                  <div className="dropdown-menu dropdown-menu-right">
                     <Link to="/profile" className="dropdown-item">Edit Profile</Link>
                     <button onClick={Logout} className="dropdown-item btn btn-link">Log Out</button>
                  </div>
               </li>
            </ul>
         </div>
         <div id="sidebar" className="sidebar">
            <div data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  <li className={dashboardClass}>
                     <Link to="/dashboard"><i className="fa fa-th-large"></i> <span>Dashboard</span></Link>
                  </li>
                  <li className={usersClass}>
                     <Link to="/users"><i className="fa fa-users"></i> <span>Users</span></Link>
                  </li>
                  <li className={instituteClass}>
                     <Link to="/institute"><i className="fa fa-university"></i> <span>Institutes</span></Link>
                  </li>
                  <li className={feedbackClass}>
                     <Link to="/feedback"><i className="fa fa-comments"></i> <span>Feedback</span></Link>
                  </li>
               </ul>
            </div>
         </div>
         <div className="sidebar-bg"></div>
      </>
   )
}

export default Menu;