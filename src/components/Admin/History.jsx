import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { getHistory, generateHistoryReport } from '../../services/api';

// Historial para Administrador
export default function History() {
  const { logout } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState('');
  const [reportRange, setReportRange] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Cargar datos del historial
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getHistory();
        setHistoryData(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar historial: ' + err.message);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Función para generar un reporte PDF
  const handleGenerateReport = async () => {
    if (!reportType || !reportRange) {
      alert('Por favor selecciona el tipo de reporte y el rango');
      return;
    }

    setGeneratingReport(true);
    try {
      // En una implementación real, esto generaría y descargaría un PDF
      await generateHistoryReport(reportType, reportRange);
      
      // Simulamos la descarga de un PDF
      alert(`Reporte ${reportType} generado para el rango ${reportRange}`);
    } catch (err) {
      alert('Error al generar el reporte: ' + err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar role="admin" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        {/* Encabezado con título */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 600, 
            borderBottom: '2px solid #222', 
            paddingBottom: '0.3rem', 
            margin: 0, 
            color: '#222'
          }}>
            Historial completo
          </h1>
        </header>

        {/* Tabla de historial */}
        <section style={{ marginBottom: '2.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando historial...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              {error}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Usuario</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Acción</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>IP</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                      No hay registros en el historial.
                    </td>
                  </tr>
                ) : (
                  historyData.map((entry, index) => (
                    <tr 
                      key={index} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                        borderBottom: '1px solid #e5e5e5'
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>{entry.fecha}</td>
                      <td style={{ padding: '0.75rem' }}>{entry.usuario}</td>
                      <td style={{ padding: '0.75rem' }}>{entry.accion}</td>
                      <td style={{ padding: '0.75rem' }}>{entry.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Paginación */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              &lt;
            </button>
            <span style={{ margin: '0 0.5rem' }}>{currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={historyData.length < 10} // Asumiendo 10 por página
              style={{
                background: 'transparent',
                border: 'none',
                cursor: historyData.length < 10 ? 'default' : 'pointer',
                opacity: historyData.length < 10 ? 0.5 : 1
              }}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Sección de generación de reportes */}
        <section>
          <h2 style={{ fontSize: '1.4rem', marginTop: '2rem', marginBottom: '1.5rem' }}>
            Generar reporte
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Tipo de reporte</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px'
                }}
              >
                <option value="">Selecciona</option>
                <option value="tramites">Trámites</option>
                <option value="usuarios">Usuarios</option>
                <option value="sistema">Sistema</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Rango</label>
              <select
                value={reportRange}
                onChange={(e) => setReportRange(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px'
                }}
              >
                <option value="">Selecciona</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="anio">Último año</option>
              </select>
            </div>
            
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport || !reportType || !reportRange}
              style={{
                background: '#fff',
                border: '1px solid #222',
                borderRadius: '4px',
                padding: '0.5rem 1.2rem',
                fontWeight: '500',
                cursor: generatingReport || !reportType || !reportRange ? 'not-allowed' : 'pointer',
                opacity: generatingReport || !reportType || !reportRange ? 0.7 : 1
              }}
            >
              {generatingReport ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
