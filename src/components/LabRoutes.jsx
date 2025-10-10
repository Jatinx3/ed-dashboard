import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LabDashboard from './LabDashboard';
import AddSample from './AddSample';

/**
 * Handles routing and navigation within the protected /lab/* path.
 * The Sidebar and overall layout are controlled by the child components.
 */
const LabRoutes = () => {
  return (
    <Routes>
      {/* Route for the main Sample List view */}
      <Route path="/dashboard" element={<LabDashboard />} />
      
      {/* Route for the Add Sample form */}
      <Route path="/add-sample" element={<AddSample />} />
      
      {/* Redirects any unknown /lab/ paths back to the main lab dashboard */}
      <Route path="*" element={<Navigate to="/lab/dashboard" replace />} />
    </Routes>
  );
};

export default LabRoutes;
