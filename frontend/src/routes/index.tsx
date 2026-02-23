import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';
import RoleManagement from '../pages/RoleManagement';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyEmail from '../pages/VerifyEmail';
import NotFound from '../pages/NotFound';
import AccessDenied from '../pages/AccessDenied';
import ErrorPage from '../pages/ErrorPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <UserManagement />
            </Layout>
          }
        />
        <Route
          path="/roles"
          element={
            <Layout>
              <RoleManagement />
            </Layout>
          }
        />
        <Route
          path="/patients"
          element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Patients</h1>
                <p className="text-muted-foreground mt-1">Patient management coming soon...</p>
              </div>
            </Layout>
          }
        />
        <Route
          path="/appointments"
          element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Appointments</h1>
                <p className="text-muted-foreground mt-1">Appointment management coming soon...</p>
              </div>
            </Layout>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Pharmacy</h1>
                <p className="text-muted-foreground mt-1">Pharmacy management coming soon...</p>
              </div>
            </Layout>
          }
        />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
