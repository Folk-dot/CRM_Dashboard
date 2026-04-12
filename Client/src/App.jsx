import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import TreatmentsPage from './pages/TreatmentsPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import TreatmentHistoryPage from './pages/TreatmentHistoryPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index                    element={<DashboardPage />} />
            <Route path="patients"          element={<PatientsPage />} />
            <Route path="doctors"           element={<DoctorsPage />} />
            <Route path="appointments"      element={<AppointmentsPage />} />
            <Route path="treatments"        element={<TreatmentsPage />} />
            <Route path="reminders"         element={<RemindersPage />} />
            <Route path="treatment-history" element={<TreatmentHistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
