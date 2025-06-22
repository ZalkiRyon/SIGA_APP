import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { crearTramiteVehiculo } from '../../services/api';
import '../../styles/global.css';
import './MyProcedures.css';

export default function EditVehicleProcedure() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Recibe tramite y modo desde location.state
  const tramite = location.state?.tramite;
  const [form, setForm] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    fechaInicio: '',
    fechaTermino: '',
    docs: {
      cedula: null,
      licencia: null,
      revision: null,
      salida: null,
      autorizacion: null,
      certificado: null,
      seguro: null,
    },
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Precarga los datos del trámite recibido
  useEffect(() => {
    if (tramite) {
      setForm(f => ({
        ...f,
        patente: tramite.patente || '',
        marca: tramite.marca || '',
        modelo: tramite.modelo || '',
        anio: tramite.anio || '',
        color: tramite.color || '',
        fechaInicio: tramite.fechaInicio || '',
        fechaTermino: tramite.fechaTermino || '',
        docs: {
          cedula: null,
          licencia: null,
          revision: null,
          salida: null,
          autorizacion: null,
          certificado: null,
          seguro: null,
        },
      }));
    }
  }, [tramite]);

  const handleInput = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleDoc = e => {
    setForm(f => ({
      ...f,
      docs: { ...f.docs, [e.target.name]: e.target.files[0] }
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      // Aquí deberías llamar a un endpoint de edición, pero por ahora reutilizamos crearTramiteVehiculo
      await crearTramiteVehiculo(form, user?.id, tramite?.id); // Se puede adaptar para update
      setMensaje('Solicitud editada exitosamente.');
      // Opcional: navegar de vuelta a mis trámites
      // navigate('/passenger/mis-tramites');
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
          <h1 className="tram-title tram-title-nuevo veh-title">Editar Solicitud: Vehículo temporal</h1>
          <div className="tram-header-actions">
            <span className="tram-bell" title="Notificaciones">🔔</span>
            <span className="tram-username">{user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        <form className="veh-form" onSubmit={handleSubmit}>
          <section className="veh-datos">
            <div className="veh-datos-title">Datos del vehículo</div>
            <div className="veh-datos-grid">
              <div className="veh-field"><label>Patente *</label><input name="patente" value={form.patente} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Marca *</label><input name="marca" value={form.marca} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Año *</label><input name="anio" value={form.anio} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Color *</label><input name="color" value={form.color} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Modelo *</label><input name="modelo" value={form.modelo} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Fecha inicio</label><input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleInput} required /></div>
              <div className="veh-field"><label>Fecha término</label><input type="date" name="fechaTermino" value={form.fechaTermino} onChange={handleInput} required className="veh-fecha-termino" /></div>
            </div>
          </section>
          <section className="veh-docs">
            <div className="veh-datos-title">Documentos</div>
            <div className="veh-docs-grid">
              <div className="veh-doc-field">
                <label>Cédula de identidad *</label>
                <input type="file" name="cedula" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Licencia de conducir *</label>
                <input type="file" name="licencia" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Comprobante revisión técnica *</label>
                <input type="file" name="revision" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Formulario de salida *</label>
                <input type="file" name="salida" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Autorización notarial</label>
                <input type="file" name="autorizacion" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Certificado de Inscripción de Vehículos Motorizados*</label>
                <input type="file" name="certificado" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
              </div>
              <div className="veh-doc-field">
                <label>Seguro obligatorio de accidentes personales *</label>
                <input type="file" name="seguro" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDoc} />
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
      </main>
    </div>
  );
}
