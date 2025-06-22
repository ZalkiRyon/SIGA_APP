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

export async function crearTramiteVehiculo(form, userId) {
  const formData = new FormData();
  formData.append('patente', form.patente);
  formData.append('marca', form.marca);
  formData.append('modelo', form.modelo);
  formData.append('anio', form.anio);
  formData.append('color', form.color);
  formData.append('fechaInicio', form.fechaInicio);
  formData.append('fechaTermino', form.fechaTermino);
  formData.append('userId', userId);
  // Archivos
  formData.append('cedula', form.docs.cedula);
  formData.append('licencia', form.docs.licencia);
  formData.append('revision', form.docs.revision);
  formData.append('salida', form.docs.salida);
  if (form.docs.autorizacion) formData.append('autorizacion', form.docs.autorizacion);
  formData.append('certificado', form.docs.certificado);
  formData.append('seguro', form.docs.seguro);

  const response = await fetch('http://localhost:4000/api/tramite/vehiculo', {
    method: 'POST',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al guardar trámite');
  }
  return data;
}

export async function getTramitesVehiculo(userId) {
  const response = await fetch(`http://localhost:4000/api/tramites/vehiculo?userId=${userId}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámites');
  }
  return data;
}

export async function crearTramiteMenores(form, userId) {
  const formData = new FormData();
  formData.append('menorNombres', form.menorNombres);
  formData.append('menorApellidos', form.menorApellidos);
  formData.append('menorRut', form.menorRut);
  formData.append('menorNacimiento', form.menorNacimiento);
  formData.append('acompNombres', form.acompNombres);
  formData.append('acompApellidos', form.acompApellidos);
  formData.append('acompRut', form.acompRut);
  formData.append('userId', userId);
  formData.append('docIdentidad', form.docIdentidad);
  formData.append('docAutorizacion', form.docAutorizacion);

  const response = await fetch('http://localhost:4000/api/tramite/menores', {
    method: 'POST',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al guardar trámite');
  }
  return data;
}

export async function getTramitesMenores(userId) {
  const response = await fetch(`http://localhost:4000/api/tramites/menores?userId=${userId}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámites');
  }
  return data;
}

export async function crearTramiteAlimentos(form, userId) {
  const body = {
    tipo: form.tipo,
    cantidad: form.cantidad,
    transporte: form.transporte,
    descripcion: form.descripcion,
    userId
  };
  const response = await fetch('http://localhost:4000/api/tramite/alimentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al guardar trámite');
  }
  return data;
}

export async function getTramitesAlimentos(userId) {
  const response = await fetch(`http://localhost:4000/api/tramites/alimentos?userId=${userId}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámites');
  }
  return data;
}
