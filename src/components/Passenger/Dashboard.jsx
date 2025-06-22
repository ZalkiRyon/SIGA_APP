import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';

// Dashboard para Pasajero/Turista
export default function PassengerDashboard({ user }) {
  const { logout } = useAuth();
  // Datos simulados para la UI
  const tramitesActivos = [
    { label: 'Aprobado', value: 1, color: '#b6e7a0' },
    { label: 'En revisión', value: 1, color: '#ffe082' },
    { label: 'Rechazado', value: 1, color: '#ffb3b3' },
  ];
  const notificaciones = [
    { texto: 'Falta autorización notarial para, Nombre del menor', tipo: 'alerta' }
  ];
  const tramitesRecientes = [
    { fecha: '18/05/2025', tipo: 'Vehículo temporal', estado: 'Aprobado', accion: 'Ver detalles' },
    { fecha: '17/05/2025', tipo: 'Declaración SAG', estado: 'En revisión', accion: '' },
  ];
  return (
    <div style={{ display: 'flex', background: '#fff', blockSize: '100vh' }}>
      <Sidebar role="passenger" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>
            Bienvenido, {user.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span title="Notificaciones" style={{ fontSize: '1.7rem', position: 'relative' }}>
              <span style={{ fontSize: '2rem' }}>🔔</span>
              <span style={{ position: 'absolute', insetBlockStart: 0, insetInlineEnd: 0, inlineSize: 10, blockSize: 10, background: 'yellow', borderRadius: '50%' }}></span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <span style={{ inlineSize: 32, blockSize: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {user.name[0]}
              </span>
              Usuario
            </span>
          </div>
        </header>
        <section style={{ display: 'flex', gap: '2.5rem', marginBlockEnd: '2.5rem' }}>
          {/* Trámites activos */}
          <div style={{ flex: 1.2, border: '2px solid #222', borderRadius: 8, padding: '1.2rem', background: '#fff', minInlineSize: 260 }}>
            <div style={{ fontWeight: 600, marginBlockEnd: 8 }}>Trámites activos</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBlockEnd: 8 }}>
              {tramitesActivos.map((t, i) => (
                <div key={t.label} style={{ flex: 1, background: t.color, textAlign: 'center', padding: '0.5rem 0', borderInlineEnd: i < tramitesActivos.length - 1 ? '1.5px solid #fff' : 'none', fontWeight: 500, fontSize: '1.05rem' }}>
                  {t.value} {t.label}
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 500, marginBlockEnd: 8 }}>En curso: 3</div>
            <button style={{ border: '1.5px solid #222', borderRadius: 6, background: '#fff', color: '#222', padding: '0.3rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}>Revisar</button>
          </div>
          {/* Notificaciones */}
          <div style={{ flex: 1, border: '2px solid #222', borderRadius: 8, padding: '1.2rem', background: '#fff', minInlineSize: 220, position: 'relative' }}>
            <div style={{ fontWeight: 600, marginBlockEnd: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Notificaciones
              <span style={{ inlineSize: 16, blockSize: 16, background: 'yellow', borderRadius: '50%', display: 'inline-block' }}></span>
            </div>
            {notificaciones.map((n, i) => (
              <div key={i} style={{ background: '#eee', padding: '0.5rem', borderRadius: 4, marginBlockEnd: 8, fontSize: '0.98rem' }}>{n.texto}</div>
            ))}
            <button style={{ border: '1.5px solid #222', borderRadius: 6, background: '#fff', color: '#222', padding: '0.3rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}>Detalles</button>
          </div>
        </section>
        {/* Accesos directos */}
        <section style={{ marginBlockEnd: '2.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBlockEnd: 16 }}>Accesos directos</div>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <button style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}>Nuevo trámite de vehículo</button>
            <button style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}>Declarar alimentos o mascotas</button>
            <button style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}>Documentos para menores</button>
          </div>
        </section>
        {/* Trámites recientes */}
        <section>
          <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBlockEnd: 16 }}>Trámites recientes</div>
          <table style={{ inlineSize: '100%', borderCollapse: 'collapse', fontSize: '1.05rem', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f3f3f3', borderBlockEnd: '2px solid #222' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontWeight: 600 }}>Tipo trámite</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tramitesRecientes.map((t, i) => (
                <tr key={i} style={{ borderBlockEnd: '1px solid #ccc' }}>
                  <td style={{ padding: '0.6rem' }}>{t.fecha}</td>
                  <td style={{ padding: '0.6rem' }}>{t.tipo}</td>
                  <td style={{ padding: '0.6rem' }}>{t.estado}</td>
                  <td style={{ padding: '0.6rem' }}>{t.accion ? <a href="#" style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>{t.accion}</a> : '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
