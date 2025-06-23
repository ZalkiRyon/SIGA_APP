import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getTramitesValidacion, getTramiteDetalles } from '../../services/api';
import TramiteDetailsModal from './TramiteDetailsModal';
import './Validation.css';

// Validación para Funcionario Aduanero
export default function Validation() {
  const { user, logout } = useAuth();
  // Estado para almacenar la búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('30/05/2025');
  const [currentPage, setCurrentPage] = useState(1);
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Estado para el modal de detalles
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
    // Cargar datos de trámites
  useEffect(() => {
    const loadTramites = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar el servicio de API para obtener los trámites
        const response = await getTramitesValidacion({
          search: searchTerm,
          tipo: selectedType,
          fechaInicio: startDate,
          page: currentPage,
          limit: 10
        });
        
        setTramites(response.tramites || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar trámites:', err);
        setError('Error al cargar los trámites. ' + (err.message || 'Inténtelo de nuevo más tarde.'));
        setLoading(false);
        setTramites([]);
      }
    };

    loadTramites();
  }, [currentPage]); // Solo se recarga cuando cambia la página
  // Filtrar trámites
  const handleFilter = async () => {
    setCurrentPage(1); // Volver a la primera página al filtrar
    try {
      setLoading(true);
      setError(null);
      const response = await getTramitesValidacion({
        search: searchTerm,
        tipo: selectedType,
        fechaInicio: startDate,
        page: 1,
        limit: 10
      });
      
      setTramites(response.tramites || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error al filtrar trámites:', err);
      setError('Error al filtrar los trámites. ' + (err.message || 'Inténtelo de nuevo más tarde.'));
      setTramites([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros
  const handleClearFilter = () => {
    setSearchTerm('');
    setSelectedType('');
    // No limpiamos la fecha para mantenerla como en la imagen de ejemplo
  };
  // Ver detalles de un trámite
  const handleVerTramite = async (tramiteId) => {
    try {
      setLoadingDetails(true);
      const detalles = await getTramiteDetalles(tramiteId);
      setSelectedTramite(detalles);
      setShowModal(true);
    } catch (err) {
      console.error('Error al cargar detalles del trámite:', err);
      alert('No se pudieron cargar los detalles del trámite. ' + (err.message || ''));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTramite(null);
  };

  return (
    <div className="validation-container">
      <Sidebar role="officer" onLogout={logout} />
      <div className="validation-content">        <header className="validation-header">
          <div>
            <h1 className="page-title">
              Validación de trámites
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="notification-badge">
              <span className="badge-icon"></span>
              <span role="img" aria-label="notifications" style={{ fontSize: '1.5rem' }}>🔔</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
              <span className="user-avatar">
                {user?.nombre?.charAt(0) || 'F'}
              </span>
              <span style={{ marginLeft: '0.5rem' }}>Aduanero</span>
            </div>
          </div>
        </header>        {/* Filtros */}
        <div className="filter-panel">
          <h2 className="filter-title">Filtros</h2>
          <div className="filters-container">
            <div className="filter-group">
              <div className="search-input-container">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="">Tipo de trámite</option>
                <option value="vehiculo">Vehículo temporal</option>
                <option value="sag">Declaración SAG</option>
                <option value="menor">Documentación Menor</option>
              </select>
            </div>

            <div className="filter-group fecha-container">
              <div className="fecha-label">Fecha inicio</div>
              <div className="date-input-container">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
                <span className="calendar-icon">📅</span>
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={handleFilter}
                className="btn-filter"
                disabled={loading}
              >
                Filtrar
              </button>
              <button
                onClick={handleClearFilter}
                className="btn-clear"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de error si existe */}
        {error && (
          <div style={{ color: 'red', padding: '1rem', marginBottom: '1rem', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* Tabla de trámites */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando trámites...
            </div>
          ) : tramites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              No se encontraron trámites con los filtros aplicados.
            </div>
          ) : (            <table className="tramites-table">
              <thead>
                <tr className="table-header">
                  <th>ID Trámite↑</th>
                  <th>Fecha inicio↑</th>
                  <th>Tipo trámite↑</th>
                  <th>Estado↑</th>
                  <th>Acciones↑</th>
                </tr>
              </thead>
              <tbody>                {tramites.map((tramite) => (
                  <tr key={tramite.id} className="table-row">
                    <td>#{tramite.customId || tramite.id}</td>
                    <td>{tramite.fechaInicio}</td>
                    <td>{tramite.tipo}</td>
                    <td>
                      <span className={`status-badge ${tramite.estado === 'Rechazado' ? 'status-rechazado' : 'status-revision'}`}>
                        {tramite.estado}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-action"
                        onClick={() => handleVerTramite(tramite.id)}
                        disabled={loadingDetails}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}          {/* Paginación simple */}
          {!loading && tramites.length > 0 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="pagination-button"
              >
                &lt;
              </button>
              <span className="pagination-current">
                {currentPage}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="pagination-button"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Modal de detalles de trámite */}
        {showModal && selectedTramite && (
          <TramiteDetailsModal tramite={selectedTramite} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
}
