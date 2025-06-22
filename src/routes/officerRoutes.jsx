import { Routes, Route, Navigate } from 'react-router-dom';
import OfficerDashboard from '../components/Officer/Dashboard';
import Validation from '../components/Officer/Validation';
import Reports from '../components/Officer/Reports';
import Alerts from '../components/Officer/Alerts';
import OfficerSettings from '../components/Officer/Settings';

// Rutas para Funcionario Aduanero
export default function OfficerRoutes({ user }) {
  return (
    <Routes>
      <Route path="/officer" element={<OfficerDashboard user={user} />} />
      <Route path="/officer/validacion" element={<Validation />} />
      <Route path="/officer/reportes" element={<Reports />} />
      <Route path="/officer/alertas" element={<Alerts />} />
      <Route path="/officer/configuracion" element={<OfficerSettings />} />
      <Route path="*" element={<Navigate to="/officer" replace />} />
    </Routes>
  );
}
