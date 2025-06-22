import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const sidebarItems = {
  officer: [
    { icon: '🏠', label: 'Inicio', path: '/officer' },
    { icon: '📝', label: 'Validación', path: '/officer/validacion' },
    { icon: '📊', label: 'Reportes', path: '/officer/reportes' },
    { icon: '⚠️', label: 'Alertas', path: '/officer/alertas' },
    { icon: '⚙️', label: 'Configuración', path: '/officer/configuracion' },
  ],
  admin: [
    { icon: '🏠', label: 'Inicio', path: '/admin' },
    { icon: '👥', label: 'Gestión de usuarios', path: '/admin/usuarios' },
    { icon: '🛑', label: 'Incidencias', path: '/admin/incidencias' },
    { icon: '📜', label: 'Historial', path: '/admin/historial' },
    { icon: '⚙️', label: 'Configuración', path: '/admin/configuracion' },
  ],
  passenger: [
    { icon: '🏠', label: 'Inicio', path: '/passenger' },
    { icon: '📄', label: 'Mis trámites', path: '/passenger/mis-tramites' },
    { icon: '❓', label: 'Ayuda', path: '/passenger/ayuda' },
    { icon: '📚', label: 'Documentación', path: '/passenger/documentacion' },
  ],
};

export default function Sidebar({ role = 'officer', onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = sidebarItems[role] || sidebarItems['officer'];
  return (
    <aside style={{
      inlineSize: 220,
      background: '#f7f7f7',
      borderInlineEnd: '1.5px solid #d1d5db',
      blockSize: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      gap: '0.5rem',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBlockEnd: 30, paddingInlineStart: 24 }}>
        <div style={{ inlineSize: 38, blockSize: 38, background: '#e3e6ea', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          <img src="/src/assets/peque_logo_siga.png" alt="logo" style={{ inlineSize: 28, blockSize: 28 }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1, color: '#222' }}>SIGA Aduanas</span>
      </div>
      <nav style={{ flex: 1 }}>
        {items.map((item, i) => {
          const selected = location.pathname === item.path;
          return (
            <div key={item.label} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '0.8rem 1.5rem',
              background: selected ? '#e3eefe' : 'transparent',
              color: selected ? '#1976d2' : '#222',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: '1.08rem',
              marginBlockEnd: 6,
              cursor: 'pointer',
              borderInlineStart: selected ? '4px solid #1976d2' : '4px solid transparent',
            }}>
              <span style={{ fontSize: '1.3rem', color: selected ? '#1976d2' : '#222' }}>{item.icon}</span>
              <span style={{ color: selected ? '#1976d2' : '#222' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ marginBlockStart: 'auto', padding: '0 1.5rem' }}>
        <button onClick={onLogout} style={{
          inlineSize: '100%',
          background: 'none',
          border: 'none',
          color: '#1976d2',
          fontWeight: 600,
          fontSize: '1.08rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          padding: '0.7rem 0',
        }}>
          <span style={{ fontSize: '1.3rem' }}>↩️</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
