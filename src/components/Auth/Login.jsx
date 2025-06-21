import { useState } from 'react';
import './Login.css';

// Componente de Login para autenticación de usuarios
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Simulación de autenticación básica
    if (!email || !password) {
      setError('Por favor, ingrese su correo y contraseña.');
      return;
    }
    // Aquí iría la lógica real de autenticación (API)
    if (email === 'admin@siga.cl' && password === 'admin123') {
      alert('¡Bienvenido, Administrador!');
      // Redirigir según rol
    } else if (email === 'funcionario@siga.cl' && password === 'funcionario123') {
      alert('¡Bienvenido, Funcionario Aduanero!');
    } else if (email === 'pasajero@siga.cl' && password === 'pasajero123') {
      alert('¡Bienvenido, Pasajero/Turista!');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        {/* Logo grande */}
        <div className="logo-grande">
          {/* Aquí irá la imagen gran_logo_siga.png */}
          <img src="/src/assets/gran_logo_siga.png" alt="Logo SIGA grande" />
        </div>
      </div>
      <div className="login-right">
        <div className="logo-pequeno">
          {/* Aquí irá la imagen peque_logo_siga.png */}
          <img src="/src/assets/peque_logo_siga.png" alt="Logo SIGA pequeño" />
        </div>
        <h2>Bienvenido</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <div className="input-icon">
            <span className="icon-user" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Contraseña</label>
          <div className="input-icon">
            <span className="icon-lock" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              className="icon-eye"
              title="Mostrar/ocultar contraseña"
              onClick={() => setShowPassword(v => !v)}
              style={{ userSelect: 'none' }}
            />
          </div>

          {error && <div style={{ color: 'red', marginBottom: '0.7rem', textAlign: 'center' }}>{error}</div>}

          <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>

          <button type="submit" className="btn-main">Ingresar</button>
          <button type="button" className="btn-secondary">Ingresar con clave única</button>
        </form>
        <div className="register-link">
          ¿No tienes cuenta? <a href="#">Regístrate aquí.</a>
        </div>
      </div>
    </div>
  );
}
