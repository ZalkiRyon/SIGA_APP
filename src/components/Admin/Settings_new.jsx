import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { getUserSettings, updateUserSettings } from '../../services/api';

// Configuración para Administrador
export default function AdminSettings() {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [defaultView, setDefaultView] = useState('inicio');
  const [keyboardShortcuts, setKeyboardShortcuts] = useState({
    usersManagement: 'CTRL + F',
    history: 'CTRL + A'
  });
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar configuraciones del usuario
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await getUserSettings();
        setDarkMode(settings.darkMode || false);
        setDefaultView(settings.defaultView || 'inicio');
        setKeyboardShortcuts(settings.keyboardShortcuts || {
          usersManagement: 'CTRL + F',
          history: 'CTRL + A'
        });
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar configuraciones:', err);
        setError('Error al cargar configuraciones. Por favor, intenta más tarde.');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    const settings = {
      darkMode,
      defaultView,
      keyboardShortcuts
    };
    
    try {
      await updateUserSettings(settings);
      // Mostrar mensaje de confirmación
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuraciones:', err);
      setError('Error al guardar configuraciones. Por favor, intenta más tarde.');
    }
  };

  // Restablecer configuraciones predeterminadas
  const handleRestoreDefaults = () => {
    setDarkMode(false);
    setDefaultView('inicio');
    setKeyboardShortcuts({
      usersManagement: 'CTRL + F',
      history: 'CTRL + A'
    });
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
            Configuración
          </h1>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Cargando configuraciones...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        ) : (
          <>
            {/* Sección de Preferencias */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Preferencias</h2>
              
              {/* Visual - Modo oscuro */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Visual</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={darkMode} 
                      onChange={() => setDarkMode(!darkMode)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span>Modo oscuro</span>
                </div>
              </div>

              {/* Vista predeterminada al iniciar sesión */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vista predeterminada al iniciar sesión</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={defaultView === 'inicio'} 
                      onChange={() => setDefaultView('inicio')} 
                    />
                    Inicio
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={defaultView === 'historial'} 
                      onChange={() => setDefaultView('historial')} 
                    />
                    Historial
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={defaultView === 'usuarios'} 
                      onChange={() => setDefaultView('usuarios')} 
                    />
                    Gestión de usuarios
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={defaultView === 'incidencias'} 
                      onChange={() => setDefaultView('incidencias')} 
                    />
                    Incidencias
                  </label>
                </div>
              </div>

              {/* Atajos de teclado */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Atajos de teclado</h3>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                      border: '1px solid #ccc',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      marginRight: '1rem',
                      width: '100px',
                      textAlign: 'center'
                    }}>
                      CTRL + F
                    </div>
                    <span>Ir Gestión de usuarios</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      border: '1px solid #ccc',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      marginRight: '1rem',
                      width: '100px',
                      textAlign: 'center'
                    }}>
                      CTRL + A
                    </div>
                    <span>Ir Historial</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Botones de acciones */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <button
                onClick={handleRestoreDefaults}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #000',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                }}
              >
                Restablecer
              </button>
              
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #000',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                }}
              >
                Guardar cambios
              </button>
            </div>
          </>
        )}
        
        {/* Mensaje de guardado exitoso */}
        {showSaveMessage && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#4caf50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Cambios guardados correctamente
          </div>
        )}

        {/* CSS para el toggle switch */}
        <style jsx="true">{`
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 54px;
            height: 28px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
          }
          
          .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
          }
          
          input:checked + .slider {
            background-color: #1976d2;
          }
          
          input:focus + .slider {
            box-shadow: 0 0 1px #1976d2;
          }
          
          input:checked + .slider:before {
            transform: translateX(26px);
          }
          
          .slider.round {
            border-radius: 34px;
          }
          
          .slider.round:before {
            border-radius: 50%;
          }
        `}</style>
      </main>
    </div>
  );
}
