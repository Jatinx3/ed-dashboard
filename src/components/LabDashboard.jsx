import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabAuth } from '../context/LabAuthContext';
import Sidebar from './Sidebar';

const LAB_USER_DETAILS = {
  name: 'Chris P. Bacon',
  department: 'Clinical Chemistry Lab',
  employeeId: 'LAB-98765',
};

const LAB_PAGES = [
    { name: 'Sample Queue', path: '/lab/dashboard' },
    { name: 'Add Sample Data', path: '/lab/add-sample' },
    { name: 'My Profile', path: '/lab/profile' },
];

// Define the available statuses for the dropdown
const STATUSES = ['Received', 'In Progress', 'Analysis Complete', 'Results Available'];

const LabDashboard = () => {
  const { setIsAuthenticated } = useLabAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSamples = async () => {
      setLoading(true); 
      setError(null);

      try {
          const response = await fetch('http://127.0.0.1:5000/api/samples');
          
          if (!response.ok) {
              throw new Error(`Failed to fetch: Status ${response.status}`);
          }
          
          const data = await response.json();
          setSamples(data);
          
      } catch (e) {
          console.error("Connection Error:", e.message);
          setError("Cannot connect to Lab Data Server. Please ensure backend is running.");
      } finally {
          setLoading(false);
      }
  };

  // New function to update a sample's status
  const handleStatusUpdate = async (sampleID, newStatus) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleID, newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }

      // Re-fetch the data to see the real-time update
      fetchSamples();
    } catch (e) {
      console.error('Failed to update status:', e.message);
      alert(`Failed to update status: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/lab/login');
  };

  const sortedSamples = [...samples].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
            <h2>Current Sample Queue</h2>
            
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
                      <th>Action</th> {/* New column for the update action */}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSamples.length > 0 ? (
                      sortedSamples.map((sample) => (
                        <tr key={sample.sampleID}>
                          <td>{sample.sampleID}</td>
                          <td>{sample.patientName}</td>
                          <td>{sample.testType}</td>
                          <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {sample.status}
                          </td>
                          <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                          <td>
                            <select 
                              value={sample.status} 
                              onChange={(e) => handleStatusUpdate(sample.sampleID, e.target.value)}
                              className="status-select"
                            >
                              {STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No samples currently in the queue.</td>
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

export default LabDashboard;