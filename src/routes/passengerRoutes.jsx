import { Routes, Route, Navigate } from 'react-router-dom';
import PassengerDashboard from '../components/Passenger/Dashboard';
import MyProcedures from '../components/Passenger/MyProcedures';
import Help from '../components/Passenger/Help';
import Documentation from '../components/Passenger/Documentation';

// Rutas para Pasajero/Turista
export default function PassengerRoutes({ user }) {
  return (
    <Routes>
      <Route path="/passenger" element={<PassengerDashboard user={user} />} />
      <Route path="/passenger/mis-tramites" element={<MyProcedures />} />
      <Route path="/passenger/ayuda" element={<Help />} />
      <Route path="/passenger/documentacion" element={<Documentation />} />
      <Route path="*" element={<Navigate to="/passenger" replace />} />
    </Routes>
  );
}
