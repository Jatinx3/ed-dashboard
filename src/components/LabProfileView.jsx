import React from 'react';
import Profile from './Profile';
import Sidebar from './Sidebar';
import { useLabAuth } from '../context/LabAuthContext';
import { useNavigate } from 'react-router-dom';

const LAB_USER_DETAILS = {
  name: 'Sammy Sample',
  department: 'Clinical Chemistry',
  employeeId: 'LAB-54321',
  contact: 'sammy.sample@lab.com',
};

// Lab Dashboard navigation items for the sidebar
const LAB_PAGES = [
    { name: 'Home (Sample List)', path: '/lab/dashboard' },
    { name: 'Add Sample Data', path: '/lab/add-sample' },
    { name: 'My Profile', path: '/lab/profile' },
];

const LabProfileView = () => {
  const { setIsAuthenticated } = useLabAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/lab/login');
  };
  
  return (
    <div className="dashboard-layout">
        <Sidebar userType="LAB" pages={LAB_PAGES} handleLogout={handleLogout} />
        <div className="dashboard-content">
            <header className="dashboard-header lab-header">
                <h1>Lab Dashboard</h1>
                <div className="profile-section">
                    <div className="user-info">
                        <span className="user-name">Welcome, {LAB_USER_DETAILS.name}</span>
                        <span className="user-id">ID: {LAB_USER_DETAILS.employeeId}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">Log Out</button>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="profile-view-container">
                  <Profile userDetails={LAB_USER_DETAILS} userType="Lab Technician" />
                </div>
            </main>
        </div>
    </div>
  );
};

export default LabProfileView;