import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import CsvExporter from './CsvExporter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import noti from '../assets/noti.mp3';

const ED_USER_DETAILS = {
  name: 'Dr. Jane Doe',
  department: 'Emergency Department',
  employeeId: 'ED-12345',
};

const ED_PAGES = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Profile', path: '/dashboard/profile' },
];

const ITEMS_PER_PAGE_ACTIVE = 20;
const ITEMS_PER_PAGE_CLAIMED = 5;

const EDDashboard = () => {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [filter, setFilter] = useState('24hours'); // Time filter
  const [currentPageActive, setCurrentPageActive] = useState(1); // Active pagination
  const [currentPageClaimed, setCurrentPageClaimed] = useState(1); // Claimed pagination
  const [searchTerm, setSearchTerm] = useState(''); // Search state
  
  const newSampleChime = useRef(new Audio(noti));
  const previousSamples = useRef([]);

  const fetchSamples = useCallback(async () => {
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
  }, []);

  const handleClaimReport = useCallback(async (sampleID) => {
    const claimerName = ED_USER_DETAILS.name;
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleID, claimedBy: claimerName }),
      });
      if (!response.ok) {
        throw new Error(`Failed to claim report: Status ${response.status}`);
      }
      fetchSamples(); 
    } catch (e) {
      console.error('Failed to claim report:', e.message);
      alert(`Failed to claim report: ${e.message}`);
    }
  }, [fetchSamples]);

  useEffect(() => {
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 5000);
    return () => clearInterval(intervalId);
  }, [fetchSamples]); 

  useEffect(() => {
    if (previousSamples.current.length > 0) {
        const newCompleted = samples.filter(currentSample => {
            const previousSample = previousSamples.current.find(p => p.sampleID === currentSample.sampleID);
            return currentSample.status === 'Results Available' && previousSample?.status !== 'Results Available';
        });
        if (newCompleted.length > 0) {
            newSampleChime.current.play();
        }
    }
    previousSamples.current = samples;
  }, [samples, newSampleChime]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  const { activeSamples, claimedSamples } = useMemo(() => {
    const now = new Date();
    const filterHours = {
      '1hour': 1, '12hours': 12, '24hours': 24,
    };
    const cutoffTime = now.getTime() - (filterHours[filter] * 60 * 60 * 1000);
    const lowerCaseSearch = searchTerm.toLowerCase();

    const result = samples.filter(sample => new Date(sample.timestamp).getTime() > cutoffTime)
                         .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const active = result.filter(sample => !sample.claimedBy);
    const claimed = result.filter(sample => sample.claimedBy);

    const searchedActive = active.filter(sample => 
        sample.patientName.toLowerCase().includes(lowerCaseSearch) ||
        sample.sampleID.toLowerCase().includes(lowerCaseSearch) ||
        sample.testType.toLowerCase().includes(lowerCaseSearch)
    );
    
    const searchedClaimed = claimed.filter(sample => 
        sample.patientName.toLowerCase().includes(lowerCaseSearch) ||
        sample.sampleID.toLowerCase().includes(lowerCaseSearch) ||
        sample.testType.toLowerCase().includes(lowerCaseSearch) ||
        (sample.claimedBy && sample.claimedBy.toLowerCase().includes(lowerCaseSearch))
    );
    
    return { activeSamples: searchedActive, claimedSamples: searchedClaimed };
  }, [samples, filter, searchTerm]);

  const maskedActiveSamples = useMemo(() => {
    return activeSamples.map(sample => {
      const nameParts = sample.patientName ? sample.patientName.split(' ') : [];
      const maskedPatientName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : (nameParts[0] || 'N/A');
      const maskedPatientID = sample.patientID ? `****-${sample.patientID.slice(-4)}` : '****-****';
      return { ...sample, patientName: maskedPatientName, patientID: maskedPatientID };
    });
  }, [activeSamples]);
  
  const maskedClaimedSamples = useMemo(() => {
    return claimedSamples.map(sample => {
      const nameParts = sample.patientName ? sample.patientName.split(' ') : [];
      const maskedPatientName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : (nameParts[0] || 'N/A');
      const maskedPatientID = sample.patientID ? `****-${sample.patientID.slice(-4)}` : '****-****';
      return { ...sample, patientName: maskedPatientName, patientID: maskedPatientID };
    });
  }, [claimedSamples]);

  const totalPagesActive = Math.ceil(maskedActiveSamples.length / ITEMS_PER_PAGE_ACTIVE);
  const startIndexActive = (currentPageActive - 1) * ITEMS_PER_PAGE_ACTIVE;
  const currentSamplesActive = maskedActiveSamples.slice(startIndexActive, startIndexActive + ITEMS_PER_PAGE_ACTIVE);

  const totalPagesClaimed = Math.ceil(maskedClaimedSamples.length / ITEMS_PER_PAGE_CLAIMED);
  const startIndexClaimed = (currentPageClaimed - 1) * ITEMS_PER_PAGE_CLAIMED;
  const currentSamplesClaimed = maskedClaimedSamples.slice(startIndexClaimed, startIndexClaimed + ITEMS_PER_PAGE_CLAIMED);
  
  const statusData = useMemo(() => {
    const counts = samples.reduce((acc, sample) => {
      acc[sample.status] = (acc[sample.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Received', count: counts['Received'] || 0 },
      { name: 'In Progress', count: counts['In Progress'] || 0 },
      { name: 'Complete', count: counts['Analysis Complete'] || 0 },
      { name: 'Results', count: counts['Results Available'] || 0 },
    ];
  }, [samples]);

  const getBarColor = (name) => {
    switch (name) {
      case 'Received': return '#ffc107'; // Yellow
      case 'In Progress': return '#007bff'; // Blue
      case 'Complete': return '#28a745'; // Green
      case 'Results': return '#17a2b8'; // Cyan
      default: return '#ccc';
    }
  };

  useEffect(() => {
    setCurrentPageActive(1);
    setCurrentPageClaimed(1);
  }, [filter, searchTerm]);


  return (
    <div className="dashboard-layout">
        <Sidebar userType="ED" pages={ED_PAGES} handleLogout={handleLogout} />
        <div className="dashboard-content">
          <header className="dashboard-header">
            <h1 className="flex items-center">
              ED Dashboard
              <span className="ml-4 text-ed-blue text-sm">
                {samples && samples.length > previousSamples.current.length && previousSamples.current.length !== 0 && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </span>
            </h1>
            <div className="profile-section">
              <div className="user-info">
                <span className="user-name">Welcome, {ED_USER_DETAILS.name}</span>
                <span className="user-id">ID: {ED_USER_DETAILS.employeeId}</span>
              </div>
            </div>
          </header>
          
          <main className="dashboard-main">
            <h2>Operational Overview ({filter})</h2>

            <div className="bg-white p-4 mb-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg mb-4 text-sidebar">Samples by Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#333" />
                        <YAxis allowDecimals={false} stroke="#333" />
                        <Tooltip />
                        <Bar dataKey="count" name="Samples" fill="#007bff">
                            {statusData.map((entry, index) => (
                                <Bar key={`bar-${index}`} fill={getBarColor(entry.name)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="filter-controls mb-4">
                <button onClick={() => setFilter('1hour')} className={filter === '1hour' ? 'active' : ''}>Last 1 Hour</button>
                <button onClick={() => setFilter('12hours')} className={filter === '12hours' ? 'active' : ''}>Last 12 Hours</button>
                <button onClick={() => setFilter('24hours')} className={filter === '24hours' ? 'active' : ''}>Last 24 Hours</button>
            </div>

            <div className="flex justify-between items-center mt-4">
                <h2 className="text-xl font-semibold">Active Sample Queue</h2>
                <CsvExporter data={activeSamples} filename={`ED_Active_Report_${filter}_${new Date().toISOString().substring(0, 10)}.csv`} userType="ED" />
            </div>
            
            <div className="samples-table-container p-4">
                <input
                    type="text"
                    placeholder="Search by Patient Name, ID, or Test..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dashboard-search-field dashboard-search-field-ed"
                />

              {error && (
                <div style={{ padding: '15px', backgroundColor: '#fdd', border: '1px solid red', borderRadius: '5px', marginBottom: '15px' }}>
                  <strong>Connection Error:</strong> {error}
                </div>
              )}

              {loading && !error ? (
                <p>Loading samples...</p>
              ) : (
                <>
                <table>
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Patient Name</th>
                      <th>Patient ID</th>
                      <th>Test Requested</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSamplesActive.length > 0 ? (
                      currentSamplesActive.map((sample) => (
                        <tr key={sample.sampleID}>
                          <td>{sample.sampleID}</td>
                          <td>{sample.patientName}</td>
                          <td>{sample.patientID}</td> 
                          <td>{sample.testType}</td>
                          <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {sample.status}
                          </td>
                          <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                          <td>
                            {sample.status === 'Results Available' && !sample.claimedBy ? (
                                <button 
                                    onClick={() => handleClaimReport(sample.sampleID)} 
                                    className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm hover:bg-blue-700 transition duration-150"
                                >
                                    Claim Report
                                </button>
                            ) : (
                                <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">No samples found for current filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="pagination-controls">
                    <span className="page-info">Page {currentPageActive} of {totalPagesActive} (Total: {activeSamples.length})</span>
                    <div className="pagination-buttons">
                        <button 
                            onClick={() => setCurrentPageActive(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPageActive === 1}
                            className="pagination-button"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPageActive(prev => Math.min(prev + 1, totalPagesActive))} 
                            disabled={currentPageActive === totalPagesActive}
                            className="pagination-button"
                        >
                            Next
                        </button>
                    </div>
                </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-center mt-8 mb-4">
                <h2 className="text-xl font-semibold">My Claimed Reports</h2>
                <CsvExporter data={claimedSamples} filename={`ED_Claimed_Reports_${new Date().toISOString().substring(0, 10)}.csv`} userType="ED" />
            </div>
            <div className="samples-table-container p-4">
              {loading && !error ? (
                <p>Loading claimed reports...</p>
              ) : (
                <>
                <table>
                  <thead>
                    <tr>
                      <th>Sample ID</th>
                      <th>Patient Name</th>
                      <th>Patient ID</th>
                      <th>Test Requested</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSamplesClaimed.length > 0 ? (
                      currentSamplesClaimed.map((sample) => (
                        <tr key={sample.sampleID}>
                          <td>{sample.sampleID}</td>
                          <td>{sample.patientName}</td>
                          <td>{sample.patientID}</td>
                          <td>{sample.testType}</td>
                          <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {sample.status}
                          </td>
                          <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">You have no claimed reports.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="pagination-controls">
                  <span className="page-info">Page {currentPageClaimed} of {totalPagesClaimed} (Total: {claimedSamples.length})</span>
                  <div className="pagination-buttons">
                    <button
                      onClick={() => setCurrentPageClaimed(prev => Math.max(prev - 1, 1))}
                      disabled={currentPageClaimed === 1}
                      className="pagination-button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPageClaimed(prev => Math.min(prev + 1, totalPagesClaimed))}
                      disabled={currentPageClaimed === totalPagesClaimed}
                      className="pagination-button"
                    >
                      Next
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          </main>
        </div>
    </div>
  );
};

export default EDDashboard;