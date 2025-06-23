import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTramitesVehiculo, getTramitesMenores, getTramitesAlimentos } from '../../services/api';
import '../../styles/global.css';
import './MyProcedures.css'; // Asegúrate de crear este archivo para los estilos específicos

const ESTADOS = ['Aprobado', 'En revisión', 'Rechazado'];
const TIPOS = ['Vehículos', 'Mascotas o alimentos', 'Menores de edad'];

export default function MyProcedures() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroTermino, setFiltroTermino] = useState('');
  const [filtroEstados, setFiltroEstados] = useState([]);
  const [filtroTipos, setFiltroTipos] = useState([]);
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Unificamos todos los tipos para la tabla
        const all = [
          ...vehiculo.map(t => ({
            ...t,
            fechaInicio: t.fechaInicio,
            fechaTermino: t.fechaTermino,
            tipo: 'Vehículos',
          })),
          ...menores.map(t => ({
            ...t,
            fechaInicio: t.menorNacimiento,
            fechaTermino: '',
            tipo: 'Menores de edad',
          })).filter(t => t.menorNombres && t.menorApellidos && t.menorRut), // Solo trámites válidos
          ...alimentos
            .filter(t => t && (t.tipo === 'mascota' || t.tipo === 'animal' || t.tipo === 'vegetal'))
            .map(t => ({
              ...t,
              tipo: 'Mascotas o alimentos',
              // Usamos los campos que vienen directamente del backend
              fechaInicio: t.fechaInicio,
              fechaTermino: t.fechaTermino || '',
            }))
        ];
        setTramites(all);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    if (user?.id) fetchTramites();
  }, [user]);

  const handleEstado = (estado) => {
    setFiltroEstados((prev) =>
      prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]
    );
  };
  const handleTipo = (tipo) => {
    setFiltroTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };
  const limpiarFiltros = () => {
    setFiltroInicio('');
    setFiltroTermino('');
    setFiltroEstados([]);
    setFiltroTipos([]);
  };
  // Filtros sobre tramites reales
  const filtered = tramites.filter((p) => {
    const matchEstado = filtroEstados.length === 0 || filtroEstados.includes(p.estado);
    const matchTipo = filtroTipos.length === 0 || filtroTipos.includes(p.tipo);
    const matchInicio = !filtroInicio || (p.fechaInicio && p.fechaInicio >= filtroInicio);
    const matchTermino = !filtroTermino || (p.fechaTermino && p.fechaTermino <= filtroTermino);
    return matchEstado && matchTipo && matchInicio && matchTermino;
  });

  function ArchivoLinks({ tipo, archivos }) {
    const [error, setError] = React.useState(null);
    if (!archivos) return null;
    const handleClick = async (e, url) => {
      setError(null);
      try {
        // Intentar abrir en nueva pestaña, pero si hay error de red, mostrar feedback
        const resp = await fetch(url, { method: 'HEAD' });
        if (!resp.ok) throw new Error('Archivo no disponible');
        window.open(url, '_blank', 'noopener');
      } catch (err) {
        setError('No se pudo abrir o descargar el archivo. Intenta más tarde.');
        e.preventDefault();
      }
    };
    if (tipo === 'Vehículos' || tipo === 'Vehículo temporal') {
      const labels = {
        cedula: 'Cédula',
        licencia: 'Licencia',
        revision: 'Revisión técnica',
        salida: 'Formulario salida',
        autorizacion: 'Autorización',
        certificado: 'Certificado inscripción',
        seguro: 'Seguro obligatorio',
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(archivos).map(([k, v]) => v && (
              <span key={k}>
                <a className="tram-btn-link" href={`http://localhost:4000/api/archivo/vehiculo/${v}`} target="_blank" rel="noopener noreferrer" onClick={e => handleClick(e, `http://localhost:4000/api/archivo/vehiculo/${v}`)}>{labels[k] || k}</a>
              </span>
            ))}
          </div>
          {error && <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{error}</div>}
        </div>
      );
    }
    if (tipo === 'Menores de edad') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {archivos.identidad && (
              <a className="tram-btn-link" href={`http://localhost:4000/api/archivo/menores/${archivos.identidad}`} target="_blank" rel="noopener noreferrer" onClick={e => handleClick(e, `http://localhost:4000/api/archivo/menores/${archivos.identidad}`)}>Identidad</a>
            )}
            {archivos.autorizacion && (
              <a className="tram-btn-link" href={`http://localhost:4000/api/archivo/menores/${archivos.autorizacion}`} target="_blank" rel="noopener noreferrer" onClick={e => handleClick(e, `http://localhost:4000/api/archivo/menores/${archivos.autorizacion}`)}>Autorización</a>
            )}
          </div>
          {error && <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{error}</div>}
        </div>
      );
    }
    return null;
  }

  function AccionTramite({ tramite }) {
    const handleEditar = () => {
      let ruta = '';
      if (tramite.tipo === 'Vehículos') ruta = `/passenger/tramite/vehiculo/edit/${tramite.id}`;
      else if (tramite.tipo === 'Menores de edad') ruta = `/passenger/tramite/menores/edit/${tramite.id}`;
      else if (tramite.tipo === 'Mascotas o alimentos') ruta = `/passenger/tramite/alimentos/edit/${tramite.id}`;
      navigate(ruta);
    };
    if (tramite.estado === 'Aprobado') {
      if (tramite.archivos && Object.values(tramite.archivos).some(Boolean)) {
        return (
          <button className="tram-btn tram-btn-descargar" onClick={() => window.open(Object.values(tramite.archivos).find(Boolean) ? `http://localhost:4000/api/archivo/${tramite.tipo === 'Vehículos' ? 'vehiculo' : tramite.tipo === 'Menores de edad' ? 'menores' : 'alimentos'}/${Object.values(tramite.archivos).find(Boolean)}` : '#', '_blank', 'noopener')}>Descargar</button>
        );
      }
      return <span style={{ color: '#888' }}>Sin archivos</span>;
    }
    if (tramite.estado === 'En revisión') {
      return <button className="tram-btn tram-btn-editar" onClick={handleEditar}>Editar</button>;
    }
    if (tramite.estado === 'Rechazado') {
      return <button className="tram-btn tram-btn-corregir" onClick={() => alert('Funcionalidad de corrección próximamente')}>Corregir</button>;
    }
    return null;
  }

  return (
    <div className="tram-page" style={{display: 'flex', blockSize: '100vh', background: '#fff'}}>
      <Sidebar role="passenger" onLogout={logout} />
      <main className="tram-main">
        <header className="tram-header">
          <h1 className="tram-title">Mis trámites</h1>
          <div className="tram-header-actions">
            <button
              className="tram-btn tram-btn-nuevo"
              onClick={() => navigate('/passenger/tramite/nuevo')}
            >
              Crear nuevo trámite
            </button>
            <span className="tram-bell" title="Notificaciones">🔔</span>
            <span className="tram-username">{user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        <section className="tram-filtros-box">
          <div className="tram-filtros-title">Filtros</div>
          <div className="tram-filtros-row">
            <div className="tram-filtro-group">
              <label>Fecha inicio</label>
              <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
            </div>
            <div className="tram-filtro-group">
              <label>Fecha termino</label>
              <input type="date" value={filtroTermino} onChange={e => setFiltroTermino(e.target.value)} />
            </div>
            <div className="tram-filtro-group">
              <label>Estado</label>
              <div className="tram-checkboxes">
                {ESTADOS.map(e => (
                  <label key={e} className="tram-checkbox-label">
                    <input type="checkbox" checked={filtroEstados.includes(e)} onChange={() => handleEstado(e)} /> {e}
                  </label>
                ))}
              </div>
            </div>
            <div className="tram-filtro-group">
              <label>Tipo de trámite</label>
              <div className="tram-checkboxes">
                {TIPOS.map(t => (
                  <label key={t} className="tram-checkbox-label">
                    <input type="checkbox" checked={filtroTipos.includes(t)} onChange={() => handleTipo(t)} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="tram-filtro-btns tram-filtro-btns-inline">
              <button className="tram-btn tram-btn-limpiar" onClick={limpiarFiltros}>Limpiar</button>
            </div>
          </div>
        </section>
        <section className="tram-table-section">
          <div className="tram-table-wrap">
            {loading ? (
              <div style={{textAlign: 'center', color: '#888', padding: '2em'}}>Cargando trámites...</div>
            ) : error ? (
              <div style={{textAlign: 'center', color: 'red', padding: '2em'}}>{error}</div>
            ) : (
            <table className="tram-table">
              <thead>
                <tr>
                  <th>ID Trámite</th>
                  <th>Fecha inicio</th>
                  <th>Fecha termino</th>
                  <th>Tipo trámite</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                      No se encontraron trámites.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td> {/* custom_id ya viene como id desde el backend */}
                      <td>{p.fechaInicio}</td>
                      <td>{p.fechaTermino || '---'}</td>
                      <td>{p.tipo}</td>
                      <td>{p.estado}</td>
                      <td>
                        <ArchivoLinks tipo={p.tipo} archivos={p.archivos} />
                        <AccionTramite tramite={p} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>
        </section>
        <footer className="tram-pagination">
          <span>{'<'}</span> <span>1</span> <span>{'>'}</span>
        </footer>
      </main>
    </div>
  );
}

/*
CSS sugerido (agregar en global.css o un archivo dedicado):

.tram-page { display: flex; min-height: 100vh; background: #fff; }
.tram-main { flex: 1; padding: 2.5rem 2.5rem 2rem 2.5rem; }
.tram-header { display: flex; align-items: center; justify-content: flex-start; gap: 2.5rem; margin-bottom: 1.5rem; position: relative; }
.tram-title { font-size: 2.5rem; font-weight: 500; border-bottom: 3px solid #222; padding-bottom: 0.2em; flex: 1; }
.tram-header-user { display: flex; align-items: center; gap: 0.7rem; margin-left: auto; }
.tram-bell { font-size: 1.5rem; position: relative; }
.tram-bell-dot { display: inline-block; width: 10px; height: 10px; background: #ffe600; border-radius: 50%; position: absolute; top: 0; right: -7px; border: 1.5px solid #222; }
.tram-user-circle { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #222; font-weight: 600; font-size: 1.1rem; background: #fff; }
.tram-username { font-size: 1.1rem; font-weight: 400; margin-left: 0.5rem; }
.tram-btn-nuevo { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: #fff; border: 2px solid #222; border-radius: 7px; font-size: 1.1em; padding: 0.7em 2.2em; font-weight: 500; box-shadow: 2px 2px 0 #222; }
.tram-filtros-box { border: 2px solid #222; border-radius: 6px; background: #fff; padding: 1.2rem 1.5rem; margin-bottom: 2.2rem; }
.tram-filtros-title { font-size: 1.2rem; font-weight: 500; margin-bottom: 0.7rem; border-bottom: 1px solid #888; }
.tram-filtros-row { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-end; }
.tram-filtro-group { display: flex; flex-direction: column; gap: 0.3rem; min-width: 140px; }
.tram-checkboxes { display: flex; flex-direction: column; gap: 0.2rem; }
.tram-checkbox-label { font-size: 1em; }
.tram-filtro-btns { display: flex; flex-direction: column; gap: 0.5rem; margin-left: 2rem; }
.tram-filtro-btns-inline { display: flex; gap: 1rem; margin-left: 0; }
.tram-btn { background: #fff; border: 2px solid #222; border-radius: 4px; padding: 0.4em 1.2em; font-size: 1em; cursor: pointer; font-weight: 500; box-shadow: 1px 1px 0 #222; }
.tram-btn-link { background: none; border: none; color: #1a4fa3; text-decoration: underline; font-size: 1em; cursor: pointer; margin-right: 0.7em; }
.tram-btn-descargar { color: #222; }
.tram-btn-editar { color: #eab308; }
.tram-btn-corregir { color: #dc2626; }
.tram-table-section { margin-top: 1.5rem; }
.tram-table-wrap { overflow-x: auto; }
.tram-table { width: 100%; border-collapse: collapse; background: #fff; }
.tram-table th, .tram-table td { border: 1.5px solid #222; padding: 0.7em 1em; text-align: left; }
.tram-table th { background: #f4f7fa; font-weight: 500; }
.tram-pagination { margin-top: 1.2rem; text-align: left; font-size: 1.1em; }
@media (max-width: 900px) {
  .tram-main { padding: 1rem; }
  .tram-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .tram-btn-nuevo { position: static; transform: none; margin-top: 1rem; }
  .tram-filtros-row { flex-direction: column; gap: 1.2rem; }
  .tram-filtro-btns { margin-left: 0; flex-direction: row; gap: 1rem; }
}
*/
