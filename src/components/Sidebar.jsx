// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useLabAuth } from '../context/LabAuthContext';

// const Sidebar = ({ userType, pages }) => {
//   const { setIsAuthenticated } = useAuth();
//   const { setIsLabAuthenticated } = useLabAuth();
//   const navigate = useNavigate();
  
//   const handleLogout = () => {
//     if (userType === 'ED') {
//       setIsAuthenticated(false);
//       navigate('/login');
//     } else if (userType === 'LAB') {
//       setIsLabAuthenticated(false);
//       navigate('/lab/login');
//     }
//   };

//   return (
//     <div className="sidebar">
//       <h3 className="sidebar-title">{userType === 'ED' ? 'ED Tools' : 'Lab Tools'}</h3>
//       <nav className="sidebar-nav">
//         {pages.map((page) => (
//           <NavLink
//             key={page.path}
//             to={page.path}
//             className={({ isActive }) => 
//               "nav-item" + (isActive ? " active" : "")
//             }
//           >
//             {page.name}
//           </NavLink>
//         ))}
//       </nav>
//       <button onClick={handleLogout} className="sidebar-logout">
//         Log Out
//       </button>
//     </div>
//   );
// };

// export default Sidebar;
import React from 'react';
import { NavLink } from 'react-router-dom'; // <-- This import was missing!

const Sidebar = ({ userType, pages, handleLogout }) => {
  return (
    <div className="sidebar-container">
      <h2 className="sidebar-title">{userType === 'ED' ? 'ED Tools' : 'Lab Tools'}</h2>
      <nav className="sidebar-nav">
        {pages.map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            className={({ isActive }) => "sidebar-nav-item" + (isActive ? " active" : "")}
          >
            {page.name}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="sidebar-logout-button">
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;