import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../components/Admin/Dashboard';
import UserManagement from '../components/Admin/UserManagement';
import Incidents from '../components/Admin/Incidents';
import History from '../components/Admin/History';
import AdminSettings from '../components/Admin/Settings';

// Rutas para Administrador
export default function AdminRoutes({ user }) {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard user={user} />} />
      <Route path="/admin/usuarios" element={<UserManagement />} />
      <Route path="/admin/incidencias" element={<Incidents />} />
      <Route path="/admin/historial" element={<History />} />
      <Route path="/admin/configuracion" element={<AdminSettings />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
