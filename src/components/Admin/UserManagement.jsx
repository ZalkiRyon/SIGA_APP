import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import { getUsers, toggleUserStatus, deleteUser, createUser } from '../../services/api';

// Gestión de usuarios para Administrador
export default function UserManagement() {  
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para mostrar/ocultar el modal de creación de usuarios
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estado para el formulario de creación de usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellidos: '',
    rut: '',
    sexo: 'Masculino',
    region: '',
    comuna: '',
    direccion: '',
    email: '',
    password: '12345678', // Contraseña por defecto que el usuario deberá cambiar
    role: 'passenger',
    estado: 'activo',
    perfil: null
  });
  
  // Estado para los usuarios
  const [users, setUsers] = useState([]);
  
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Función para filtrar usuarios
  const filterUsers = () => {
    const filtered = users.filter(user => {
      const matchSearch = searchTerm === '' || 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm);
      
      const matchRole = selectedRole === '' || user.rol === selectedRole;
      
      return matchSearch && matchRole;
    });
    
    setFilteredUsers(filtered);
  };
  // Efecto para cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        console.log('UserManagement: Users data received:', data);
        setUsers(data);
        // Actualizar filtered users también
        setFilteredUsers(data);
      } catch (err) {
        console.error('UserManagement: Error fetching users:', err);
        setError('Error al cargar los usuarios: ' + err.message);
        
        // Si recibimos un 403 Forbidden, puede ser que el token haya vencido o sea inválido
        // En ese caso, debemos hacer logout automático
        if (err.message.includes('403') || err.message.includes('401') || 
            err.message.includes('Token') || err.message.includes('Forbidden')) {
          alert('Su sesión ha expirado o no tiene permisos suficientes. Será redirigido al login.');
          logout();
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [logout]);

  // Efecto para filtrar al cambiar criterios
  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  // Funciones de acción
  const handleEdit = (id) => {
    console.log(`Editar usuario ${id}`);
    // Implementar lógica de edición
  };
  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      // Refrescar la lista de usuarios
      const updatedUsers = users.map(user => {
        if (user.id === id) {
          return {
            ...user,
            estado: user.estado === 'activo' ? 'inactivo' : 'activo'
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      alert('Estado del usuario actualizado con éxito');
    } catch (err) {
      alert('Error al actualizar el estado del usuario: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await deleteUser(id);
        // Eliminar el usuario de la lista
        setUsers(users.filter(user => user.id !== id));
        alert('Usuario eliminado con éxito');
      } catch (err) {
        alert('Error al eliminar el usuario: ' + err.message);
      }
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    // Resetear el formulario
    setNewUser({
      nombre: '',
      apellidos: '',
      rut: '',
      sexo: 'Masculino',
      region: '',
      comuna: '',
      direccion: '',
      email: '',
      password: '12345678', // Contraseña por defecto que el usuario deberá cambiar
      role: 'passenger',
      estado: 'activo',
      perfil: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await createUser(newUser);
      
      // Agregar el nuevo usuario a la lista con el formato correcto
      const createdUser = {
        id: response.id,
        nombre: `${newUser.nombre} ${newUser.apellidos}`,
        rut: newUser.rut,
        rol: newUser.role === 'admin' ? 'Administrador' : 
             newUser.role === 'officer' ? 'Funcionario Aduanero' : 'Pasajero',
        estado: newUser.estado,
        acciones: newUser.role === 'passenger' ? ['editar', 'eliminar'] : ['editar', 'inhabilitar']
      };
      
      setUsers(prev => [...prev, createdUser]);
      
      // Cerrar modal y mostrar mensaje de éxito
      handleCloseModal();
      alert('Usuario creado correctamente');
    } catch (err) {
      alert('Error al crear usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Crear CSV a partir de los usuarios filtrados
    const headers = ['ID', 'RUT', 'Nombre', 'Rol', 'Estado'];
    
    let csvContent = headers.join(',') + '\n';
    
    filteredUsers.forEach(user => {
      const row = [
        user.id,
        user.rut,
        user.nombre,
        user.rol,
        user.estado || 'activo'
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    // Crear un blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_siga_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar role="admin" onLogout={logout} />
      <main style={{ flex: 1, padding: '2.5rem 3rem', color: '#222' }}>
        {/* Encabezado con título y botón de crear usuario */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 600, 
            borderBottom: '2px solid #222', 
            paddingBottom: '0.3rem', 
            margin: 0, 
            color: '#222',
            paddingRight: '2rem'
          }}>
            Gestión de usuarios
          </h1>
          <button 
            onClick={handleCreateUser}
            style={{
              background: '#fff',
              border: '2px solid #222',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #222'
            }}
          >
            Crear nuevo usuario
          </button>
        </header>

        {/* Sección de filtros */}
        <section style={{ 
          border: '2px solid #222', 
          borderRadius: '8px', 
          padding: '1rem 1.5rem', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '1rem' }}>Filtros</h2>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Buscar por nombre / rut / ID</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    paddingLeft: '2rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '300px'
                  }}
                />
                <span style={{ 
                  position: 'absolute', 
                  left: '0.5rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  🔍
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Tipo de rol</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px'
                }}
              >
                <option value="">Selecciona</option>
                <option value="Funcionario Aduanero">Funcionario Aduanero</option>
                <option value="Pasajero">Pasajero</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <button
                onClick={clearFilters}
                style={{
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem'
                }}
              >
                Limpiar
              </button>
              
              <button
                onClick={filterUsers}
                style={{
                  background: '#fff',
                  border: '1px solid #222',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontWeight: '500'
                }}
              >
                Filtrar
              </button>
            </div>
          </div>
        </section>        {/* Tabla de usuarios */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando usuarios...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              {error}
            </div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>RUT</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Rol</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                    No se encontraron usuarios que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (                filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '0.75rem' }}>{user.id}</td>
                  <td style={{ padding: '0.75rem' }}>{user.rut}</td>
                  <td style={{ padding: '0.75rem' }}>{user.nombre}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {user.rol}
                      {user.estado === 'inactivo' && (
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          fontSize: '0.8rem', 
                          padding: '0.2rem 0.5rem', 
                          background: '#ffeeee', 
                          color: '#cc0000',
                          borderRadius: '3px' 
                        }}>
                          Inactivo
                        </span>
                      )}
                      {user.perfil && (
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          fontSize: '0.8rem', 
                          padding: '0.2rem 0.5rem', 
                          background: '#eeeeff', 
                          color: '#0000cc',
                          borderRadius: '3px' 
                        }}>
                          {user.perfil}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleEdit(user.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0066cc',
                        cursor: 'pointer',
                        marginRight: '1rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Editar
                    </button>
                    
                    {user.rol !== 'Administrador' && (
                      user.acciones.includes('inhabilitar') ? (
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: user.estado === 'activo' ? '#cc6600' : '#008800',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {user.estado === 'activo' ? 'Inhabilitar' : 'Habilitar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#cc0000',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Eliminar
                        </button>
                      )
                    )}
                  </td>
                </tr>              ))
              )}
            </tbody>
          </table>
          )}
        </section>

        {/* Paginación y exportación */}
        <footer style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '2rem', 
          padding: '1rem 0' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              &lt;
            </button>
            <span style={{ margin: '0 0.5rem' }}>{currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredUsers.length < 10} // Asumiendo 10 por página
              style={{
                background: 'transparent',
                border: 'none',
                cursor: filteredUsers.length < 10 ? 'default' : 'pointer',
                opacity: filteredUsers.length < 10 ? 0.5 : 1
              }}
            >
              &gt;
            </button>
          </div>
          
          <button
            onClick={handleExportCSV}
            style={{
              background: '#fff',
              border: '2px solid #222',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Exportar a CSV
          </button>
        </footer>
        
        {/* Modal para crear usuario */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '600px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Botón de cerrar */}
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '1rem',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              
              <h2 style={{ 
                borderBottom: '2px solid #222', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Crear usuario
              </h2>
              
              <form onSubmit={handleSubmitUser}>
                <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Primera columna */}
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={newUser.nombre}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        RUT *
                      </label>
                      <input
                        type="text"
                        name="rut"
                        value={newUser.rut}
                        onChange={handleInputChange}
                        required
                        placeholder="12.345.678-9"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Sexo *
                      </label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="sexo"
                            value="Femenino"
                            checked={newUser.sexo === 'Femenino'}
                            onChange={handleInputChange}
                            style={{ marginRight: '0.5rem' }}
                          />
                          Femenino
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="sexo"
                            value="Masculino"
                            checked={newUser.sexo === 'Masculino'}
                            onChange={handleInputChange}
                            style={{ marginRight: '0.5rem' }}
                          />
                          Masculino
                        </label>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Región *
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={newUser.region}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Segunda columna */}
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        name="apellidos"
                        value={newUser.apellidos}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                        Comuna *
                      </label>
                      <input
                        type="text"
                        name="comuna"
                        value={newUser.comuna}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Campo de dirección en una sola línea */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={newUser.direccion}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <hr style={{ margin: '1.5rem 0' }} />
                
                {/* Sección de rol y perfil */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                      Rol
                    </label>
                    <select
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="officer">Funcionario Aduanero</option>
                      <option value="passenger">Pasajero</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem' }}>
                      Asignar perfil
                    </label>
                    <select
                      name="perfil"
                      value={newUser.perfil || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="">Seleccione un perfil</option>
                      <option value="Perfil Aduanero 1">Perfil Aduanero 1</option>
                      <option value="Perfil Aduanero 2">Perfil Aduanero 2</option>
                      <option value="Perfil Admin">Perfil Admin</option>
                    </select>
                  </div>
                </div>
                
                {/* Estado */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Estado
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="estado"
                        value="activo"
                        checked={newUser.estado === 'activo'}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Habilitado
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="estado"
                        value="inactivo"
                        checked={newUser.estado === 'inactivo'}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Inhabilitado
                    </label>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '0.75rem 2rem',
                      background: '#fff',
                      border: '1px solid #222',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 2rem',
                      background: '#222',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'wait' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
