import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    rut: '',
    telefono: '',
    sexo: '',
    region: '',
    comuna: '',
    direccion: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.nombre || !form.apellidos || !form.rut || !form.sexo || !form.region || !form.comuna || !form.direccion || !form.email || !form.password || !form.password2) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await registerApi({
        nombre: form.nombre,
        apellidos: form.apellidos,
        rut: form.rut,
        telefono: form.telefono,
        sexo: form.sexo,
        region: form.region,
        comuna: form.comuna,
        direccion: form.direccion,
        email: form.email,
        password: form.password
      });
      setSuccess('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ blockSize: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: 10, boxShadow: '0 2px 12px #0001', minInlineSize: 420, maxInlineSize: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBlockEnd: 18 }}>
          <img src="/src/assets/peque_logo_siga.png" alt="logo" style={{ inlineSize: 48, blockSize: 48 }} />
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', color: '#222' }}>Crea tu cuenta</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12 }}>
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} autoFocus />
          <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellidos *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12 }}>
          <input name="rut" value={form.rut} onChange={handleChange} placeholder="RUT *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
        </div>
        <div style={{ marginBlockEnd: 12, color: '#222', fontWeight: 500 }}>
          <span style={{ fontWeight: 500, color: '#222', marginInlineEnd: 16 }}>Sexo *</span>
          <label style={{ marginInlineEnd: 18, color: '#222', fontWeight: 400 }}>
            <input type="radio" name="sexo" value="Femenino" checked={form.sexo === 'Femenino'} onChange={handleChange} style={{ accentColor: '#1976d2', marginRight: 4 }} /> Femenino
          </label>
          <label style={{ color: '#222', fontWeight: 400 }}>
            <input type="radio" name="sexo" value="Masculino" checked={form.sexo === 'Masculino'} onChange={handleChange} style={{ accentColor: '#1976d2', marginRight: 4 }} /> Masculino
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12 }}>
          <input name="region" value={form.region} onChange={handleChange} placeholder="Región *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
          <input name="comuna" value={form.comuna} onChange={handleChange} placeholder="Comuna *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12 }}>
          <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12 }}>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12, alignItems: 'center' }}>
          <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Contraseña *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
          <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2', fontSize: 18, marginLeft: 4 }} title={showPassword ? 'Ocultar' : 'Mostrar'}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBlockEnd: 12, alignItems: 'center' }}>
          <input name="password2" type={showPassword2 ? 'text' : 'password'} value={form.password2} onChange={handleChange} placeholder="Confirmar contraseña *" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.05rem' }} />
          <button type="button" tabIndex={-1} onClick={() => setShowPassword2(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2', fontSize: 18, marginLeft: 4 }} title={showPassword2 ? 'Ocultar' : 'Mostrar'}>
            {showPassword2 ? '🙈' : '👁️'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginBlockEnd: 10, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBlockEnd: 10, textAlign: 'center' }}>{success}</div>}
        <div style={{ display: 'flex', gap: 18, marginBlockStart: 18 }}>
          <button type="submit" disabled={loading} style={{ flex: 1, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7rem', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer' }}>Crear cuenta</button>
          <button type="button" onClick={() => navigate('/login')} style={{ flex: 1, background: '#fff', color: '#1976d2', border: 'none', borderBlockEnd: '2px solid #1976d2', borderRadius: 0, padding: '0.7rem', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer', textDecoration: 'underline' }}>Volver a inicio de sesión</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBlockStart: 32, fontSize: '0.98rem', color: '#888' }}>
          <div>
            <select style={{ fontSize: '0.98rem', borderRadius: 4, border: '1px solid #bbb', padding: '0.2rem 0.5rem' }} defaultValue="es">
              <option value="es">Español (Chile)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <a href="#" style={{ color: '#888', marginInlineEnd: 18 }}>Soporte</a>
            <a href="#" style={{ color: '#888' }}>Términos y condiciones</a>
          </div>
        </div>
      </form>
    </div>
  );
}
