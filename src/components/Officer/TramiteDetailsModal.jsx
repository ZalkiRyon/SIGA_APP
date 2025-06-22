import React from 'react';
import './TramiteDetailsModal.css';

export default function TramiteDetailsModal({ tramite, onClose }) {
  if (!tramite) return null;
  
  return (
    <div className="tramite-modal-overlay" onClick={onClose}>
      <div className="tramite-modal-content" onClick={e => e.stopPropagation()}>
        <div className="tramite-modal-header">
          <h2>Detalles del Trámite: {tramite.id}</h2>
          <button className="tramite-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tramite-modal-body">
          <div className="tramite-info-section">
            <h3>Información General</h3>
            <div className="tramite-info-grid">
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{tramite.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{tramite.tipo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <span className={`info-value status-${tramite.estado === 'Rechazado' ? 'rechazado' : 'revision'}`}>
                  {tramite.estado}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha de Inicio:</span>
                <span className="info-value">{tramite.fechaInicio}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha de Creación:</span>
                <span className="info-value">{tramite.fechaCreacion || 'No disponible'}</span>
              </div>
            </div>
          </div>

          <div className="tramite-info-section">
            <h3>Solicitante</h3>
            <div className="tramite-info-grid">
              {tramite.solicitante && (
                <>
                  <div className="info-item">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{tramite.solicitante.nombre}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">RUT:</span>
                    <span className="info-value">{tramite.solicitante.rut}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{tramite.solicitante.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{tramite.solicitante.telefono || 'No disponible'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {tramite.detalles && (
            <div className="tramite-info-section">
              <h3>Detalles del Trámite</h3>
              <div className="tramite-info-grid">
                {Object.entries(tramite.detalles).map(([key, value]) => (
                  <div className="info-item" key={key}>
                    <span className="info-label">{formatLabel(key)}:</span>
                    <span className="info-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tramite.documentos && tramite.documentos.length > 0 && (
            <div className="tramite-info-section">
              <h3>Documentación</h3>
              <div className="tramite-docs-list">
                {tramite.documentos.map((doc, index) => (
                  <div className="doc-item" key={index}>
                    <span className="doc-icon">📄</span>
                    <span className="doc-name">{doc.nombre}</span>
                    <button className="doc-button">Ver</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tramite.estado === 'En revisión' && (
            <div className="tramite-actions">
              <button className="btn-aprobar">Aprobar Trámite</button>
              <button className="btn-rechazar">Rechazar Trámite</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatLabel(key) {
  const labels = {
    patente: 'Patente',
    marca: 'Marca',
    modelo: 'Modelo',
    anio: 'Año',
    color: 'Color',
    fechaInicio: 'Fecha inicio',
    fechaTermino: 'Fecha término',
    tipo: 'Tipo',
    cantidad: 'Cantidad',
    transporte: 'Transporte',
    descripcion: 'Descripción',
    menorNombre: 'Nombre del menor',
    menorApellidos: 'Apellidos del menor',
    menorRut: 'RUT del menor',
    menorNacimiento: 'Fecha nacimiento',
    acompNombre: 'Nombre acompañante',
    acompApellidos: 'Apellidos acompañante',
    acompRut: 'RUT acompañante'
  };

  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}
