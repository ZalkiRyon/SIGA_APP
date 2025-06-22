import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';

export default function AdminDashboard({ user }) {
  const { logout } = useAuth();

  // Datos simulados para la UI
  const usuariosActivos = 24;
  const incidenciasHoy = 3;
  const alertas = [
    '#SYS-205: Caída API Aduana AR (25 minutos)',
    '#SEC-101: 3 Intentos de accesos no autorizados',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar role="admin" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', color: '#222' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, borderBottom: '2px solid #222', paddingBottom: '0.3rem', margin: 0, color: '#222' }}>
            Panel de Administración
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span title="Notificaciones" style={{ fontSize: '1.7rem', position: 'relative' }}>
              <span style={{ fontSize: '2rem' }}>🔔</span>
              <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, background: 'yellow', borderRadius: '50%' }}></span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>
                {user.name[0]}
              </span>
              <span style={{ color: '#222' }}>ADMIN</span>
            </span>
          </div>
        </header>
        <section style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#222' }}>
          <div style={{ fontSize: '1.2rem', color: '#222' }}>Usuarios activos: <b>{usuariosActivos}</b></div>
          <div style={{ fontSize: '1.2rem', color: '#222' }}>Incidencias hoy: <b>{incidenciasHoy}</b></div>
        </section>
        <section style={{ marginBottom: '2.5rem', color: '#222' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.7rem', color: '#222' }}>Alertas críticas</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#222' }}>
            {alertas.map((a, i) => (
              <li key={i} style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#222' }}>{a}</li>
            ))}
          </ul>
        </section>
        <section style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-end' }}>
          <div style={{ width: 220, height: 220, background: '#f3f3f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Gráfico circular simulado */}
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" fill="#e0e0e0" />
              <path d="M90,90 L90,10 A80,80 0 0,1 170,90 Z" fill="#bdbdbd" />
              <path d="M90,90 L170,90 A80,80 0 0,1 90,170 Z" fill="#757575" />
            </svg>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#222' }}>Gráfico KPI's 1</div>
          <div style={{ width: 220, height: 220, background: '#f3f3f3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Gráfico de líneas simulado */}
            <svg width="180" height="180" viewBox="0 0 180 180">
              <polyline points="10,170 50,120 90,140 130,80 170,100" fill="none" stroke="#757575" strokeWidth="5" />
              <polyline points="10,170 50,150 90,160 130,120 170,130" fill="none" stroke="#bdbdbd" strokeWidth="5" />
            </svg>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#222' }}>Gráfico KPI's 1</div>
        </section>
      </main>
    </div>
  );
}
