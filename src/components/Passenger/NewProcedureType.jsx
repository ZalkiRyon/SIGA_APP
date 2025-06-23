import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css';
import './MyProcedures.css';

const OPTIONS = [
  { label: 'Vehículo temporal', value: 'vehiculo' },
  { label: 'Menores de edad', value: 'menores' },
  { label: 'Alimentos / Mascotas', value: 'alimentos' },
];

export default function NewProcedureType() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'vehiculo') navigate('/passenger/tramite/vehiculo');
    else if (selected === 'menores') navigate('/passenger/tramite/menores');
    else if (selected === 'alimentos') navigate('/passenger/tramite/alimentos');
  };

  return (
    <div className="tram-page" style={{display: 'flex', blockSize: '100vh', background: '#fff'}}>
      <Sidebar role="passenger" onLogout={logout} />
      <main className="tram-main tram-main-nuevo">
        <header className="tram-header tram-header-nuevo">
          <h1 className="tram-title tram-title-nuevo">¿Qué trámite deseas iniciar?</h1>
          <div className="tram-header-actions">
            <span className="tram-bell" title="Notificaciones">🔔</span>
            <span className="tram-username">{user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        <div className="tram-opciones-box">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`tram-opcion-btn${selected === opt.value ? ' selected' : ''}`}
              onClick={() => setSelected(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className="tram-btn tram-btn-siguiente"
          disabled={!selected}
          onClick={handleNext}
        >
          Siguiente
        </button>
      </main>
    </div>
  );
}
