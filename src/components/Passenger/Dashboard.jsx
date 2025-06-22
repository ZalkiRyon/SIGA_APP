import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTramitesVehiculo, getTramitesMenores, getTramitesAlimentos } from '../../services/api';

// Dashboard para Pasajero/Turista
export default function PassengerDashboard({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tramitesRecientes, setTramitesRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tramitesActivos, setTramitesActivos] = useState([
    { label: 'Aprobado', value: 0, color: '#b6e7a0' },
    { label: 'En revisión', value: 0, color: '#ffe082' },
    { label: 'Rechazado', value: 0, color: '#ffb3b3' },
  ]);

  useEffect(() => {
    async function fetchTramites() {
      setLoading(true);
      setError(null);
      try {
        const [vehiculo, menores, alimentos] = await Promise.all([
          getTramitesVehiculo(user?.id),
          getTramitesMenores(user?.id),
          getTramitesAlimentos(user?.id)
        ]);
        // Unificar y normalizar
        const all = [
          ...vehiculo.map(t => ({
            id: t.id,
            fecha: t.fechaInicio,
            tipo: 'Vehículo temporal',
            estado: t.estado,
          })),
          ...menores.map(t => ({
            id: t.id,
            fecha: t.menorNacimiento,
            tipo: 'Menores de edad',
            estado: t.estado,
          })),
          ...alimentos.map(t => ({
            id: t.id,
            fecha: t.fechaInicio,
            tipo: 'Declaración SAG',
            estado: t.estado,
          })),
        ];
        // Calcular totales por estado
        const estados = ['Aprobado', 'En revisión', 'Rechazado'];
        const counts = estados.map(label => ({
          label,
          value: all.filter(t => t.estado === label).length,
          color: label === 'Aprobado' ? '#b6e7a0' : label === 'En revisión' ? '#ffe082' : '#ffb3b3'
        }));
        setTramitesActivos(counts);
        // Ordenar por fecha descendente y tomar los 5 más recientes
        all.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
        setTramitesRecientes(all.slice(0, 5));
      } catch (err) {
        setError('No se pudieron cargar los trámites recientes.');
      }
      setLoading(false);
    }
    if (user?.id) fetchTramites();
  }, [user]);

  // Datos simulados para la UI
  const notificaciones = [
    { texto: 'Falta autorización notarial para, Nombre del menor', tipo: 'alerta' }
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
            <div style={{ fontWeight: 500, marginBlockEnd: 8 }}>En curso: {tramitesActivos.reduce((acc, t) => acc + t.value, 0)}</div>
            <button style={{ border: '1.5px solid #222', borderRadius: 6, background: '#fff', color: '#222', padding: '0.3rem 1.2rem', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/passenger/mis-tramites')}>Revisar</button>
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
            <button style={{ border: '1.5px solid #222', borderRadius: 6, background: '#fff', color: '#222', padding: '0.3rem 1.2rem', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/passenger/mis-tramites')}>Detalles</button>
            {/* Último cambio de estado de trámite */}
            <div style={{ marginBlockStart: 12, color: '#444', fontSize: '0.98rem' }}>
              {(() => {
                // Buscar el trámite más reciente (por fecha) que tenga estado distinto de 'En revisión'
                const allTramites = [...tramitesRecientes];
                allTramites.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
                const ultimo = allTramites.find(t => t.estado && t.estado !== 'En revisión');
                if (!ultimo) return 'No hay cambios recientes de estado.';
                if (ultimo.estado === 'Rechazado') {
                  // Simulación de fundamento (en real, debería venir de la base de datos)
                  const fundamento = ultimo.fundamento || 'Falta documento obligatorio o datos incorrectos.';
                  return `Último cambio: Trámite ${ultimo.tipo} fue RECHAZADO. Fundamento: ${fundamento}`;
                }
                return `Último cambio: Trámite ${ultimo.tipo} fue ${ultimo.estado.toUpperCase()}.`;
              })()}
            </div>
          </div>
        </section>
        {/* Accesos directos */}
        <section style={{ marginBlockEnd: '2.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBlockEnd: 16 }}>Accesos directos</div>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <button
              style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}
              onClick={() => navigate('/passenger/tramite/vehiculo')}
            >
              Nuevo trámite de vehículo
            </button>
            <button
              style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}
              onClick={() => navigate('/passenger/tramite/alimentos')}
            >
              Declarar alimentos o mascotas
            </button>
            <button
              style={{ flex: 1, border: '1.5px solid #222', borderRadius: 8, background: '#fff', color: '#222', padding: '1rem', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer' }}
              onClick={() => navigate('/passenger/tramite/menores')}
            >
              Documentos para menores
            </button>
          </div>
        </section>
        {/* Trámites recientes */}
        <section>
          <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBlockEnd: 16 }}>Trámites recientes</div>
          {loading ? (
            <div style={{ color: '#888', padding: '1.5em' }}>Cargando trámites...</div>
          ) : error ? (
            <div style={{ color: 'red', padding: '1.5em' }}>{error}</div>
          ) : (
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
                {tramitesRecientes.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No hay trámites recientes.</td></tr>
                ) : (
                  tramitesRecientes.map((t, i) => (
                    <tr key={t.id || i} style={{ borderBlockEnd: '1px solid #ccc' }}>
                      <td style={{ padding: '0.6rem' }}>{t.fecha || '---'}</td>
                      <td style={{ padding: '0.6rem' }}>{t.tipo}</td>
                      <td style={{ padding: '0.6rem' }}>{t.estado}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <button style={{ color: '#1976d2', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/passenger/mis-tramites')}>Ver detalles</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
