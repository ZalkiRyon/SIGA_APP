import { Routes as Switch, Route, Navigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import ForgotPassword from '../components/Auth/ForgotPassword';
import AdminRoutes from './adminRoutes';
import OfficerRoutes from './officerRoutes';
import PassengerRoutes from './passengerRoutes';
import NewProcedureType from '../components/Passenger/NewProcedureType';

// Rutas principales de la aplicación
export default function AppRoutes({ tipo, user }) {
  if (tipo === 'public') {
    return (
      <Switch>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Switch>
    );
  }
  if (tipo === 'admin') return <AdminRoutes user={user} />;
  if (tipo === 'officer') return <OfficerRoutes user={user} />;
  if (tipo === 'passenger') return <PassengerRoutes user={user} />;
  return <div>Rol no reconocido</div>;
}

const routes = [
  {
    path: '/tramite/nuevo',
    element: <NewProcedureType />,
  },
  // Rutas dummy para los formularios específicos (a implementar después)
  {
    path: '/tramite/vehiculo',
    element: <div>Formulario Vehículo temporal (próximamente)</div>,
  },
  {
    path: '/tramite/menores',
    element: <div>Formulario Menores de edad (próximamente)</div>,
  },
  {
    path: '/tramite/alimentos',
    element: <div>Formulario Alimentos/Mascotas (próximamente)</div>,
  },
];
