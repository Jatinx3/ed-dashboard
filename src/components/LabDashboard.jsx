import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { useLabAuth } from '../context/LabAuthContext';

const LAB_USER_DETAILS = {
  name: 'Sammy Sample',
  department: 'Clinical Chemistry',
  employeeId: 'LAB-54321',
};

// Sidebar links for Lab Dashboard
const LAB_PAGES = [
  { name: 'Home (Sample List)', path: '/lab/dashboard' },
  { name: 'Add Sample Data', path: '/lab/add-sample' },
  { name: 'My Profile', path: '/lab/profile' },
];

const LabDashboard = () => {
  const { setIsLabAuthenticated } = useLabAuth(); // Required for Logout function in Sidebar
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSamples = async () => {
    try {
      // Fetching all samples from the Flask backend
      const response = await fetch('http://localhost:5000/api/samples');
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      
      // Sort samples by timestamp descending (newest first)
      setSamples(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error("Failed to fetch sample data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
    // Set up polling for near real-time updates (every 5 seconds)
    const intervalId = setInterval(fetchSamples, 5000); 
    return () => clearInterval(intervalId); // Cleanup
  }, []);

  if (loading) {
    return (
        <div className="dashboard-layout">
            <Sidebar userType="LAB" pages={LAB_PAGES} />
            <div className="dashboard-content">
                <p style={{ padding: '20px' }}>Loading lab data...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar handles navigation and logout */}
      <Sidebar userType="LAB" pages={LAB_PAGES} />
      
      <div className="dashboard-content">
        <header className="dashboard-header lab-header">
          <h1>Lab Sample Overview</h1>
          <div className="profile-section">
            <div className="user-info">
              <span className="user-name">Welcome, {LAB_USER_DETAILS.name}</span>
              <span className="user-id">Dept: {LAB_USER_DETAILS.department}</span>
            </div>
          </div>
        </header>
        
        <main className="dashboard-main lab-main">
          <div className="samples-table-container lab-table">
            <h2>All Samples in Queue ({samples.length} total)</h2>
            <table>
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Test Requested</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Time Received</th>
                </tr>
              </thead>
              <tbody>
                {samples.length > 0 ? (
                  samples.map((sample) => (
                    <tr key={sample.sampleID}>
                      <td>{sample.sampleID}</td>
                      <td>{sample.patientID || 'N/A'}</td>
                      <td>{sample.patientName || 'N/A'}</td>
                      <td>{sample.testType || 'N/A'}</td>
                      <td>{sample.source || 'ED'}</td>
                      <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {sample.status}
                      </td>
                      <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No samples currently in the queue. Add data using the sidebar link.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabDashboard;
