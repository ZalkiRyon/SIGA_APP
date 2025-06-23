import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Alerts.css';

// Alertas para Funcionario Aduanero
export default function Alerts() {
  const { user, logout } = useAuth();
  const [alertFilter, setAlertFilter] = useState('todos');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulación de carga de alertas desde una API
    const fetchAlerts = async () => {
      setLoading(true);
      try {        // Datos de ejemplo para mostrar en la interfaz
        const mockAlerts = [
          {
            id: 'TR-6084',
            type: 'CRITICA',
            description: 'Vehículo con placa vencida',
            details: {
              patente: 'AB-7890',
              fechaVencimiento: '02/04/2025'
            },
            actions: ['derivar', 'marcar']
          },
          {
            id: 'TR-6072',
            type: 'CRITICA',
            description: 'Menor con documentación inconsistente',
            details: {
              rut: '26.678.234-5',
              falta: 'Autorización notarial'
            },
            actions: ['notificar', 'rechazar']
          },
          {
            id: 'SYS-103',
            type: 'ADVERTENCIA',
            description: 'Caída de conexión con Aduana AR',
            details: {
              tiempoEstimado: '25 minutos',
              ultimaActualizacion: '14:33'
            },
            actions: []
          }
        ];
        
        // Filtrar alertas según el filtro seleccionado
        let filteredAlerts = mockAlerts;
        if (alertFilter === 'urgente') {
          filteredAlerts = mockAlerts.filter(alert => alert.type === 'CRITICA');
        } else if (alertFilter === 'resueltas') {
          filteredAlerts = []; // Simular que no hay alertas resueltas
        }
        
        setAlerts(filteredAlerts);
      } catch (error) {
        console.error('Error al cargar alertas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, [alertFilter]);
  
  const handleFilterChange = (filter) => {
    setAlertFilter(filter);
  };
  
  const handleAlertAction = (alertId, actionType) => {
    // Simulación de acción sobre una alerta
    console.log(`Acción ${actionType} aplicada a la alerta ${alertId}`);
    
    // En un caso real, aquí se llamaría a una API para realizar la acción
    // Por ahora, solo actualizamos el estado local para simular
    if (actionType === 'marcar' || actionType === 'rechazar') {
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    }
  };
  
  return (
    <div className="alerts-container">
      <Sidebar role="officer" onLogout={logout} />
      <div className="alerts-content">
        <header className="alerts-header">
          <div>
            <h1 className="page-title">
              Alertas activas
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

        {/* Filtros de alertas */}
        <div className="filters-container">
          <button 
            className={`filter-button ${alertFilter === 'todos' ? 'active' : ''}`}
            onClick={() => handleFilterChange('todos')}
          >
            Todos
          </button>
          <button 
            className={`filter-button ${alertFilter === 'urgente' ? 'active' : ''}`}
            onClick={() => handleFilterChange('urgente')}
          >
            Urgente
          </button>
          <button 
            className={`filter-button ${alertFilter === 'resueltas' ? 'active' : ''}`}
            onClick={() => handleFilterChange('resueltas')}
          >
            Resueltas
          </button>
        </div>

        {/* Lista de alertas */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Cargando alertas...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            No hay alertas para mostrar con el filtro seleccionado.
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.type === 'CRITICA' ? 'alert-critical' : 'alert-warning'}`}
              >
                <div className="alert-header">
                  <span>{alert.type}: <span className="alert-id">#{alert.id}</span> | {alert.description}</span>
                </div>
                <div className="alert-details">
                  <div className="alert-info">
                    {Object.entries(alert.details).map(([key, value]) => (
                      <div key={key} className="alert-info-item">
                        <span className="alert-label">{formatLabel(key)}:</span>
                        <span className="alert-value">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="alert-actions">
                    {alert.actions.includes('derivar') && (
                      <button 
                        className="alert-button"
                        onClick={() => handleAlertAction(alert.id, 'derivar')}
                      >
                        Derivar a fiscalización
                      </button>
                    )}
                    {alert.actions.includes('marcar') && (
                      <button 
                        className="alert-button"
                        onClick={() => handleAlertAction(alert.id, 'marcar')}
                      >
                        Marcar como resuelta
                      </button>
                    )}
                    {alert.actions.includes('notificar') && (
                      <button 
                        className="alert-button"
                        onClick={() => handleAlertAction(alert.id, 'notificar')}
                      >
                        Notificar
                      </button>
                    )}
                    {alert.actions.includes('rechazar') && (
                      <button 
                        className="alert-button"
                        onClick={() => handleAlertAction(alert.id, 'rechazar')}
                      >
                        Rechazar trámite
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Función para formatear etiquetas de propiedades
function formatLabel(key) {
  const labels = {
    patente: 'Patente',
    fechaVencimiento: 'Fecha de vencimiento',
    rut: 'RUT',
    falta: 'Falta',
    tiempoEstimado: 'Tiempo estimado',
    ultimaActualizacion: 'Última actualización'
  };
  
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}
