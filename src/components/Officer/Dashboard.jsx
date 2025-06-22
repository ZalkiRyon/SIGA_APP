import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { useNavigate } from 'react-router-dom';

export default function OfficerDashboard({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Datos simulados para la UI
  const resumen = [
    { label: 'Pendientes', value: 12, color: '#ffe082' },
    { label: 'Aprobados', value: 45, color: '#b9f6ca' },
    { label: 'Rechazados', value: 7, color: '#ff8a80' },
  ];
  const vehiculos = 28;
  const menores = 19;
  const mascotas = 17;
  const tramitesUrgentes = [
    { prioridad: 'Alta prioridad', items: [
      '#TR-6052: Vehículo con placas diplomáticas (vence hoy).',
      '#TR-6018: Menor sin autorización notarial (en espera 48h).'
    ]},
    { prioridad: 'Media prioridad', items: [] }
  ];

  return (
    <div style={{ display: 'flex', blockSize: '100vh', background: '#fff' }}>
      <Sidebar role="officer" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, borderBlockEnd: '2px solid #222', paddingBlockEnd: '0.3rem', margin: 0 }}>
            Bienvenido, Aduanero
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
              Aduanero
            </span>
          </div>
        </header>
        <section style={{ marginBlockEnd: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBlockEnd: '1.2rem' }}>Acceso directo</h2>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <button onClick={() => navigate('/officer/alertas')} style={{ flex: 1, padding: '1.1rem', fontSize: '1.1rem', border: '2px solid #222', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#222' }}>Notificaciones</button>
            <button onClick={() => navigate('/officer/reportes')} style={{ flex: 1, padding: '1.1rem', fontSize: '1.1rem', border: '2px solid #222', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#222' }}>Reporte diario</button>
            <button onClick={() => navigate('/officer/alertas')} style={{ flex: 1, padding: '1.1rem', fontSize: '1.1rem', border: '2px solid #222', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#222' }}>Alertas</button>
          </div>
        </section>
        <section style={{ marginBlockEnd: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBlockEnd: '1.2rem' }}>Resumen a tiempo real</h2>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', marginBlockEnd: 0 }}>
            {resumen.map((r, i) => (
              <div key={r.label} style={{ flex: 1, background: r.color, padding: '1.2rem 0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '1.1rem', borderInlineEnd: i < resumen.length - 1 ? '1.5px solid #fff' : 'none', color: '#222' }}>
                {r.label}<br /><span style={{ fontWeight: 700, fontSize: '1.5rem' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', border: '1.5px solid #bbb', borderBlockStart: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '1.1rem 0.5rem', textAlign: 'center', fontWeight: 500, fontSize: '1.1rem', borderInlineEnd: '1.5px solid #bbb', color: '#222' }}>
              Vehículos<br /><span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{vehiculos}</span>
            </div>
            <div style={{ flex: 1, padding: '1.1rem 0.5rem', textAlign: 'center', fontWeight: 500, fontSize: '1.1rem', borderInlineEnd: '1.5px solid #bbb', color: '#222' }}>
              Menores<br /><span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{menores}</span>
            </div>
            <div style={{ flex: 1, padding: '1.1rem 0.5rem', textAlign: 'center', fontWeight: 500, fontSize: '1.1rem', color: '#222' }}>
              SAG/Mascotas<br /><span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{mascotas}</span>
            </div>
          </div>
        </section>
        <section>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBlockEnd: '1.2rem' }}>Lista trámites urgentes</h2>
          <div style={{ border: '2px solid #222', borderRadius: 8, padding: '1.2rem', background: '#fff', color: '#222' }}>
            {tramitesUrgentes.map((t, idx) => (
              <div key={t.prioridad} style={{ marginBlockEnd: '1rem' }}>
                <b>{t.prioridad}</b>
                <ul style={{ margin: 0, paddingInlineStart: '1.2rem' }}>
                  {t.items.length === 0 ? <li>—</li> : t.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
