import { useState } from 'react';
import './Login.css';
import { login as loginApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Componente de Login para autenticación de usuarios
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginApi(email, password);
      login(result.user); // Guardar usuario en contexto y localStorage
      window.location.reload(); // Forzar recarga para redirigir según rol
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              disabled={loading}
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
              disabled={loading}
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

          <button type="submit" className="btn-main" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
          <button type="button" className="btn-secondary" disabled={loading}>Ingresar con clave única</button>
        </form>
        <div className="register-link">
          ¿No tienes cuenta? <a href="#">Regístrate aquí.</a>
        </div>
      </div>
    </div>
  );
}
