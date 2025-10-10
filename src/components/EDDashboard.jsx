import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ED_USER_DETAILS = {
  name: 'Dr. Jane Doe',
  department: 'Emergency Department',
  employeeId: 'ED-12345',
};

const EDDashboard = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('24hours'); // '1hour', '6hours', or '24hours'

  const fetchSamples = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/samples'); // Your backend URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSamples(data);
    } catch (error) {
      console.error("Failed to fetch sample data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    return samples.filter(sample => new Date(sample.timestamp).getTime() > cutoffTime);
  };

  const filteredSamples = getFilteredSamples();

  if (loading) {
    return <p>Loading sample data...</p>;
  }

  return (
    <div className="dashboard-container">
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
        <div className="filter-controls">
          <button onClick={() => setFilter('1hour')} className={filter === '1hour' ? 'active' : ''}>1 Hour</button>
          <button onClick={() => setFilter('6hours')} className={filter === '6hours' ? 'active' : ''}>6 Hours</button>
          <button onClick={() => setFilter('24hours')} className={filter === '24hours' ? 'active' : ''}>24 Hours</button>
        </div>
        
        <div className="samples-table-container">
          <h2>Sample Status</h2>
          <table>
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.length > 0 ? (
                filteredSamples.map((sample) => (
                  <tr key={sample.sampleID}>
                    <td>{sample.sampleID}</td>
                    <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {sample.status}
                    </td>
                    <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No samples to display for this time range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EDDashboard;