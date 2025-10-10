import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LabAuthProvider, useLabAuth } from './context/LabAuthContext'; // NEW
import Login from './components/login';
import LabLogin from './components/LabLogin'; // NEW - Lab Login
import EDDashboard from './components/EDDashboard' ;
import LabDashboard from './components/LabDashboard'; // NEW - Lab Dashboard
import './index.css';

// Protected Route for ED (uses ED auth context)
const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

// Protected Route for Lab (uses Lab auth context)
const LabProtectedRoute = ({ redirectPath = '/lab/login' }) => { // NEW
  const { isLabAuthenticated } = useLabAuth();
  if (!isLabAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps ED routes */}
      <AuthProvider>
      {/* LabAuthProvider wraps Lab routes - Nested for clean separation */}
      <LabAuthProvider>
        <div className="App">
          <Routes>
            {/* Default Route redirects to ED Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* ED ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<EDDashboard />} />
            </Route>

            {/* LAB ROUTES */}
            <Route path="/lab/login" element={<LabLogin />} />
            <Route element={<LabProtectedRoute />}>
              <Route path="/lab/dashboard" element={<LabDashboard />} />
            </Route>

            {/* Fallback 404/Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </LabAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
