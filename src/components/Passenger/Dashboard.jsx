import { useAuth } from '../../context/AuthContext';

// Dashboard para Pasajero/Turista
export default function PassengerDashboard({ user }) {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido, {user.name} (Pasajero/Turista)</h1>
      <p>Esta es la pantalla de inicio para el rol Pasajero/Turista.</p>
      <button onClick={logout} style={{ marginTop: '2rem' }}>Cerrar sesión</button>
    </div>
  );
}
