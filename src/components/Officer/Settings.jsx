import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

// Configuración para Funcionario Aduanero
export default function OfficerSettings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    defaultView: 'inicio',
    notifications: true,
    autoLogout: true,
    autoLogoutTime: 30,    shortcuts: {
      search: 'CTRL + F',
      approve: 'CTRL + A',
      reject: 'CTRL + R'
    }
  });
  
  const handleToggle = (field) => {
    // First update the state immediately for responsive UI
    setSettings(prev => {
      const newValue = !prev[field];
      console.log(`Toggling ${field} from ${prev[field]} to ${newValue}`);
      
      // Show visual feedback
      if (field === 'darkMode') {
        document.body.style.transition = 'background-color 0.3s';
        document.body.style.backgroundColor = newValue ? '#333' : '#f8f9fa';
        setTimeout(() => {
          document.body.style.transition = '';
        }, 300);
      }
      
      return {
        ...prev,
        [field]: newValue
      };
    });
  };

  const handleDefaultViewChange = (view) => {
    setSettings(prev => ({
      ...prev,
      defaultView: view
    }));
  };

  const handleAutoLogoutTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSettings(prev => ({
      ...prev,
      autoLogoutTime: value
    }));
  };

  const handleResetSettings = () => {
    setSettings({
      darkMode: false,
      defaultView: 'inicio',
      notifications: true,
      autoLogout: true,
      autoLogoutTime: 30,
      shortcuts: {
        search: 'CTRL + F',
        approve: 'CTRL + A',
        reject: 'CTRL + R'
      }
    });
  };

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log('Configuración guardada:', settings);
    alert('Configuración guardada con éxito.');
  };
  return (
    <div className="settings-container">
      <Sidebar role="officer" onLogout={logout} />
      <div className="settings-content">
        <header className="settings-header">
          <div>
            <h1 className="page-title">
              Configuración
            </h1>
          </div>
          
          <div className="user-info">
            <div className="notification-badge">
              <span className="badge-icon"></span>
              <span role="img" aria-label="notifications" className="notification-icon">🔔</span>
            </div>
            <div className="user-profile">
              <span className="user-avatar">
                {user?.nombre?.charAt(0) || 'A'}
              </span>
              <span className="user-name">Funcionario Aduanero</span>
            </div>
          </div>
        </header>

        <div className="settings-grid">
          {/* Sección de Preferencias */}
          <div className="settings-section">
            <h2 className="settings-section-title">Preferencias</h2>
            
            {/* Opción de Modo Oscuro */}            <div className="settings-option">
              <div className="settings-option-title">Apariencia</div>
              <div className="settings-option-control">
                <div 
                  className="toggle-switch"
                  onClick={() => {
                    console.log("Dark mode toggle container clicked");
                    handleToggle('darkMode');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <input 
                    type="checkbox" 
                    checked={settings.darkMode}
                    readOnly
                  />
                  <span className="toggle-slider"></span>
                </div>
                <span className="toggle-label">Modo oscuro</span>
              </div>
            </div>
              {/* Opción de Notificaciones */}
            <div className="settings-option">
              <div className="settings-option-title">Notificaciones</div>
              <div className="settings-option-control">
                <div 
                  className="toggle-switch"
                  onClick={() => handleToggle('notifications')}
                  style={{ cursor: 'pointer' }}
                >
                  <input 
                    type="checkbox" 
                    checked={settings.notifications}
                    readOnly
                  />
                  <span className="toggle-slider"></span>
                </div>
                <span className="toggle-label">Recibir notificaciones</span>
              </div>
            </div>
            
            {/* Opción de Cierre Automático */}
            <div className="settings-option">
              <div className="settings-option-title">Cierre automático de sesión</div>              <div className="settings-option-control">
                <div 
                  className="toggle-switch"
                  onClick={() => handleToggle('autoLogout')}
                  style={{ cursor: 'pointer' }}
                >
                  <input 
                    type="checkbox" 
                    checked={settings.autoLogout}
                    readOnly
                  />
                  <span className="toggle-slider"></span>
                </div>
                <span className="toggle-label">Cerrar sesión por inactividad</span>
              </div>
              {settings.autoLogout && (
                <div className="timeout-control">
                  <span>Tiempo de inactividad:</span>
                  <select 
                    value={settings.autoLogoutTime} 
                    onChange={handleAutoLogoutTimeChange}
                    className="timeout-select"
                  >
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Vista Predeterminada */}
          <div className="settings-section">
            <h2 className="settings-section-title">Vista predeterminada</h2>
            
            <div className="default-view-options">
              <div className="radio-group">
                <input 
                  type="radio" 
                  id="inicio" 
                  name="defaultView"
                  checked={settings.defaultView === 'inicio'}
                  onChange={() => handleDefaultViewChange('inicio')}
                />
                <label htmlFor="inicio">Inicio</label>
              </div>
              <div className="radio-group">
                <input 
                  type="radio" 
                  id="validacion" 
                  name="defaultView"
                  checked={settings.defaultView === 'validacion'}
                  onChange={() => handleDefaultViewChange('validacion')}
                />
                <label htmlFor="validacion">Validación</label>
              </div>
              <div className="radio-group">
                <input 
                  type="radio" 
                  id="reportes" 
                  name="defaultView"
                  checked={settings.defaultView === 'reportes'}
                  onChange={() => handleDefaultViewChange('reportes')}
                />
                <label htmlFor="reportes">Reportes</label>
              </div>
              <div className="radio-group">
                <input 
                  type="radio" 
                  id="alertas" 
                  name="defaultView"
                  checked={settings.defaultView === 'alertas'}
                  onChange={() => handleDefaultViewChange('alertas')}
                />
                <label htmlFor="alertas">Alertas</label>
              </div>
            </div>
          </div>
        
          {/* Sección de Atajos de Teclado */}
          <div className="settings-section">
            <h2 className="settings-section-title">Atajos de teclado</h2>
            
            <div className="keyboard-shortcuts-list">
              <div className="keyboard-shortcut">
                <span className="shortcut-key">{settings.shortcuts.search}</span>
                <span className="shortcut-description">Buscar trámites</span>
              </div>
              
              <div className="keyboard-shortcut">
                <span className="shortcut-key">{settings.shortcuts.approve}</span>
                <span className="shortcut-description">Aprobar trámite</span>
              </div>
              
              <div className="keyboard-shortcut">
                <span className="shortcut-key">{settings.shortcuts.reject}</span>
                <span className="shortcut-description">Rechazar trámite</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="button-container">
          <button 
            className="btn-reset" 
            onClick={handleResetSettings}
          >
            Restablecer
          </button>
          <button 
            className="btn-save" 
            onClick={handleSaveSettings}
          >
            Guardar cambios
          </button>
        </div>      </div>
    </div>
  );
}
