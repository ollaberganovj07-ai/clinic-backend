import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientHome from './pages/PatientHome';

const ROLE_PATHS = {
  admin: '/admin/dashboard',
  receptionist: '/reception/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/home',
};

function RoleRedirect() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const path = role ? ROLE_PATHS[role] || ROLE_PATHS.patient : ROLE_PATHS.patient;
  return <Navigate to={path} replace />;
}

function Unauthorized() {
  const { logout } = useAuth();
  const handleBack = () => {
    logout();
    window.location.href = '/';
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">You don&apos;t have permission to view this page.</p>
        <button
          onClick={handleBack}
          className="inline-block px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <RoleRedirect /> : <Login />
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/reception/dashboard" element={
        <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
          <ReceptionDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient/home" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientHome />
        </ProtectedRoute>
      } />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={isAuthenticated ? <RoleRedirect /> : <Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
