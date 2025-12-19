import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axios';

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
      <>
         {/* HEADER */}
         <div id="header" className="header navbar-default shadow-sm">
            <div className="navbar-header">
               <Link to="/dashboard" className="navbar-brand">
                  <img src='Logo1.png' className="rounded-sm" style={{ marginRight: '1px', height: '50px' }} alt="logo" />
                  <span className="brand-text">Admin</span>
               </Link>
            </div>

            <ul className="navbar-nav navbar-right px-3">
               <li className="dropdown navbar-user">
                  {/* ENLARGED DAU BUTTON */}
                  <button
                     className="dropdown-toggle btn btn-link d-flex align-items-center text-decoration-none"
                     data-toggle="dropdown"
                     style={{
                        color: '#333',
                        padding: '10px 15px',
                        fontSize: '18px', // Increased Font Size
                        borderRadius: '8px',
                        transition: 'background 0.3s'
                     }}
                  >
                     <span className="font-weight-bold" style={{ letterSpacing: '1px' }}>{admin?.name}</span>
                     <b className="caret ml-2" style={{ transform: 'scale(1.2)' }}></b>
                  </button>

                  <div className="dropdown-menu dropdown-menu-right border-0 shadow mt-2">
                     <div className="dropdown-header text-uppercase font-weight-bold">Account Settings</div>
                     <Link to="/profile" className="dropdown-item">
                        <i className="fa fa-user-edit mr-2"></i> Edit Profile
                     </Link>
                     <div className="dropdown-divider"></div>
                     <button onClick={Logout} className="dropdown-item text-danger border-0 bg-transparent w-100 text-left">
                        <i className="fa fa-sign-out-alt mr-2"></i> Log Out
                     </button>
                  </div>
               </li>
            </ul>
         </div>

         {/* SIDEBAR */}
         <div id="sidebar" className="sidebar">
            <div data-scrollbar="true" data-height="100%">
               <ul className="nav">
                  <li className="nav-profile border-bottom mb-2">
                     <div className="cover with-shadow"></div>
                     <div className="image">
                     </div>
                     <div className="info">
                        {admin.name}
                        <small>Administrator</small>
                     </div>
                  </li>

                  <li className="nav-header">Navigation</li>

                  <li className={isActive("/dashboard")}>
                     <Link to="/dashboard"><i className="fa fa-th-large"></i> <span>Dashboard</span></Link>
                  </li>
                  <li className={isActive("/users")}>
                     <Link to="/users"><i className="fa fa-users"></i> <span>Users</span></Link>
                  </li>
                  <li className={isActive("/institute")}>
                     <Link to="/institute"><i className="fa fa-university"></i> <span>Institutes</span></Link>
                  </li>
                  <li className={isActive("/feedback")}>
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