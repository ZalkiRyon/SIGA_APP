import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getTramiteAlimentosById, editarTramiteAlimentos } from '../../services/api';
import '../../styles/global.css';
import './MyProcedures.css';

function SuccessModal({ open, onClose, message }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', padding: '2.5rem 2rem', borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 320,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24
      }}>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{message}</div>
        <button onClick={onClose} style={{ padding: '0.5em 2em', fontSize: 18, borderRadius: 6, background: '#1a4fa3', color: '#fff', border: 'none', cursor: 'pointer' }}>Aceptar</button>
      </div>
    </div>
  );
}

export default function EditFoodPetProcedure() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo: '', cantidad: 1, transporte: '', descripcion: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mostrarMascota, setMostrarMascota] = useState(false);
  const [tipoMascota, setTipoMascota] = useState('');
  const [docsMascota, setDocsMascota] = useState({ registro: null, vacunas: null, desparasitacion: null, zoo: null });
  const [archivosActuales, setArchivosActuales] = useState({});

  useEffect(() => {
    async function fetchTramite() {
      try {
        const tramite = await getTramiteAlimentosById(id);
        setForm(f => ({ ...f, tipo: tramite.tipo || '', cantidad: tramite.cantidad || 1, transporte: tramite.transporte || '', descripcion: tramite.descripcion || '' }));
        setMostrarMascota(tramite.tipo === 'mascota');
        if (tramite.mascota) {
          setTipoMascota(tramite.mascota.tipo_mascota || '');
          setArchivosActuales({
            registro: tramite.mascota.archivo_registro,
            vacunas: tramite.mascota.archivo_vacunas,
            desparasitacion: tramite.mascota.archivo_desparasitacion,
            zoo: tramite.mascota.archivo_zoo
          });
        }
      } catch (err) {
        setMensaje('Error al cargar trámite');
      }
    }
    fetchTramite();
  }, [id]);

  const handleInput = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };
  const handleTipo = e => {
    setForm(f => ({ ...f, tipo: e.target.value }));
  };
  const handleDocMascota = e => {
    setDocsMascota(d => ({ ...d, [e.target.name]: e.target.files[0] }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await editarTramiteAlimentos(form, user?.id, id, docsMascota, tipoMascota);
      setModalOpen(true);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const urlArchivo = (nombre) => nombre ? `http://localhost:4000/api/archivo/alimentos/${nombre}` : null;

  return (
    <div className="tram-page">
      <Sidebar />
      <main className="tram-main tram-main-nuevo">
        <header className="tram-header tram-header-nuevo">
          <h1 className="tram-title tram-title-nuevo veh-title">Editar Solicitud: Declaración SAG</h1>
          <div className="tram-header-actions">
            <span className="tram-bell" title="Notificaciones">🔔</span>
            <span className="tram-username">{user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        <form className="veh-form" onSubmit={handleSubmit}>
          <section className="veh-datos">
            <div className="veh-datos-title">Datos a declarar</div>
            <div className="veh-datos-grid">
              <div className="veh-field">
                <label>Tipo *</label>
                <select name="tipo" value={form.tipo} onChange={handleTipo} required>
                  <option value="">Seleccione</option>
                  <option value="vegetal">Vegetal</option>
                  <option value="animal">Animal</option>
                  <option value="mascota">Mascota</option>
                </select>
              </div>
              <div className="veh-field">
                <label>Cantidad *</label>
                <input type="number" name="cantidad" value={form.cantidad} onChange={handleInput} min={1} required />
              </div>
              <div className="veh-field">
                <label>Transporte *</label>
                <input name="transporte" value={form.transporte} onChange={handleInput} required />
              </div>
              <div className="veh-field veh-field-descripcion">
                <label>Descripción *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleInput} required />
              </div>
            </div>
          </section>
          {mostrarMascota && (
            <section className="veh-mascota">
              <div className="veh-datos-title">Datos de la mascota</div>
              <div className="veh-datos-grid">
                <div className="veh-field" style={{ marginTop: 16 }}>
                  <label>Tipo de mascota</label>
                  <select value={tipoMascota} onChange={e => setTipoMascota(e.target.value)}>
                    <option value="">Selecciona</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="veh-info" style={{ marginTop: 16, marginBottom: 16, maxWidth: 600 }}>
                  <span className="veh-info-icon">i</span>
                  <span>Toda mascota debe tener un identificador ya sea un collar, un tatuaje, etc... Para mayor información <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>revise la documentación aquí</a></span>
                </div>
                <div style={{ fontWeight: 500, fontSize: 20, margin: '18px 0 10px 0' }}>Documentos</div>
                <div className="veh-docs-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="veh-doc-field">
                    <label>Registro nacional de mascotas*</label>
                    <input type="file" name="registro" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} />
                    {archivosActuales.registro && <a href={urlArchivo(archivosActuales.registro)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1976d2', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>Descargar actual</a>}
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado desparasitación *</label>
                    <input type="file" name="desparasitacion" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} />
                    {archivosActuales.desparasitacion && <a href={urlArchivo(archivosActuales.desparasitacion)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1976d2', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>Descargar actual</a>}
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado vacunas *</label>
                    <input type="file" name="vacunas" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} />
                    {archivosActuales.vacunas && <a href={urlArchivo(archivosActuales.vacunas)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1976d2', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>Descargar actual</a>}
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado zoo sanitario de exportación *</label>
                    <input type="file" name="zoo" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} />
                    {archivosActuales.zoo && <a href={urlArchivo(archivosActuales.zoo)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1976d2', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>Descargar actual</a>}
                  </div>
                </div>
              </div>
            </section>
          )}
          <div className="veh-form-actions">
            <button type="button" className="veh-btn-atras" onClick={() => navigate(-1)} disabled={enviando}>Atrás</button>
            <button type="submit" className="veh-btn-enviar" disabled={enviando}>Editar solicitud</button>
          </div>
          {mensaje && <div className="veh-mensaje-envio">{mensaje}</div>}
        </form>
        <SuccessModal open={modalOpen} onClose={() => setModalOpen(false)} message="Solicitud editada exitosamente." />
      </main>
    </div>
  );
}
