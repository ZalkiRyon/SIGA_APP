import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Reports.css';

// Reportes para Funcionario Aduanero
export default function Reports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    tipoMovimiento: '',
    frontera: '',
    fechaInicio: '30/05/2025',
    fechaTermino: '30/06/2025',
    tipoGrafico: ''
  });
  const [showPreview, setShowPreview] = useState(true);
  const [exportName, setExportName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData({
      ...reportData,
      [name]: value
    });
  };

  const handleGenerar = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para generar el reporte
    setShowPreview(true);
  };

  const handleLimpiar = () => {
    setReportData({
      tipoMovimiento: '',
      frontera: '',
      fechaInicio: '30/05/2025',
      fechaTermino: '30/06/2025',
      tipoGrafico: ''
    });
  };

  const handleExport = (format) => {
    // Lógica para exportar en diferentes formatos
    console.log(`Exportando como ${format}: ${exportName}`);
  };

  return (
    <div className="reports-container">
      <Sidebar role="officer" />
      <div className="reports-content">
        <header className="reports-header">
          <div>
            <h1 className="page-title">
              Generar reporte
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="notification-badge">
              <span className="badge-icon"></span>
              <span role="img" aria-label="notifications" style={{ fontSize: '1.5rem' }}>🔔</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
              <span className="user-avatar">
                {user?.nombre?.charAt(0) || 'A'}
              </span>
              <span style={{ marginLeft: '0.5rem' }}>Aduanero</span>
            </div>
          </div>
        </header>

        {/* Formulario de generación de reportes */}
        <div className="report-panel">
          <form onSubmit={handleGenerar}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipoMovimiento">Tipo de movimiento</label>
                <select
                  id="tipoMovimiento"
                  name="tipoMovimiento"
                  className="form-control"
                  value={reportData.tipoMovimiento}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="fechaInicio">Fecha inicio</label>
                <div className="date-input-container">
                  <input
                    type="text"
                    id="fechaInicio"
                    name="fechaInicio"
                    className="form-control date-input"
                    value={reportData.fechaInicio}
                    onChange={handleChange}
                  />
                  <span className="calendar-icon">📅</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="fechaTermino">Fecha término</label>
                <div className="date-input-container">
                  <input
                    type="text"
                    id="fechaTermino"
                    name="fechaTermino"
                    className="form-control date-input"
                    value={reportData.fechaTermino}
                    onChange={handleChange}
                  />
                  <span className="calendar-icon">📅</span>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frontera">Frontera</label>
                <select
                  id="frontera"
                  name="frontera"
                  className="form-control"
                  value={reportData.frontera}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="arica">Arica</option>
                  <option value="chacalluta">Chacalluta</option>
                  <option value="colchane">Colchane</option>
                  <option value="losLibertadores">Los Libertadores</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="tipoGrafico">Tipo de gráfico</label>
                <select
                  id="tipoGrafico"
                  name="tipoGrafico"
                  className="form-control"
                  value={reportData.tipoGrafico}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="barras">Barras</option>
                  <option value="lineas">Líneas</option>
                  <option value="torta">Torta</option>
                </select>
              </div>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div className="button-container">
                  <button type="button" onClick={handleLimpiar} className="btn-clear">
                    Limpiar
                  </button>
                  <button type="submit" className="btn-generate">
                    Generar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Vista previa del reporte */}
        {showPreview && (
          <div className="preview-section">
            <h2 className="preview-title">Vista previa</h2>
            <div className="report-preview-container">
              {/* Área del gráfico */}
              <div className="chart-container">
                {/* Aquí se renderizaría el gráfico */}
                <svg width="100%" height="250" style={{ display: 'block' }}>
                  {/* Gráfico de barras de ejemplo */}
                  <rect x="10%" y="50" width="15%" height="50" fill="#aaaaaa" />
                  <rect x="30%" y="30" width="15%" height="70" fill="#888888" />
                  <rect x="50%" y="10" width="15%" height="90" fill="#aaaaaa" />
                  <rect x="70%" y="40" width="15%" height="60" fill="#888888" />
                  
                  {/* Eje X */}
                  <line x1="5%" y1="150" x2="95%" y2="150" stroke="#333" strokeWidth="2" />
                  
                  {/* Eje Y */}
                  <line x1="5%" y1="10" x2="5%" y2="150" stroke="#333" strokeWidth="2" />
                </svg>
              </div>
              
              {/* Panel de exportación */}
              <div className="export-container">
                <input
                  type="text"
                  placeholder="Ingrese nombre para exportar el reporte"
                  className="export-input"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                />
                <div className="export-buttons">
                  <button
                    className="export-btn"
                    onClick={() => handleExport('PDF')}
                  >
                    Exportar como PDF
                  </button>
                  <button
                    className="export-btn"
                    onClick={() => handleExport('CSV')}
                  >
                    Exportar como CSV
                  </button>
                  <button
                    className="export-btn"
                    onClick={() => handleExport('Excel')}
                  >
                    Exportar como Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
