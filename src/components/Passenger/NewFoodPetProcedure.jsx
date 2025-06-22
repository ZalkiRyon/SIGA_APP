import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { crearTramiteAlimentos } from '../../services/api';
import '../../styles/global.css';
import './MyProcedures.css';

const TRANSPORTES = [
  'Auto particular',
  'Bus',
  'Avión',
  'Tren',
  'Otro',
];

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

export default function NewFoodPetProcedure() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    tipo: '',
    cantidad: 1,
    transporte: '',
    descripcion: '',
  });
  const [tipoMascota, setTipoMascota] = useState('');
  const [mostrarMascota, setMostrarMascota] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Documentos para mascota
  const [docsMascota, setDocsMascota] = useState({
    registro: null,
    vacunas: null,
    desparasitacion: null,
    zoo: null
  });

  const handleInput = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleTipo = e => {
    setForm(f => ({ ...f, tipo: e.target.value }));
    setMostrarMascota(e.target.value === 'mascota');
  };

  const handleDocMascota = e => {
    setDocsMascota(d => ({ ...d, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      if (form.tipo === 'mascota') {
        await crearTramiteAlimentos(form, user?.id, docsMascota, tipoMascota);
      } else {
        await crearTramiteAlimentos(form, user?.id);
      }
      setModalOpen(true);
      setForm({ tipo: '', cantidad: 1, transporte: '', descripcion: '' });
      setDocsMascota({ registro: null, vacunas: null, desparasitacion: null, zoo: null });
      setTipoMascota('');
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
          <h1 className="tram-title tram-title-nuevo veh-title">Nuevo Trámite: Declaración SAG</h1>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label><input type="radio" name="tipo" value="vegetal" checked={form.tipo === 'vegetal'} onChange={handleTipo} /> Producto origen vegetal</label>
                  <label><input type="radio" name="tipo" value="animal" checked={form.tipo === 'animal'} onChange={handleTipo} /> Producto origen animal</label>
                  <label><input type="radio" name="tipo" value="mascota" checked={form.tipo === 'mascota'} onChange={handleTipo} /> Mascota</label>
                </div>
              </div>
              <div className="veh-field">
                <label>Medio de transporte</label>
                <select name="transporte" value={form.transporte} onChange={handleInput} required>
                  <option value="">Selecciona</option>
                  <option value="Auto particular">Auto particular</option>
                  <option value="Bus">Bus</option>
                  <option value="Avión">Avión</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            {mostrarMascota && (
              <>
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
                    <input type="file" name="registro" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} required />
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado desparasitación *</label>
                    <input type="file" name="desparasitacion" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} required />
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado vacunas *</label>
                    <input type="file" name="vacunas" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} required />
                  </div>
                  <div className="veh-doc-field">
                    <label>Certificado zoo sanitario de exportación *</label>
                    <input type="file" name="zoo" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocMascota} required />
                  </div>
                </div>
              </>
            )}
            {!mostrarMascota && (
              <div className="veh-field" style={{ marginTop: 18 }}>
                <label>Cantidad *</label>
                <input type="number" name="cantidad" min={1} value={form.cantidad} onChange={handleInput} required style={{ width: 60 }} />
              </div>
            )}
            {!mostrarMascota && (
              <div className="veh-field veh-field-descripcion">
                <label>Descripción *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleInput} required style={{ width: '100%', minHeight: 80, fontSize: '1.1em', borderRadius: 6, border: '1.5px solid #222' }} />
              </div>
            )}
          </section>
          <div className="veh-form-actions">
            <button type="button" className="veh-btn-atras" onClick={() => window.history.back()} disabled={enviando}>Atrás</button>
            <button type="submit" className="veh-btn-enviar" disabled={enviando}>Enviar trámite</button>
          </div>
          {mensaje && <div className="veh-mensaje-envio">{mensaje}</div>}
        </form>
        <SuccessModal open={modalOpen} onClose={() => setModalOpen(false)} message="Solicitud creada con éxito." />
      </main>
    </div>
  );
}
