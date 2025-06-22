import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { crearTramiteMenores } from '../../services/api';
import '../../styles/global.css';
import './MyProcedures.css';

export default function NewMinorProcedure() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    menorNombres: '',
    menorApellidos: '',
    menorRut: '',
    menorNacimiento: '',
    acompNombres: '',
    acompApellidos: '',
    acompRut: '',
    docIdentidad: null,
    docAutorizacion: null,
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleInput = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleDoc = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.files[0] }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await crearTramiteMenores(form, user?.id);
      setMensaje('Trámite enviado exitosamente.');
      setForm({
        menorNombres: '', menorApellidos: '', menorRut: '', menorNacimiento: '',
        acompNombres: '', acompApellidos: '', acompRut: '',
        docIdentidad: null, docAutorizacion: null
      });
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
          <h1 className="tram-title tram-title-nuevo veh-title">Nuevo Trámite: Documentación menores</h1>
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
              <div className="veh-field"><label>Fecha nacimiento</label><input type="date" name="menorNacimiento" value={form.menorNacimiento} onChange={handleInput} required /></div>
            </div>
          </section>
          <section className="veh-datos">
            <div className="veh-datos-title">Datos del acompañante</div>
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
                <label>Cédula identidad o Pasaporte (Vigente) *</label>
                <input type="file" name="docIdentidad" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} required />
              </div>
              <div className="veh-doc-field">
                <label>Autorización notarial *</label>
                <input type="file" name="docAutorizacion" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} required />
              </div>
            </div>
          </section>
          <div className="veh-form-actions">
            <button type="button" className="veh-btn-atras" onClick={() => window.history.back()} disabled={enviando}>Atrás</button>
            <button type="submit" className="veh-btn-enviar" disabled={enviando}>Enviar trámite</button>
          </div>
          {mensaje && <div className="veh-mensaje-envio">{mensaje}</div>}
        </form>
      </main>
    </div>
  );
}
