// Servicio de API para peticiones HTTP
const api = {};
export default api;

export async function login(email, password) {
  const response = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error de autenticación');
  }
  return response.json();
}

export async function register(userData) {
  const response = await fetch('http://localhost:4000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al registrar usuario');
  }
  return response.json();
}
