import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { getIncidents, updateIncident } from '../../services/api';

// Incidencias para Administrador
export default function Incidents() {
  const { logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState({ field: 'fecha', ascending: true });

  // Cargar incidencias
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const data = await getIncidents();
        setIncidents(data);
        setFilteredIncidents(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar incidencias: ' + err.message);
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Función para filtrar incidencias
  const filterIncidents = () => {
    let filtered = [...incidents];

    if (selectedPriority) {
      filtered = filtered.filter(incident => incident.prioridad === selectedPriority);
    }

    // Ordenar según el campo y dirección actual
    filtered.sort((a, b) => {
      if (sortOrder.field === 'fecha') {
        // Para fechas (asumiendo que tenemos una propiedad fechaCreacion)
        const dateA = a.fechaCreacion ? new Date(a.fechaCreacion) : new Date();
        const dateB = b.fechaCreacion ? new Date(b.fechaCreacion) : new Date();
        return sortOrder.ascending ? dateA - dateB : dateB - dateA;
      } else if (sortOrder.field === 'prioridad') {
        // Para prioridad (Alta > Media > Baja)
        const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
        const priorityA = priorityOrder[a.prioridad] || 0;
        const priorityB = priorityOrder[b.prioridad] || 0;
        return sortOrder.ascending ? priorityA - priorityB : priorityB - priorityA;
      }
      return 0;
    });

    setFilteredIncidents(filtered);
  };

  // Efecto para filtrar cuando cambian los criterios
  useEffect(() => {
    filterIncidents();
  }, [selectedPriority, sortOrder]);

  // Función para cambiar el orden
  const handleSort = (field) => {
    setSortOrder(prev => ({
      field,
      ascending: prev.field === field ? !prev.ascending : true
    }));
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
  };

  const clearFilters = () => {
    setSelectedPriority('');
  };

  // Función para obtener clase de estilo según prioridad
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta':
        return { backgroundColor: '#fff0f0' };
      case 'Media':
        return { backgroundColor: '#fffbe6' };
      case 'Baja':
        return { backgroundColor: '#f0f8ff' };
      default:
        return {};
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar role="admin" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        {/* Encabezado con título */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 600, 
            borderBottom: '2px solid #222', 
            paddingBottom: '0.3rem', 
            margin: 0, 
            color: '#222',
            paddingRight: '2rem'
          }}>
            Incidencias
          </h1>
        </header>

        {/* Sección de filtros */}
        <section style={{ 
          border: '2px solid #222', 
          borderRadius: '8px', 
          padding: '1rem 1.5rem', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '1rem' }}>Filtros</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Prioridad</label>
              <select
                value={selectedPriority}
                onChange={handlePriorityChange}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px'
                }}
              >
                <option value="">Selecciona</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <div style={{ marginBottom: '0.5rem' }}>Ordenar por</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleSort('fecha')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: sortOrder.field === 'fecha' ? '#0066cc' : '#222',
                    fontWeight: sortOrder.field === 'fecha' ? 'bold' : 'normal'
                  }}
                >
                  <span style={{ marginRight: '4px' }}>Fecha</span>
                  {sortOrder.field === 'fecha' && (
                    <span>{sortOrder.ascending ? '▼' : '▲'}</span>
                  )}
                </button>
                
                <button 
                  onClick={() => handleSort('prioridad')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: sortOrder.field === 'prioridad' ? '#0066cc' : '#222',
                    fontWeight: sortOrder.field === 'prioridad' ? 'bold' : 'normal'
                  }}
                >
                  <span style={{ marginRight: '4px' }}>Prioridad</span>
                  {sortOrder.field === 'prioridad' && (
                    <span>{sortOrder.ascending ? '▼' : '▲'}</span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={clearFilters}
                style={{
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '0.5rem 1.2rem'
                }}
              >
                Limpiar
              </button>
              
              <button
                onClick={filterIncidents}
                style={{
                  background: '#fff',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  padding: '0.5rem 1.2rem',
                  fontWeight: '500',
                  marginLeft: '0.5rem'
                }}
              >
                Filtrar
              </button>
            </div>
          </div>
        </section>

        {/* Tabla de incidencias */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando incidencias...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              {error}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                      No se encontraron incidencias que coincidan con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <tr 
                      key={incident.id} 
                      style={{ 
                        ...getPriorityClass(incident.prioridad),
                        borderBottom: '1px solid #e5e5e5',
                        cursor: 'pointer'
                      }}
                      onClick={() => console.log(`Ver detalles de la incidencia ${incident.id}`)}
                    >
                      <td style={{ padding: '0.75rem' }}>{incident.id}</td>
                      <td style={{ padding: '0.75rem' }}>{incident.tipo}</td>
                      <td style={{ padding: '0.75rem' }}>{incident.estado}</td>
                      <td style={{ padding: '0.75rem' }}>{incident.tiempo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Paginación */}
        <footer style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          marginTop: '2rem', 
          padding: '1rem 0' 
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
              disabled={filteredIncidents.length < 10} // Asumiendo 10 por página
              style={{
                background: 'transparent',
                border: 'none',
                cursor: filteredIncidents.length < 10 ? 'default' : 'pointer',
                opacity: filteredIncidents.length < 10 ? 0.5 : 1
              }}
            >
              &gt;
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
