import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useLabAuth } from '../context/LabAuthContext';
import Sidebar from './Sidebar';
import CsvExporter from './CsvExporter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

const STATUSES = ['Received', 'In Progress', 'Analysis Complete', 'Results Available'];
const ITEMS_PER_PAGE_ACTIVE = 20;
const ITEMS_PER_PAGE_COMPLETED = 5;

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// FIX: Robust Helper function for deep comparison of samples (must be outside component)
const areArraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    // Create stable, sorted JSON strings for comparison
    const sortedJson1 = JSON.stringify([...arr1].sort((a, b) => a.sampleID.localeCompare(b.sampleID)));
    const sortedJson2 = JSON.stringify([...arr2].sort((a, b) => a.sampleID.localeCompare(b.sampleID)));

    return sortedJson1 === sortedJson2;
};

const LabDashboard = () => {
  const { setIsLabAuthenticated } = useLabAuth();
  const navigate = useNavigate();
  const [activeSamples, setActiveSamples] = useState([]);
  const [completedSamples, setCompletedSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedSearchTerm, setCompletedSearchTerm] = useState('');

  // FIX: Update Tab Title
  useEffect(() => {
    document.title = 'Lab Dashboard';
  }, []);

  const fetchSamples = useCallback(async () => {
      setLoading(true); 
      setError(null);

      try {
          const response = await fetch('http://127.0.0.1:5000/api/samples');
          if (!response.ok) {
              throw new Error(`Failed to fetch: Status ${response.status}`);
          }
          const data = await response.json();
          
          const newActive = data.filter(s => s.status !== 'Results Available');
          const newCompleted = data.filter(s => s.status === 'Results Available')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // FIX: Only update state if the new data is truly different
          setActiveSamples(prev => areArraysEqual(newActive, prev) ? prev : newActive);
          setCompletedSamples(prev => areArraysEqual(newCompleted, prev) ? prev : newCompleted);
          
      } catch (e) {
          console.error("Connection Error:", e.message);
          setError("Cannot connect to Lab Data Server. Please ensure backend is running.");
      } finally {
          setLoading(false);
      }
  }, []);

  const handleStatusUpdate = useCallback(async (sampleID, newStatus) => {
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
      fetchSamples();
    } catch (e) {
      console.error('Failed to update status:', e.message);
      alert(`Failed to update status: ${e.message}`);
    }
  }, [fetchSamples]);

  useEffect(() => {
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 5000);
    return () => clearInterval(intervalId); 
  }, [fetchSamples]);

  const handleLogout = () => {
    setIsLabAuthenticated(false);
    navigate('/lab/login');
  };

  // Memoized data processing for TAT Chart
  const tatData = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    const dailyCompleted = completedSamples.filter(s => s.tatEnd?.substring(0, 10) === today);

    const tatByTest = dailyCompleted.reduce((acc, sample) => {
        if (sample.turnaroundTime) {
            if (!acc[sample.testType]) {
                acc[sample.testType] = { total: 0, count: 0 };
            }
            acc[sample.testType].total += sample.turnaroundTime;
            acc[sample.testType].count += 1;
        }
        return acc;
    }, {});

    return Object.keys(tatByTest).map(test => ({
        name: test,
        avgTat: (tatByTest[test].total / tatByTest[test].count).toFixed(2)
    }));
  }, [completedSamples]);

  // Memoized data processing for Source Chart
  const sourceData = useMemo(() => {
    const counts = activeSamples.reduce((acc, sample) => {
      acc[sample.source] = (acc[sample.source] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(source => ({
        name: source,
        value: counts[source]
    }));
  }, [activeSamples]);


  const getBarColor = (name) => {
    switch (name) {
        case 'BMP': return '#38a169';
        case 'CMP': return '#4299e1';
        case 'CBC': return '#ed8936';
        case 'Troponin': return '#f56565';
        case 'PT/INR': return '#ecc94b';
        default: return '#ccc';
    }
  };


  const searchedActiveSamples = useMemo(() => {
    let result = [...activeSamples].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const lowerCaseSearch = activeSearchTerm.toLowerCase();
    if (lowerCaseSearch) {
        result = result.filter(sample => 
            sample.patientName.toLowerCase().includes(lowerCaseSearch) ||
            sample.sampleID.toLowerCase().includes(lowerCaseSearch) ||
            sample.testType.toLowerCase().includes(lowerCaseSearch)
        );
    }
    return result;
  }, [activeSamples, activeSearchTerm]);
  const totalPagesActive = Math.ceil(searchedActiveSamples.length / ITEMS_PER_PAGE_ACTIVE);
  const startIndexActive = (activeCurrentPage - 1) * ITEMS_PER_PAGE_ACTIVE;
  const currentSamplesActive = searchedActiveSamples.slice(startIndexActive, startIndexActive + ITEMS_PER_PAGE_ACTIVE);
  useEffect(() => { setActiveCurrentPage(1); }, [activeSearchTerm]);


  const searchedCompletedSamples = useMemo(() => {
    let result = [...completedSamples].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const lowerCaseSearch = completedSearchTerm.toLowerCase();
    if (lowerCaseSearch) {
        result = result.filter(sample => 
            sample.patientName.toLowerCase().includes(lowerCaseSearch) ||
            sample.sampleID.toLowerCase().includes(lowerCaseSearch) ||
            sample.testType.toLowerCase().includes(lowerCaseSearch)
        );
    }
    return result;
  }, [completedSamples, completedSearchTerm]);
  const totalPagesCompleted = Math.ceil(searchedCompletedSamples.length / ITEMS_PER_PAGE_COMPLETED);
  const startIndexCompleted = (completedCurrentPage - 1) * ITEMS_PER_PAGE_COMPLETED;
  const currentSamplesCompleted = searchedCompletedSamples.slice(startIndexCompleted, startIndexCompleted + ITEMS_PER_PAGE_COMPLETED);
  useEffect(() => { setCompletedCurrentPage(1); }, [completedSearchTerm]);


  return (
    <div className="dashboard-layout">
        <div className="sidebar-container">
            <h2 className="sidebar-title">Lab Tools</h2>
            <nav className="sidebar-nav">
                {LAB_PAGES.map((page) => (
                <NavLink
                    key={page.path}
                    to={page.path}
                    className={({ isActive }) => "sidebar-nav-item" + (isActive ? " active" : "")}
                >
                    {page.name}
                </NavLink>
                ))}
            </nav>
            <button onClick={handleLogout} className="sidebar-logout-button">
                Log Out
            </button>
        </div>
        
        <div className="dashboard-content">
          <header className="dashboard-header lab-header">
            <h1>Lab Dashboard</h1>
            <div className="profile-section">
              <div className="user-info">
                <span className="user-name">Welcome, {LAB_USER_DETAILS.name}</span>
                <span className="user-id">ID: {LAB_USER_DETAILS.employeeId}</span>
              </div>
            </div>
          </header>
          
          <main className="dashboard-main">
            
            <div className="samples-table-container">
                {error && (
                    <div style={{ padding: '15px', backgroundColor: '#fdd', border: '1px solid red', borderRadius: '5px', marginBottom: '15px' }}>
                    <strong>Connection Error:</strong> {error}
                    </div>
                )}
                {loading && !error ? (
                    <p>Loading samples...</p>
                ) : (
                    <>
                    <h2 className="mt-4">Daily Lab Metrics</h2>
                    <div className="bg-white p-4 mb-6 rounded-lg shadow-lg flex justify-between">
                        {/* TAT Chart */}
                        <div className="w-1/2 pr-2">
                            <h3 className="font-semibold text-lg mb-4 text-sidebar">Daily Turnaround Time (minutes)</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={tatData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#333" angle={-45} textAnchor="end" height={60} interval={0} />
                                    <YAxis stroke="#333" />
                                    <Tooltip formatter={(value) => [`Avg TAT: ${value} min`, '']}/>
                                    <Bar dataKey="avgTat" name="Avg TAT" fill="#27ae60">
                                        {tatData.map((entry, index) => (
                                            <Bar key={`bar-${index}`} fill={getBarColor(entry.name)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Samples by Source Chart */}
                        <div className="w-1/2 pl-2">
                            <h3 className="font-semibold text-lg mb-4 text-sidebar">Samples by Source</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <h2>Active Sample Queue (Total: {searchedActiveSamples.length})</h2>
                    <input
                        type="text"
                        placeholder="Search Active Queue..."
                        value={activeSearchTerm}
                        onChange={(e) => setActiveSearchTerm(e.target.value)}
                        className="dashboard-search-field dashboard-search-field-lab mb-4"
                    />

                    <table>
                    <thead>
                        <tr>
                        <th>Sample ID</th>
                        <th>Patient Name</th>
                        <th>Test Requested</th>
                        <th>Status</th>
                        <th>Claimed By</th>
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
                            <td>{sample.testType}</td>
                            <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                {sample.status}
                            </td>
                            <td className={sample.claimedBy ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                                {sample.claimedBy || 'Unclaimed'}
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
                            <td colSpan="7">No active samples found for current search.</td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                    
                    <div className="pagination-controls">
                        <span className="page-info">Page {activeCurrentPage} of {totalPagesActive} (Active: {searchedActiveSamples.length})</span>
                        <div className="pagination-buttons">
                            <button 
                                onClick={() => setActiveCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={activeCurrentPage === 1}
                                className="pagination-button"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setActiveCurrentPage(prev => Math.min(prev + 1, totalPagesActive))} 
                                disabled={activeCurrentPage === totalPagesActive}
                                className="pagination-button"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    
                    <h2 className="mt-8">Completed Reports (Total: {searchedCompletedSamples.length})</h2>
                    <input
                        type="text"
                        placeholder="Search Completed Reports..."
                        value={completedSearchTerm}
                        onChange={(e) => setCompletedSearchTerm(e.target.value)}
                        className="dashboard-search-field dashboard-search-field-lab mb-4"
                    />
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
                            {currentSamplesCompleted.length > 0 ? (
                                currentSamplesCompleted.map((sample) => (
                                    <tr key={sample.sampleID}>
                                        <td>{sample.sampleID}</td>
                                        <td>{sample.patientName}</td>
                                        <td>{sample.testType}</td>
                                        <td className={`status-${sample.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                            {sample.status}
                                        </td>
                                        <td>{new Date(sample.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No completed reports found for current search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="pagination-controls">
                        <span className="page-info">Page {completedCurrentPage} of {totalPagesCompleted} (Completed: {searchedCompletedSamples.length})</span>
                        <div className="pagination-buttons">
                            <button 
                                onClick={() => setCompletedCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={completedCurrentPage === 1}
                                className="pagination-button"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCompletedCurrentPage(prev => Math.min(prev + 1, totalPagesCompleted))} 
                                disabled={completedCurrentPage === totalPagesCompleted}
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

export default LabDashboard;
