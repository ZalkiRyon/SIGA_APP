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

  const response = await fetch('http://localhost:4000/api/tramites/vehiculo', {
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

  const response = await fetch('http://localhost:4000/api/tramites/menores', {
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

export async function crearTramiteAlimentos(form, userId, docsMascota, tipoMascota) {
  const formData = new FormData();
  formData.append('tipo', form.tipo);
  formData.append('transporte', form.transporte);
  formData.append('userId', userId);
  if (form.tipo === 'mascota') {
    formData.append('tipoMascota', tipoMascota);
    if (docsMascota.registro) formData.append('registro', docsMascota.registro);
    if (docsMascota.vacunas) formData.append('vacunas', docsMascota.vacunas);
    if (docsMascota.desparasitacion) formData.append('desparasitacion', docsMascota.desparasitacion);
    if (docsMascota.zoo) formData.append('zoo', docsMascota.zoo);
  } else {
    formData.append('cantidad', form.cantidad);
    formData.append('descripcion', form.descripcion);
  }
  const response = await fetch('http://localhost:4000/api/tramites/alimentos', {
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

export async function getTramiteVehiculoById(id) {
  const response = await fetch(`http://localhost:4000/api/tramites/vehiculo/${id}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámite');
  }
  return data;
}

export async function editarTramiteVehiculo(form, userId, tramiteId) {
  const formData = new FormData();
  formData.append('patente', form.patente);
  formData.append('marca', form.marca);
  formData.append('modelo', form.modelo);
  formData.append('anio', form.anio);
  formData.append('color', form.color);
  formData.append('fechaInicio', form.fechaInicio);
  formData.append('fechaTermino', form.fechaTermino);
  formData.append('userId', userId);
  // Archivos (solo si hay uno nuevo)
  if (form.docs.cedula) formData.append('cedula', form.docs.cedula);
  if (form.docs.licencia) formData.append('licencia', form.docs.licencia);
  if (form.docs.revision) formData.append('revision', form.docs.revision);
  if (form.docs.salida) formData.append('salida', form.docs.salida);
  if (form.docs.autorizacion) formData.append('autorizacion', form.docs.autorizacion);
  if (form.docs.certificado) formData.append('certificado', form.docs.certificado);
  if (form.docs.seguro) formData.append('seguro', form.docs.seguro);
  const response = await fetch(`http://localhost:4000/api/tramites/vehiculo/${tramiteId}`, {
    method: 'PUT',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al editar trámite');
  }
  return data;
}

export async function getTramiteMenoresById(id) {
  const response = await fetch(`http://localhost:4000/api/tramites/menores/${id}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámite');
  }
  return data;
}

export async function editarTramiteMenores(form, userId, tramiteId) {
  const formData = new FormData();
  formData.append('menorNombres', form.menorNombres);
  formData.append('menorApellidos', form.menorApellidos);
  formData.append('menorRut', form.menorRut);
  formData.append('menorNacimiento', form.menorNacimiento);
  formData.append('acompNombres', form.acompNombres);
  formData.append('acompApellidos', form.acompApellidos);
  formData.append('acompRut', form.acompRut);
  formData.append('userId', userId);
  if (form.docs.docIdentidad) formData.append('docIdentidad', form.docs.docIdentidad);
  if (form.docs.docAutorizacion) formData.append('docAutorizacion', form.docs.docAutorizacion);
  const response = await fetch(`http://localhost:4000/api/tramites/menores/${tramiteId}`, {
    method: 'PUT',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al editar trámite');
  }
  return data;
}

export async function getTramiteAlimentosById(id) {
  const response = await fetch(`http://localhost:4000/api/tramites/alimentos/${id}`);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener trámite');
  }
  return data;
}

export async function editarTramiteAlimentos(form, userId, tramiteId, docsMascota, tipoMascota) {
  const formData = new FormData();
  formData.append('tipo', form.tipo);
  formData.append('transporte', form.transporte);
  formData.append('userId', userId);
  if (form.tipo === 'mascota') {
    formData.append('tipoMascota', tipoMascota);
    if (docsMascota.registro) formData.append('registro', docsMascota.registro);
    if (docsMascota.vacunas) formData.append('vacunas', docsMascota.vacunas);
    if (docsMascota.desparasitacion) formData.append('desparasitacion', docsMascota.desparasitacion);
    if (docsMascota.zoo) formData.append('zoo', docsMascota.zoo);
  } else {
    formData.append('cantidad', form.cantidad);
    formData.append('descripcion', form.descripcion);
  }
  const response = await fetch(`http://localhost:4000/api/tramites/alimentos/${tramiteId}`, {
    method: 'PUT',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Error al editar trámite');
  }
  return data;
}

// User Management API Functions
export async function getUsers() {
  try {
    const token = localStorage.getItem('token');
    console.log('Token for users API request:', token);
    
    const response = await fetch('http://localhost:4000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Try to parse response if possible, otherwise just provide status
      let errorData;
      try {
        errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Error al obtener usuarios (${response.status})`);
      } catch (jsonError) {
        console.error('Error parsing response:', response.status, response.statusText);
        throw new Error(`Error al obtener usuarios: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Users data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error; // Propagamos el error para manejarlo en el componente
  }
}

export async function createUser(userData) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear usuario');
  }
  
  return await response.json();
}

export async function updateUser(id, userData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:4000/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar usuario');
  }
  
  return await response.json();
}

export async function toggleUserStatus(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:4000/api/users/${id}/toggle-status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cambiar estado del usuario');
  }
  
  return await response.json();
}

export async function deleteUser(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:4000/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar usuario');
  }
  
  return await response.json();
}

// Incidents API Functions
export async function getIncidents() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/incidents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener incidencias');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching incidents:', error);
    // Fallback a datos de muestra para desarrollo
    return [
      { id: 'SYS-205', tipo: 'API Aduana AR: Error de conexión (Timeout)', estado: 'No resuelto', tiempo: '45 minutos', prioridad: 'Alta' },
      { id: 'SEC-101', tipo: 'Seguridad: 5 intentos fallidos', estado: 'No resuelto', tiempo: '1.2 horas', prioridad: 'Alta' },
      { id: 'DB-003', tipo: 'Base de datos: Lentitud queries', estado: 'En progreso', tiempo: '15 minutos', prioridad: 'Media' },
      { id: 'API-042', tipo: 'API SAG: Timeout en validación', estado: 'Resuelto', tiempo: '3.5 horas', prioridad: 'Media' },
      { id: 'UI-107', tipo: 'Formulario de menores: Error validación', estado: 'En progreso', tiempo: '30 minutos', prioridad: 'Baja' }
    ];
  }
}

export async function updateIncident(id, data) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:4000/api/incidents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar incidencia');
  }
  
  return await response.json();
}

// History API Functions
export async function getHistory() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener historial');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    // Fallback a datos de muestra para desarrollo
    return [
      { fecha: '15/05 14:30', usuario: 'Func-101', accion: 'Aprobó trámite #TR-6068', ip: '192.168.1.5' },
      { fecha: '15/05 11:15', usuario: 'Func-100', accion: 'Rechazó trámite #TR-6011', ip: '10.0.0.12' },
      { fecha: '14/05 17:22', usuario: 'Admin-01', accion: 'Creó usuario Func-102', ip: '192.168.1.10' },
      { fecha: '14/05 09:45', usuario: 'Func-100', accion: 'Aprobó trámite #TR-6010', ip: '10.0.0.12' },
      { fecha: '13/05 16:30', usuario: 'Func-101', accion: 'Rechazó trámite #TR-6005', ip: '192.168.1.5' }
    ];
  }
}

export async function generateHistoryReport(reportType, range) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/history/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reportType, range })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar reporte');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// Settings API Functions
export async function getUserSettings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/settings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener configuración');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Fallback a datos de muestra para desarrollo
    return {
      darkMode: false,
      defaultView: 'inicio',
      keyboardShortcuts: {
        usersManagement: 'CTRL + F',
        history: 'CTRL + A'
      }
    };
  }
}

export async function updateUserSettings(settings) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar configuración');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    // En desarrollo, actualizamos el localStorage directamente
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    return { success: true, message: 'Configuración actualizada correctamente' };
  }
}

// Función para obtener trámites para validación (para funcionarios aduaneros)
export async function getTramitesValidacion(filters = {}) {
  try {
    const token = localStorage.getItem('token') || 'test-token';
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
    if (filters.estado) queryParams.append('estado', filters.estado);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const url = `http://localhost:4000/api/tramites/validacion?${queryParams.toString()}`;
    console.log('Calling API:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        throw new Error(errorData.error || `Error al obtener trámites (${response.status})`);
      } catch (jsonError) {
        throw new Error(`Error al obtener trámites: ${response.status} ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tramites for validation:', error);
    throw error; // Propagate the error to be handled by the UI
  }
}

// Función para obtener detalles de un trámite específico
export async function getTramiteDetalles(tramiteId) {
  try {
    const token = localStorage.getItem('token') || 'test-token';
    const url = `http://localhost:4000/api/tramites/${tramiteId}`;
    console.log('Calling API for details:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('API response status (details):', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        throw new Error(errorData.error || `Error al obtener detalles del trámite (${response.status})`);
      } catch (jsonError) {
        throw new Error(`Error al obtener detalles del trámite: ${response.status} ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tramite details:', error);
    throw error; // Propagate the error to be handled by the UI
  }
}

// Función para aprobar o rechazar un trámite
export async function aprobarRechazarTramite(tramiteId, decision, motivoRechazo = null) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4000/api/tramites/${tramiteId}/${decision}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ motivoRechazo })
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        throw new Error(errorData.error || `Error al ${decision === 'aprobar' ? 'aprobar' : 'rechazar'} trámite (${response.status})`);
      } catch (jsonError) {
        throw new Error(`Error al ${decision === 'aprobar' ? 'aprobar' : 'rechazar'} trámite: ${response.status} ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error ${decision === 'aprobar' ? 'aprobando' : 'rechazando'} tramite:`, error);
    throw error;
  }
}
