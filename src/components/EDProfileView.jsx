import React from 'react';
import Profile from './Profile';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ED_USER_DETAILS = {
  name: 'Dr. Jane Doe',
  department: 'Emergency Department',
  employeeId: 'ED-12345',
  contact: 'jane.doe@hospital.com',
};

// ED Dashboard navigation items for the sidebar
const ED_PAGES = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Profile', path: '/dashboard/profile' },
];

const EDProfileView = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  return (
    <div className="dashboard-layout">
        <Sidebar userType="ED" pages={ED_PAGES} handleLogout={handleLogout} />
        <div className="dashboard-content">
            <header className="dashboard-header">
                <h1>ED Dashboard</h1>
                <div className="profile-section">
                    <div className="user-info">
                        <span className="user-name">Welcome, {ED_USER_DETAILS.name}</span>
                        <span className="user-id">ID: {ED_USER_DETAILS.employeeId}</span>
                    </div>
                    {/* <button onClick={handleLogout} className="logout-button">Log Out</button> */}
                </div>
            </header>
            <main className="dashboard-main">
                <div className="profile-view-container">
                  <Profile userDetails={ED_USER_DETAILS} userType="ED Staff" />
                </div>
            </main>
        </div>
    </div>
  );
};

export default EDProfileView;