
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLabAuth } from '../context/LabAuthContext';

/**
 * Reusable Profile Component
 * Displays user details in a clean card format.
 * @param {object} props
 * @param {object} props.userDetails - Contains name, department, and employeeId.
 * @param {string} props.userType - 'ED' or 'LAB' to determine the logout function.
 */
const Profile = ({ userDetails, userType }) => {
  const navigate = useNavigate();
  // Get both auth contexts, we only use the one that matches the userType for logout
  const { setIsAuthenticated } = useAuth(); 
  const { setIsLabAuthenticated } = useLabAuth();

  const handleLogout = () => {
    if (userType === 'ED') {
      setIsAuthenticated(false);
      navigate('/login');
    } else if (userType === 'LAB') {
      setIsLabAuthenticated(false);
      navigate('/lab/login');
    }
  };

  return (
    <div className="profile-container-view">
      <div className="profile-card">
        <h2 className="profile-title">{userType} Profile Overview</h2>
        
        <div className="profile-detail-group">
          <p className="detail-label">Name:</p>
          <p className="detail-value">{userDetails.name}</p>
        </div>

        <div className="profile-detail-group">
          <p className="detail-label">Department:</p>
          <p className="detail-value">{userDetails.department}</p>
        </div>

        <div className="profile-detail-group">
          <p className="detail-label">Employee ID:</p>
          <p className="detail-value">{userDetails.employeeId}</p>
        </div>
        
        <button onClick={handleLogout} className="profile-logout-button">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
