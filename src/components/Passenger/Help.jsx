import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';

export default function Help() {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: 'flex', background: '#fff' }}>
      <Sidebar role="passenger" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222', margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, borderBottom: '3px solid #bbb', paddingBottom: 6 }}>
            Centro de ayuda
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span title="Notificaciones" style={{ fontSize: '1.7rem', position: 'relative' }}>
              <span style={{ fontSize: '2rem' }}>🔔</span>
              <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, background: 'yellow', borderRadius: '50%' }}></span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {user?.name?.[0] || 'U'}
              </span>
              Usuario
            </span>
          </div>
        </header>
        <div style={{ margin: '1.5rem 0 2.5rem 0', width: 500, minWidth: 320 }}>
          <input type="text" placeholder="Buscar..." style={{ width: '100%', padding: '0.7rem', borderRadius: 20, border: '1.5px solid #bbb', fontSize: '1.08rem', marginBottom: 24 }} />
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 600, fontSize: '1.18rem', marginBottom: 8 }}>Categorías frecuentes</div>
            <ul style={{ margin: 0, paddingLeft: 22, fontSize: '1.05rem' }}>
              <li>¿Cómo crear un trámite de vehículo?</li>
              <li>¿Qué documentos necesito para menores?</li>
              <li>¿Qué declarar alimentos/mascotas?</li>
            </ul>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 600, fontSize: '1.18rem', marginBottom: 8 }}>Guías paso a paso</div>
            <ul style={{ margin: 0, paddingLeft: 22, fontSize: '1.05rem' }}>
              <li><a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Ver videos para saber como rellenar formularios</a></li>
              <li><a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Ver PDF para saber los requisitos de tu trámite</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.18rem', marginBottom: 8 }}>Contactar soporte</div>
            <div style={{ fontSize: '1.05rem', marginBottom: 2 }}>Chat en vivo (En línea)</div>
            <div style={{ fontSize: '1.05rem', marginBottom: 2 }}>Correo: <a href="mailto:soporte@siga.cl" style={{ color: '#1976d2', textDecoration: 'underline' }}>soporte@siga.cl</a> (Operativo las 24 horas)</div>
            <div style={{ fontSize: '1.05rem' }}>Teléfono: +56 2 2345 6789</div>
          </div>
        </div>
      </main>
    </div>
  );
}
