import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getTramiteMenoresById, editarTramiteMenores } from '../../services/api';
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

export default function EditMinorProcedure() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    menorNombres: '', menorApellidos: '', menorRut: '', menorNacimiento: '',
    acompNombres: '', acompApellidos: '', acompRut: '',
    docs: { docIdentidad: null, docAutorizacion: null },
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTramite() {
      try {
        const tramite = await getTramiteMenoresById(id);
        setForm(f => ({
          ...f,
          menorNombres: tramite.menorNombres || '',
          menorApellidos: tramite.menorApellidos || '',
          menorRut: tramite.menorRut || '',
          menorNacimiento: tramite.menorNacimiento || '',
          acompNombres: tramite.acompNombres || '',
          acompApellidos: tramite.acompApellidos || '',
          acompRut: tramite.acompRut || '',
          docs: { docIdentidad: null, docAutorizacion: null },
        }));
      } catch (err) {
        setMensaje('Error al cargar trámite');
      }
    }
    fetchTramite();
  }, [id]);

  const handleInput = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleDoc = e => {
    setForm(f => ({ ...f, docs: { ...f.docs, [e.target.name]: e.target.files[0] } }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await editarTramiteMenores(form, user?.id, id);
      setModalOpen(true);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="tram-page">
      <Sidebar />
      <main className="tram-main tram-main-nuevo">
        <header className="tram-header tram-header-nuevo">
          <h1 className="tram-title tram-title-nuevo veh-title">Editar Solicitud: Documentación menores</h1>
          <div className="tram-header-actions">
            <span className="tram-bell" title="Notificaciones">🔔</span>
            <span className="tram-username">{user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        <form className="veh-form" onSubmit={handleSubmit}>
          <section className="veh-datos">
            <div className="veh-datos-title">Datos del menor</div>
            <div className="veh-datos-grid">
              <div className="veh-field"><label>Nombres *</label><input name="menorNombres" value={form.menorNombres} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Apellidos *</label><input name="menorApellidos" value={form.menorApellidos} onChange={handleInput} required /></div>
              <div className="veh-field"><label>RUT *</label><input name="menorRut" value={form.menorRut} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Fecha nacimiento *</label><input type="date" name="menorNacimiento" value={form.menorNacimiento} onChange={handleInput} required /></div>
            </div>
            <div className="veh-datos-title">Acompañante</div>
            <div className="veh-datos-grid">
              <div className="veh-field"><label>Nombres *</label><input name="acompNombres" value={form.acompNombres} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Apellidos *</label><input name="acompApellidos" value={form.acompApellidos} onChange={handleInput} required /></div>
              <div className="veh-field"><label>RUT *</label><input name="acompRut" value={form.acompRut} onChange={handleInput} required /></div>
            </div>
          </section>
          <section className="veh-docs">
            <div className="veh-datos-title">Documentos</div>
            <div className="veh-docs-grid">
              <div className="veh-doc-field">
                <label>Documento de identidad *</label>
                <input type="file" name="docIdentidad" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Autorización notarial *</label>
                <input type="file" name="docAutorizacion" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
            </div>
            <div className="veh-info">
              <span className="veh-info-icon">i</span>
              <span>Puedes actualizar los documentos si es necesario.</span>
            </div>
          </section>
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
