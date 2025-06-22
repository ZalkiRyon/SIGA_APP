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

export default function NewFoodPetProcedure() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    tipo: '',
    cantidad: 1,
    transporte: '',
    descripcion: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleInput = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleTipo = e => {
    setForm(f => ({ ...f, tipo: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await crearTramiteAlimentos(form, user?.id);
      setMensaje('Trámite enviado exitosamente.');
      setForm({ tipo: '', cantidad: 1, transporte: '', descripcion: '' });
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
                <label>Tipo</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label><input type="radio" name="tipo" value="vegetal" checked={form.tipo === 'vegetal'} onChange={handleTipo} required /> Producto origen vegetal</label>
                  <label><input type="radio" name="tipo" value="animal" checked={form.tipo === 'animal'} onChange={handleTipo} required /> Producto origen animal</label>
                  <label><input type="radio" name="tipo" value="mascota" checked={form.tipo === 'mascota'} onChange={handleTipo} required /> Mascota</label>
                </div>
              </div>
              <div className="veh-field">
                <label>Medio de transporte</label>
                <select name="transporte" value={form.transporte} onChange={handleInput} required>
                  <option value="">Selecciona</option>
                  {TRANSPORTES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="veh-field">
                <label>Cantidad</label>
                <input type="number" name="cantidad" min={1} value={form.cantidad} onChange={handleInput} required style={{ width: 60 }} />
              </div>
            </div>
            <div className="veh-info" style={{ marginTop: 16 }}>
              <span className="veh-info-icon">i</span>
              <a href="#" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }} target="_blank" rel="noopener noreferrer">Revisa la lista de productos prohibidos</a>
            </div>
            <div className="veh-field" style={{ marginTop: 18 }}>
              <label>Descripción *</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleInput} required style={{ width: '100%', minHeight: 80, fontSize: '1.1em', borderRadius: 6, border: '1.5px solid #222', padding: 8 }} />
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
