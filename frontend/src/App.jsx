import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/donor/Dashboard';
import DonorDonate from './pages/donor/Donate';
import NGODashboard from './pages/ngo/Dashboard';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import MoneyDonation from './pages/MoneyDonation';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donate-money" element={<MoneyDonation />} />

          {/* Donor Routes */}
          <Route 
            path="/donor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/donate" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDonate />
              </ProtectedRoute>
            } 
          />

          {/* NGO Routes */}
          <Route 
            path="/ngo/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } 
          />

          {/* Volunteer Routes */}
          <Route 
            path="/volunteer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
