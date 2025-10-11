import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const ED_USER_DETAILS = {
  name: 'Dr. Jane Doe',
  department: 'Emergency Department',
  employeeId: 'ED-12345',
};

const ED_PAGES = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Profile', path: '/dashboard/profile' },
];

const EDDashboard = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [filter, setFilter] = useState('24hours');

  const fetchSamples = async () => {
      setLoading(true); 
      setError(null);

      try {
          // Fetching live data from the Flask backend
          const response = await fetch('http://127.0.0.1:5000/api/samples');
          
          if (!response.ok) {
              throw new Error(`Failed to fetch: Status ${response.status}`);
          }
          
          const data = await response.json();
          setSamples(data);
          
      } catch (e) {
          // Display error if server is down or unreachable
          console.error("Connection Error:", e.message);
          setError("Cannot connect to Lab Data Server. Please ensure backend is running.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    // Initial fetch and setting up the 5-second polling interval
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 5000);
    return () => clearInterval(intervalId);
  }, []); 

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  const getFilteredSamples = () => {
    const now = new Date();
    const filterHours = {
      '1hour': 1,
      '6hours': 6,
      '24hours': 24,
    };
    const cutoffTime = now.getTime() - (filterHours[filter] * 60 * 60 * 1000);

    const sortedSamples = [...samples].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return sortedSamples.filter(sample => new Date(sample.timestamp).getTime() > cutoffTime);
  };

  const filteredSamples = getFilteredSamples();

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
              <button onClick={handleLogout} className="logout-button">Log Out</button>
            </div>
          </header>
          
          <main className="dashboard-main">
            <h2>Sample Status Overview</h2>
            <div className="filter-controls">
              <button onClick={() => setFilter('1hour')} className={filter === '1hour' ? 'active' : ''}>Last 1 Hour</button>
              <button onClick={() => setFilter('6hours')} className={filter === '6hours' ? 'active' : ''}>Last 6 Hours</button>
              <button onClick={() => setFilter('24hours')} className={filter === '24hours' ? 'active' : ''}>Last 24 Hours</button>
            </div>
            
            <div className="samples-table-container">
              {error && (
                <div style={{ padding: '15px', backgroundColor: '#fdd', border: '1px solid red', borderRadius: '5px', marginBottom: '15px' }}>
                  <strong>Connection Error:</strong> {error}
                </div>
              )}

              {loading && !error ? (
                <p>Loading samples...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Patient Name</th>
                      <th>Test Requested</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSamples.length > 0 ? (
                      filteredSamples.map((sample) => (
                        <tr key={sample.sampleID}>
                          <td>{sample.sampleID}</td>
                          <td>{sample.patientName}</td>
                          <td>{sample.testType}</td>
                          {/* Status column changes color based on the live status */}
                          <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {sample.status}
                          </td>
                          <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No samples to display for this time range.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
    </div>
  );
};

export default EDDashboard;
