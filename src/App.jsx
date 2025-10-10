// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { LabAuthProvider, useLabAuth } from './context/LabAuthContext'; // Import Lab Auth
// import Login from './components/Login';
// import LabLogin from './components/LabLogin';
// import EDDashboard from './components/EDDashboard';
// import LabRoutes from './components/LabRoutes'; // Import the LabRoutes container
// import './index.css';

// // Component to protect ED routes
// const ProtectedRoute = ({ redirectPath = '/login' }) => {
//   const { isAuthenticated } = useAuth();
//   if (!isAuthenticated) {
//     return <Navigate to={redirectPath} replace />;
//   }
//   return <Outlet />;
// };

// // Component to protect Lab routes
// const ProtectedLabRoute = ({ redirectPath = '/lab/login' }) => {
//     const { isLabAuthenticated } = useLabAuth();
//     if (!isLabAuthenticated) {
//         return <Navigate to={redirectPath} replace />;
//     }
//     return <Outlet />;
// };

// function App() {
//   return (
//     <BrowserRouter>
//       {/* Wrap everything in AuthProviders */}
//       <AuthProvider>
//       <LabAuthProvider>
//         <div className="App">
//           <Routes>
//             {/* Public/Login Routes */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/lab/login" element={<LabLogin />} />
            
//             {/* Redirect root to ED login as default */}
//             <Route path="/" element={<Navigate to="/login" replace />} />
            
//             {/* --- Protected ED Routes --- */}
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<EDDashboard />} />
//             </Route>

//             {/* --- Protected Lab Routes (using element for nested routes) --- */}
//             {/* This sets the parent path to /lab and renders LabRoutes for all children */}
//             <Route path="/lab/*" element={<ProtectedLabRoute />}>
//                 <Route path="*" element={<LabRoutes />} /> 
//             </Route>

//             {/* Catch-all for undefined routes */}
//             <Route path="*" element={
//               <div className="login-container">
//                 <div className="login-form-card">
//                   <h2>404 Not Found</h2>
//                   <p>The page you are looking for does not exist.</p>
//                   <button onClick={() => window.location.href = '/login'} className="submit-button">Go to Login</button>
//                 </div>
//               </div>
//             } />

//           </Routes>
//         </div>
//       </LabAuthProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LabAuthProvider, useLabAuth } from './context/LabAuthContext';

import Login from './components/Login';
import LabLogin from './components/LabLogin';
import LabDashboard from './components/LabDashboard';
import EDDashboard from './components/EDDashboard';
import AddSample from './components/AddSample';
import EDProfileView from './components/EDProfileView';
import LabProfileView from './components/LabProfileView';

import './index.css';

// --- Auth Gate Components ---

// Protects routes for ED staff
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Protects routes for Lab staff
const ProtectedLabRoute = () => {
    const { isLabAuthenticated } = useLabAuth();
    return isLabAuthenticated ? <Outlet /> : <Navigate to="/lab/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Both Auth Contexts wrap the entire app */}
      <AuthProvider>
        <LabAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/lab/login" element={<LabLogin />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* --- Protected ED Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<EDDashboard />} /> 
              <Route path="/dashboard/profile" element={<EDProfileView />} /> 
            </Route>

            {/* --- Protected LAB Routes --- */}
            <Route element={<ProtectedLabRoute />}>
              <Route path="/lab/dashboard" element={<LabDashboard />} />
              <Route path="/lab/add-sample" element={<AddSample />} />
              <Route path="/lab/profile" element={<LabProfileView />} />
            </Route>
            
            {/* Catch-all for unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </LabAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
