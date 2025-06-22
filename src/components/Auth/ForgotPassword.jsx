import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSent(false);
    try {
      const res = await fetch('http://localhost:4000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // Forzar parseo seguro
      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error('Error de conexión con el servidor');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Error');
      }
      setSent(true);
      setSuccessMsg(data.message || 'Instrucciones para recuperar la contraseña enviadas exitosamente');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ blockSize: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: 10, boxShadow: '0 2px 12px #0001', minInlineSize: 320 }}>
        <h2 style={{ marginBlockEnd: 24, textAlign: 'center', color: '#222', fontWeight: 700 }}>Recuperar contraseña</h2>
        {successMsg && (
          <div style={{ color: 'green', marginBlockEnd: 16, textAlign: 'center' }}>{successMsg}</div>
        )}
        {!sent && (
          <>
            <label htmlFor="email" style={{ fontWeight: 500, color: '#222', display: 'block', marginBlockEnd: 4 }}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ inlineSize: '100%', padding: '0.7rem', margin: '0.7rem 0 1.2rem 0', borderRadius: 6, border: '1.5px solid #bbb', fontSize: '1.08rem', color: '#222', background: '#f7f7f7' }}
              placeholder="Ingresa tu correo registrado"
              autoFocus
            />
            {error && <div style={{ color: 'red', marginBlockEnd: 12, textAlign: 'center' }}>{error}</div>}
            <button type="submit" style={{ inlineSize: '100%', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7rem', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer' }}>
              Enviar instrucciones
            </button>
          </>
        )}
      </form>
    </div>
  );
}
