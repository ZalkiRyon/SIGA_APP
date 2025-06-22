import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css';
import './MyProcedures.css'; // Asegúrate de crear este archivo para los estilos específicos

const MOCK_DATA = [
  {
    id: '#TR-5872',
    fechaInicio: '18/05/2025',
    fechaTermino: '18/05/2025',
    tipo: 'Vehículo temporal',
    estado: 'Aprobado',
    acciones: ['Ver', 'Descargar'],
  },
  {
    id: '#TR-5910',
    fechaInicio: '17/05/2025',
    fechaTermino: '---',
    tipo: 'Declaración SAG',
    estado: 'En revisión',
    acciones: ['Ver', 'Editar'],
  },
  {
    id: '#TR-6011',
    fechaInicio: '05/05/2025',
    fechaTermino: '---',
    tipo: 'Documentación Menor',
    estado: 'Rechazado',
    acciones: ['Ver', 'Corregir'],
  },
];

const ESTADOS = ['Aprobado', 'En revisión', 'Rechazado'];
const TIPOS = ['Vehículos', 'Mascotas o alimentos', 'Menores de edad'];

export default function MyProcedures() {
  const { user } = useAuth();
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroTermino, setFiltroTermino] = useState('');
  const [filtroEstados, setFiltroEstados] = useState([]);
  const [filtroTipos, setFiltroTipos] = useState([]);

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
  // Filtro visual (mock)
  const filtered = MOCK_DATA.filter((p) => {
    const matchEstado = filtroEstados.length === 0 || filtroEstados.includes(p.estado);
    const matchTipo = filtroTipos.length === 0 ||
      (filtroTipos.includes('Vehículos') && p.tipo.toLowerCase().includes('veh')) ||
      (filtroTipos.includes('Mascotas o alimentos') && (p.tipo.toLowerCase().includes('sag') || p.tipo.toLowerCase().includes('mascota') || p.tipo.toLowerCase().includes('alimento')) ) ||
      (filtroTipos.includes('Menores de edad') && p.tipo.toLowerCase().includes('menor'));
    const matchInicio = !filtroInicio || p.fechaInicio.split('/').reverse().join('-') >= filtroInicio;
    const matchTermino = !filtroTermino || (p.fechaTermino !== '---' && p.fechaTermino.split('/').reverse().join('-') <= filtroTermino);
    return matchEstado && matchTipo && matchInicio && matchTermino;
  });

  return (
    <div className="tram-page" style={{display: 'flex', blockSize: '100vh', background: '#fff'}}>
      <Sidebar />
      <main className="tram-main">
        <header className="tram-header">
          <h1 className="tram-title">Mis trámites</h1>
          <div className="tram-header-actions">
            <button className="tram-btn-nuevo">Crear nuevo trámite</button>
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
                      <td>{p.id}</td>
                      <td>{p.fechaInicio}</td>
                      <td>{p.fechaTermino}</td>
                      <td>{p.tipo}</td>
                      <td>{p.estado}</td>
                      <td>
                        {p.acciones.map((a) => (
                          <button key={a} className={`tram-btn-link tram-btn-${a.toLowerCase()}`}>{a}</button>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
