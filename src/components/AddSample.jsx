import React, { useState } from 'react';
import Sidebar from './Sidebar';

const LAB_USER_DETAILS = {
  name: 'Sammy Sample',
  department: 'Clinical Chemistry',
  employeeId: 'LAB-54321',
};

const LAB_PAGES = [
  { name: 'Sample Queue', path: '/lab/dashboard' },
  { name: 'Add Sample Data', path: '/lab/add-sample' },
  { name: 'My Profile', path: '/lab/profile' },
];

const AddSample = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientID: '',
    testType: 'BMP',
    source: 'ED',
    dateOfSample: new Date().toISOString().substring(0, 10),
    timeOfSample: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    dateReported: new Date().toISOString().substring(0, 10),
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const TEST_TYPES = ['BMP (Basic Metabolic Panel)', 'CMP (Comprehensive Metabolic Panel)', 'Troponin', 'PT/INR', 'CBC (Complete Blood Count)'];
  const SOURCE_DEPARTMENTS = ['ED', 'ICU', 'Floor 3', 'OR'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/add-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }

      setLoading(false);
      setError(false);
      setMessage(`Success! Sample added.`);

      setFormData({
        patientName: '',
        patientID: '',
        testType: 'BMP',
        source: 'ED',
        dateOfSample: new Date().toISOString().substring(0, 10),
        timeOfSample: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateReported: new Date().toISOString().substring(0, 10),
      });

    } catch (err) {
      console.error('API Submission Error:', err);
      setLoading(false);
      setError(true);
      if (err.message.includes('Failed to fetch')) {
          setMessage(`Connection Failed: Please ensure the Flask server is running at 127.0.0.1:5000.`);
      } else {
          setMessage(`Submission Failed: ${err.message}.`);
      }
    } finally {
      setTimeout(() => setMessage(''), 5000); 
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar userType="LAB" pages={LAB_PAGES} />
      
      <div className="dashboard-content">
        <header className="dashboard-header lab-header">
          <h1>Lab: Add New Sample Data</h1>
          <div className="profile-section">
            <div className="user-info">
              <span className="user-name">Welcome, {LAB_USER_DETAILS.name}</span>
              <span className="user-id">Dept: {LAB_USER_DETAILS.department}</span>
            </div>
          </div>
        </header>
        
        <main className="dashboard-main lab-main">
          <div className="add-sample-form-card">
            <h3>Enter New Specimen Details</h3>
            
            <form onSubmit={handleSubmit} className="sample-form">
              
              <div className="form-group">
                <label htmlFor="patientName">Patient Name:</label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientID">Patient ID (MRN):</label>
                <input
                  type="text"
                  id="patientID"
                  name="patientID"
                  value={formData.patientID}
                  onChange={handleChange}
                  placeholder="e.g., P-12345"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="testType">Test Requested:</label>
                <select
                  id="testType"
                  name="testType"
                  value={formData.testType}
                  onChange={handleChange}
                  required
                >
                  {TEST_TYPES.map(type => (
                    <option key={type} value={type.split(' ')[0]}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="source">Source Department:</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                >
                  {SOURCE_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateOfSample">Date of Sample:</label>
                <input
                  type="date"
                  id="dateOfSample"
                  name="dateOfSample"
                  value={formData.dateOfSample}
                  onChange={handleChange}
                  readOnly 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="timeOfSample">Time of Sample:</label>
                <input
                  type="time"
                  id="timeOfSample"
                  name="timeOfSample"
                  value={formData.timeOfSample}
                  onChange={handleChange}
                  readOnly 
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateReported">Date Sample Reported:</label>
                <input
                  type="date"
                  id="dateReported"
                  name="dateReported"
                  value={formData.dateReported}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Adding Sample...' : 'Add Sample to Queue'}
              </button>
            </form>
            
            {message && (
              <p className={`status-message ${error ? 'error' : 'success'}`}>
                {message}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddSample;