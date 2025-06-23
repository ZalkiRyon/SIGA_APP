import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function OfficerDashboard({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard desde el backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/officer/dashboard', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError('Error al cargar los datos del dashboard');        // Datos de fallback en caso de error
        setDashboardData({
          resumen: {
            pendientes: 0,
            aprobados: 0,
            rechazados: 0,
            total: 0
          },
          distribucion: {
            vehiculos: 0,
            menores: 0,
            sag: 0
          },
          tramitesUrgentes: [],
          actividadReciente: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', blockSize: '100vh', background: '#fff' }}>
        <Sidebar role="officer" onLogout={logout} />
        <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Cargando dashboard...</div>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #1976d2', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        </main>
      </div>
    );
  }

  // Formatear datos para la UI
  const resumen = [
    { label: 'Pendientes', value: dashboardData?.resumen?.pendientes || 0, color: '#ffe082' },
    { label: 'Aprobados', value: dashboardData?.resumen?.aprobados || 0, color: '#b9f6ca' },
    { label: 'Rechazados', value: dashboardData?.resumen?.rechazados || 0, color: '#ff8a80' },
  ];
  const vehiculos = dashboardData?.distribucion?.vehiculos || 0;
  const menores = dashboardData?.distribucion?.menores || 0;
  const mascotas = dashboardData?.distribucion?.sag || 0;
  const tramitesUrgentes = dashboardData?.tramitesUrgentes || [];
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ display: 'flex', blockSize: '100vh', background: '#fff' }}>
        <Sidebar role="officer" onLogout={logout} />
        <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, borderBlockEnd: '2px solid #222', paddingBlockEnd: '0.3rem', margin: 0 }}>
            Bienvenido, Aduanero
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {error && (
              <span style={{ color: 'red', fontSize: '0.9rem', marginRight: '1rem' }}>
                ⚠️ {error}
              </span>
            )}
            <span title="Notificaciones" style={{ fontSize: '1.7rem', position: 'relative' }}>
              <span style={{ fontSize: '2rem' }}>🔔</span>
              {(dashboardData?.resumen?.pendientes || 0) > 0 && (
                <span style={{ position: 'absolute', insetBlockStart: 0, insetInlineEnd: 0, inlineSize: 10, blockSize: 10, background: 'yellow', borderRadius: '50%' }}></span>
              )}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <span style={{ inlineSize: 32, blockSize: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {user?.name?.[0] || user?.nombre?.[0] || 'A'}
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
        </section>        <section>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBlockEnd: '1.2rem' }}>Lista trámites urgentes</h2>
          <div style={{ border: '2px solid #222', borderRadius: 8, padding: '1.2rem', background: '#fff', color: '#222' }}>
            {tramitesUrgentes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No hay trámites urgentes pendientes
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#d32f2f' }}>
                  Trámites más antiguos pendientes
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tramitesUrgentes.map((tramite, index) => (
                    <li key={`${tramite.tipo}-${tramite.id}`} style={{ 
                      padding: '0.8rem 1rem', 
                      marginBottom: '0.5rem', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#1976d2' }}>
                          {tramite.customId}
                        </span>
                        <span style={{ margin: '0 0.5rem', color: '#666' }}>—</span>
                        <span>{tramite.tipo}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
                        <div>{tramite.fecha}</div>
                        <div style={{ color: '#d32f2f', fontWeight: 500 }}>
                          {tramite.diasPendiente} día{tramite.diasPendiente !== 1 ? 's' : ''} pendiente
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
