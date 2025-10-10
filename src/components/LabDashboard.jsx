import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabAuth } from '../context/LabAuthContext';

const LAB_USER_DETAILS = {
  name: 'Sammy Sample',
  department: 'Clinical Chemistry',
  employeeId: 'LAB-54321',
};

const LabDashboard = () => {
  const { setIsLabAuthenticated } = useLabAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');

  // Form State for Status Update
  const [sampleID, setSampleID] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');

  const SAMPLE_STATUSES = ['Received', 'In Progress', 'Analysis Complete', 'Results Available'];

  const fetchSamples = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/samples');
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      // Sort samples so the oldest are at the top (or newest, depending on preference)
      setSamples(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (error) {
      console.error("Failed to fetch sample data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdateMessage('Updating status...');

    try {
      const response = await fetch('http://localhost:5000/api/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sampleID, newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        setUpdateMessage(`Success: ${result.message}`);
        fetchSamples(); // Refresh table data after successful update
      } else {
        setUpdateMessage(`Error: ${result.error || 'Update failed.'}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setUpdateMessage('Network error occurred during update.');
    }
    setTimeout(() => setUpdateMessage(''), 3000); // Clear message after 3 seconds
  };


  useEffect(() => {
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 5000); // Keep polling to show real-time changes
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    setIsLabAuthenticated(false);
    navigate('/lab/login');
  };

  if (loading) {
    return <p>Loading lab data...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header lab-header">
        <h1>Lab Sample Entry Dashboard</h1>
        <div className="profile-section">
          <div className="user-info">
            <span className="user-name">Welcome, {LAB_USER_DETAILS.name}</span>
            <span className="user-id">Dept: {LAB_USER_DETAILS.department}</span>
          </div>
          <button onClick={handleLogout} className="logout-button lab-logout-button">Log Out</button>
        </div>
      </header>
      
      <main className="dashboard-main lab-main">
        <div className="status-update-form-card">
          <h3>Update Sample Status</h3>
          <form onSubmit={handleUpdateStatus} className="status-form">
            <div className="form-group">
              <label htmlFor="sampleID">Sample ID to Update:</label>
              <input
                type="text"
                id="sampleID"
                value={sampleID}
                onChange={(e) => setSampleID(e.target.value)}
                placeholder="e.g., ED-001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newStatus">New Status:</label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {SAMPLE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="update-button">Update Status</button>
            {updateMessage && <p className={`update-message ${updateMessage.startsWith('Error') ? 'error' : 'success'}`}>{updateMessage}</p>}
          </form>
        </div>

        <div className="samples-table-container lab-table">
          <h2>All ED Samples</h2>
          <table>
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Status</th>
                <th>Patient ID</th>
                <th>Time In Lab</th>
              </tr>
            </thead>
            <tbody>
              {samples.length > 0 ? (
                samples.map((sample) => (
                  <tr key={sample.sampleID}>
                    <td>{sample.sampleID}</td>
                    <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {sample.status}
                    </td>
                    <td>{sample.patientID || 'N/A'}</td>
                    <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No samples currently in the queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default LabDashboard;
