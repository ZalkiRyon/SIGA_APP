// Backend en Node.js + Express para SIGA App
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt'); // No se usará para esta prueba
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { format } = require('date-fns');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root', // Cambia si tu usuario es distinto
  password: '', // Cambia si tienes contraseña
  database: 'siga_app',
};

// Configuración de almacenamiento para archivos de trámites
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Middleware para autenticar token JWT
function authenticateToken(req, res, next) {
  console.log('Authenticating request to:', req.path);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('⚠️ No token provided, bypassing authentication for debugging');
    req.user = { id: 3, role: 'officer' }; // Mock user for testing
    return next();
  }

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      console.log('⚠️ Auth failed, bypassing for debugging');
      req.user = { id: 3, role: 'officer' }; // Mock user for testing
      return next();
    }
    console.log('Token verified successfully for user:', user);
    req.user = user;
    next();
  });
}

// Ruta de autenticación
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const user = rows[0];
    // Comparación directa para pruebas
    if (password !== user.password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    // No se envía la contraseña al frontend
    const { password: _, ...userData } = user;
    // Generar token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, 'secreto', { expiresIn: '1h' });
    res.json({ user: userData, token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Recuperar contraseña (simulado)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Falta el correo' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();
    if (rows.length === 0) {
      // Correo no existe
      return res.status(404).json({ error: 'No existe correo asociado en nuestros registros' });
    }
    // En una implementación real se enviaría correo de recuperación
    return res.json({ ok: true, message: 'Instrucciones para recuperar la contraseña enviadas exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener trámites de validación (para Funcionario Aduanero)
app.get('/api/tramites/validacion', authenticateToken, async (req, res) => {
  // Validar permisos
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden validar trámites.' });
  }

  // Parametros de paginación y filtrado
  console.log('Accediendo a /api/tramites/validacion con query:', req.query);
  
  const {
    search,
    tipo,
    fechaInicio = '30/05/2025',
    estado,
    page = 1,
    limit = 10
  } = req.query;

  const offset = (page - 1) * limit;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a MySQL establecida correctamente');
    
    // --- NUEVO: parámetros y filtros por subconsulta ---
    let queries = [];
    let unionParams = [];

    // Vehículo
    let queryVehiculo = "SELECT tv.id, tv.custom_id customId, tv.fecha_inicio fechaInicio, tv.fecha_creacion fechaCreacion, 'Vehículo temporal' tipo, tv.estado, CONCAT(u.nombre, ' ', u.apellidos) solicitante, tv.patente dato1, tv.marca dato2, tv.modelo dato3 FROM tramites_vehiculo tv JOIN users u ON tv.user_id = u.id WHERE 1=1";
    let paramsVehiculo = [];
    if (search) {
      const searchParam = `%${search}%`;
      queryVehiculo += ` AND (tv.custom_id LIKE ? OR tv.patente LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      paramsVehiculo.push(searchParam, searchParam, searchParam);
    }
    if (fechaInicio) {
      let fechaSQL = '';
      if (fechaInicio.includes('/')) {
        const [day, month, year] = fechaInicio.split('/');
        fechaSQL = `${year}-${month}-${day}`;
      } else {
        fechaSQL = fechaInicio;
      }
      queryVehiculo += ` AND tv.fecha_inicio >= ?`;
      paramsVehiculo.push(fechaSQL);
    }    if (estado) {
      queryVehiculo += ` AND tv.estado = ?`;
      paramsVehiculo.push(estado);
    }
    if (!tipo || tipo === 'vehiculo') {
      queries.push(queryVehiculo);
      unionParams = unionParams.concat(paramsVehiculo);
    }

    // Menores
    let queryMenores = "SELECT tm.id, tm.custom_id customId, tm.fecha_creacion fechaCreacion, tm.menor_nacimiento fechaInicio, 'Documentación Menor' tipo, tm.estado, CONCAT(u.nombre, ' ', u.apellidos) solicitante, CONCAT(tm.menor_nombres, ' ', tm.menor_apellidos) dato1, CONCAT(tm.acomp_nombres, ' ', tm.acomp_apellidos) dato2, tm.menor_rut dato3 FROM tramites_menores tm JOIN users u ON tm.user_id = u.id WHERE 1=1";
    let paramsMenores = [];
    if (search) {
      const searchParam = `%${search}%`;
      queryMenores += ` AND (tm.custom_id LIKE ? OR CONCAT(tm.menor_nombres, ' ', tm.menor_apellidos) LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      paramsMenores.push(searchParam, searchParam, searchParam);
    }
    if (fechaInicio) {
      let fechaSQL = '';
      if (fechaInicio.includes('/')) {
        const [day, month, year] = fechaInicio.split('/');
        fechaSQL = `${year}-${month}-${day}`;
      } else {
        fechaSQL = fechaInicio;
      }
      queryMenores += ` AND tm.fecha_creacion >= ?`;
      paramsMenores.push(fechaSQL);
    }
    if (estado) {
      queryMenores += ` AND tm.estado = ?`;
      paramsMenores.push(estado);
    }    if (!tipo || tipo === 'menor') {
      queries.push(queryMenores);
      unionParams = unionParams.concat(paramsMenores);
    }

    // Alimentos
    let queryAlimentos = "SELECT ta.id, ta.custom_id customId, ta.fecha_creacion fechaCreacion, ta.fecha_creacion fechaInicio, CONCAT('Declaración SAG (', CASE ta.tipo WHEN 'vegetal' THEN 'Vegetal' WHEN 'animal' THEN 'Animal' WHEN 'mascota' THEN 'Mascota' END, ')') tipo, ta.estado, CONCAT(u.nombre, ' ', u.apellidos) solicitante, ta.tipo dato1, ta.cantidad dato2, ta.descripcion dato3 FROM tramites_alimentos ta JOIN users u ON ta.user_id = u.id WHERE 1=1";
    let paramsAlimentos = [];
    if (search) {
      const searchParam = `%${search}%`;
      queryAlimentos += ` AND (ta.custom_id LIKE ? OR ta.descripcion LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      paramsAlimentos.push(searchParam, searchParam, searchParam);
    }
    if (fechaInicio) {
      let fechaSQL = '';
      if (fechaInicio.includes('/')) {
        const [day, month, year] = fechaInicio.split('/');
        fechaSQL = `${year}-${month}-${day}`;
      } else {
        fechaSQL = fechaInicio;
      }
      queryAlimentos += ` AND ta.fecha_creacion >= ?`;
      paramsAlimentos.push(fechaSQL);
    }
    if (estado) {
      queryAlimentos += ` AND ta.estado = ?`;
      paramsAlimentos.push(estado);
    }
    
    // Lógica corregida para los filtros de tipo
    if (!tipo || tipo === 'sag') {
      // Si no hay filtro de tipo o es "sag", incluir todos los alimentos
      queries.push(queryAlimentos);
      unionParams = unionParams.concat(paramsAlimentos);
    } else if (tipo && tipo.startsWith('sag-')) {
      // Si es un subtipo específico de SAG (sag-vegetal, sag-animal, sag-mascota)
      const subTipo = tipo.replace('sag-', '');
      queryAlimentos += ` AND ta.tipo = ?`;
      paramsAlimentos.push(subTipo);
      queries.push(queryAlimentos);
      unionParams = unionParams.concat(paramsAlimentos);
    }

    // Verificar que hay al menos una consulta
    if (queries.length === 0) {
      console.log('No hay consultas para ejecutar con los filtros aplicados');
      await connection.end();
      return res.json({
        tramites: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    }

    const unionQuery = queries.join(' UNION ALL ');
    const countQuery = "SELECT COUNT(*) total FROM (" + unionQuery + ") combined_results";
    const [countResult] = await connection.query(countQuery, unionParams);
    
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Consulta final con paginación
    const finalQuery = unionQuery + " ORDER BY fechaCreacion DESC LIMIT ? OFFSET ?";
    
    // Añadir los parámetros LIMIT y OFFSET como números
    const finalParams = [...unionParams, Number(limit), Number(offset)];
    console.log('Ejecutando SQL con parámetros:', finalParams);
    
    const [results] = await connection.query(finalQuery, finalParams);
    console.log(`Consulta ejecutada con éxito. Resultados obtenidos: ${results.length}`);

    // Transformar resultados para que coincidan con el formato esperado
    const tramites = results.map(row => {
      // Formatear fechas
      const fechaInicio = row.fechaInicio ? format(new Date(row.fechaInicio), 'dd/MM/yyyy') : '';
      const fechaCreacion = row.fechaCreacion ? format(new Date(row.fechaCreacion), 'dd/MM/yyyy') : '';

      const tramite = {
        id: row.id,
        customId: row.customId,
        fechaInicio,
        fechaCreacion,
        tipo: row.tipo,
        estado: row.estado,
        solicitante: row.solicitante,
      };

      // Agregar detalles específicos según el tipo
      if (row.tipo.includes('Vehículo')) {
        tramite.detalles = {
          patente: row.dato1,
          marca: row.dato2,
          modelo: row.dato3
        };
      } else if (row.tipo.includes('Menor')) {
        tramite.detalles = {
          menor: row.dato1,
          acompanante: row.dato2,
          rut: row.dato3
        };
      } else if (row.tipo.includes('SAG')) {
        tramite.detalles = {
          tipo: row.dato1,
          cantidad: row.dato2,
          descripcion: row.dato3
        };
      }

      return tramite;
    });
    
    await connection.end();

    res.json({
      tramites,
      pagination: {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error al obtener trámites para validación:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Error al consultar los trámites de validación', details: err.message });  }
});

// Obtener trámites de vehículo temporal por usuario
app.get('/api/tramites/vehiculo', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    console.log(`Buscando trámites de vehículos para el usuario ${userId}`);
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino, estado, fecha_creacion,
        archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro, custom_id
       FROM tramites_vehiculo WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    // Aseguramos que siempre devolvemos un array, incluso vacío
    if (!rows || !rows.length) {
      console.log(`No se encontraron trámites de vehículos para el usuario ${userId}`);
      return res.json([]);
    }
    console.log(`Se encontraron ${rows.length} trámites de vehículos para el usuario ${userId}`);
    const data = rows.map(row => ({
      id: row.custom_id || row.id,
      fechaInicio: row.fecha_inicio ? row.fecha_inicio.toISOString().split('T')[0] : '',
      fechaTermino: row.fecha_termino ? row.fecha_termino.toISOString().split('T')[0] : '',
      tipo: 'Vehículo temporal',
      estado: row.estado,
      archivos: {
        cedula: row.archivo_cedula,
        licencia: row.archivo_licencia,
        revision: row.archivo_revision,
        salida: row.archivo_salida,
        autorizacion: row.archivo_autorizacion,
        certificado: row.archivo_certificado,
        seguro: row.archivo_seguro
      }
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener trámites de menores de edad por usuario
app.get('/api/tramites/menores', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    console.log(`Buscando trámites de menores para el usuario ${userId}`);
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento, acomp_nombres, acomp_apellidos, acomp_rut, estado, fecha_creacion, archivo_identidad, archivo_autorizacion, custom_id
       FROM tramites_menores WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    // Aseguramos que siempre devolvemos un array, incluso vacío
    if (!rows || !rows.length) {
      console.log(`No se encontraron trámites de menores para el usuario ${userId}`);
      return res.json([]);
    }
    console.log(`Se encontraron ${rows.length} trámites de menores para el usuario ${userId}`);
    const data = rows.map(row => ({
      id: row.custom_id || row.id,
      menorNombres: row.menor_nombres,
      menorApellidos: row.menor_apellidos,
      menorRut: row.menor_rut,
      menorNacimiento: row.menor_nacimiento ? row.menor_nacimiento.toISOString().split('T')[0] : '',
      acompNombres: row.acomp_nombres,
      acompApellidos: row.acomp_apellidos,
      acompRut: row.acomp_rut,
      tipo: 'Menores de edad',
      estado: row.estado,
      archivos: {
        identidad: row.archivo_identidad,
        autorizacion: row.archivo_autorizacion
      }
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámites de alimentos/mascotas (incluye mascotas) por usuario
app.get('/api/tramites/alimentos', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    console.log(`Buscando trámites de alimentos/mascotas para el usuario ${userId}`);
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, tipo, cantidad, transporte, descripcion, estado, fecha_creacion, fecha_aprobacion, fecha_rechazo, custom_id FROM tramites_alimentos WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    
    // Aseguramos que siempre devolvemos un array, incluso vacío
    if (!rows || !rows.length) {
      console.log(`No se encontraron trámites de alimentos/mascotas para el usuario ${userId}`);
      await conn.end();
      return res.json([]);
    }
    
    console.log(`Se encontraron ${rows.length} trámites de alimentos/mascotas para el usuario ${userId}`);
    const data = await Promise.all(rows.map(async row => {
      let documentos = null;
      if (row.tipo === 'mascota') {
        const [docs] = await conn.execute(
          `SELECT tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo FROM documentos_mascotas WHERE tramite_id = ?`,
          [row.id]
        );
        if (docs.length > 0) {
          documentos = {
            tipoMascota: docs[0].tipo_mascota,
            registro: docs[0].archivo_registro,
            vacunas: docs[0].archivo_vacunas,
            desparasitacion: docs[0].archivo_desparasitacion,
            zoo: docs[0].archivo_zoo
          };
        }
      }
      let fechaTermino = null;
      if (row.estado === 'Aprobado' && row.fecha_aprobacion) {
        fechaTermino = new Date(row.fecha_aprobacion).toISOString().split('T')[0];
      } else if (row.estado === 'Rechazado' && row.fecha_rechazo) {
        fechaTermino = new Date(row.fecha_rechazo).toISOString().split('T')[0];
      }
      return {
        id: row.custom_id || row.id,
        tipo: row.tipo,
        cantidad: row.tipo === 'mascota' ? null : row.cantidad,
        transporte: row.transporte,
        descripcion: row.descripcion,
        estado: row.estado,
        fechaCreacion: row.fecha_creacion,
        fechaInicio: new Date(row.fecha_creacion).toISOString().split('T')[0],
        fechaTermino: fechaTermino,
        documentosMascota: documentos
      };
    }));
    await conn.end();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener detalles de un trámite específico
app.get('/api/tramites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar primero si es un trámite de vehículo
    let [vehiculos] = await connection.query(
      'SELECT v.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono FROM tramites_vehiculo v JOIN users u ON v.user_id = u.id WHERE v.id = ? OR v.custom_id = ?',
      [id, id]
    );
    
    if (vehiculos.length > 0) {
      const tramite = vehiculos[0];
      
      // Formatear la información para el frontend
      const detallesTramite = {
        id: tramite.id,
        customId: tramite.custom_id,
        tipo: 'Vehículo temporal',
        estado: tramite.estado,
        fechaInicio: format(new Date(tramite.fecha_inicio), 'dd/MM/yyyy'),
        fechaTermino: format(new Date(tramite.fecha_termino), 'dd/MM/yyyy'),
        fechaCreacion: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        solicitante: {
          nombre: tramite.nombre + ' ' + tramite.apellidos,
          rut: tramite.rut,
          email: tramite.email,
          telefono: tramite.telefono
        },
        detalles: {
          patente: tramite.patente,
          marca: tramite.marca,
          modelo: tramite.modelo,
          anio: tramite.anio,
          color: tramite.color
        },
        documentos: [
          { nombre: 'Cédula de identidad', archivo: tramite.archivo_cedula },
          { nombre: 'Licencia de conducir', archivo: tramite.archivo_licencia },
          { nombre: 'Revisión técnica', archivo: tramite.archivo_revision },
          { nombre: 'Permiso de salida del vehículo', archivo: tramite.archivo_salida },
          { nombre: 'Certificado de registro', archivo: tramite.archivo_certificado },
          { nombre: 'Seguro obligatorio', archivo: tramite.archivo_seguro }
        ].filter(doc => doc.archivo) // Solo incluir documentos que existan
      };
      
      // Agregar autorización solo si existe
      if (tramite.archivo_autorizacion) {
        detallesTramite.documentos.push({
          nombre: 'Autorización del propietario',
          archivo: tramite.archivo_autorizacion
        });
      }
      
      await connection.end();
      return res.json(detallesTramite);
    }
    
    // Si no es vehículo, verificar si es trámite de menores
    let [menores] = await connection.query(
      'SELECT m.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono FROM tramites_menores m JOIN users u ON m.user_id = u.id WHERE m.id = ? OR m.custom_id = ?',
      [id, id]
    );
    
    if (menores.length > 0) {
      const tramite = menores[0];
      
      // Formatear fechas
      const fechaNacimiento = format(new Date(tramite.menor_nacimiento), 'dd/MM/yyyy');
      
      // Formatear para el frontend
      const detallesTramite = {
        id: tramite.id,
        customId: tramite.custom_id,
        tipo: 'Documentación para Menor de Edad',
        estado: tramite.estado,
        fechaInicio: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        fechaCreacion: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        solicitante: {
          nombre: tramite.nombre + ' ' + tramite.apellidos,
          rut: tramite.rut,
          email: tramite.email,
          telefono: tramite.telefono
        },
        detalles: {
          menor: {
            nombre: tramite.menor_nombres + ' ' + tramite.menor_apellidos,
            rut: tramite.menor_rut,
            fechaNacimiento
          },
          acompanante: {
            nombre: tramite.acomp_nombres + ' ' + tramite.acomp_apellidos,
            rut: tramite.acomp_rut
          }
        },
        documentos: [
          { nombre: 'Documento de identidad', archivo: tramite.archivo_identidad },
          { nombre: 'Autorización de viaje', archivo: tramite.archivo_autorizacion }
        ]
      };
      
      await connection.end();
      return res.json(detallesTramite);
    }
    
    // Finalmente, verificar si es trámite de alimentos/mascotas
    let [alimentos] = await connection.query(
      'SELECT a.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono FROM tramites_alimentos a JOIN users u ON a.user_id = u.id WHERE a.id = ? OR a.custom_id = ?',
      [id, id]
    );
    
    if (alimentos.length > 0) {
      const tramite = alimentos[0];
      
      // Obtener documentos específicos para mascotas si es necesario
      let documentosMascota = null;
      if (tramite.tipo === 'mascota') {
        [documentosMascota] = await connection.query(
          'SELECT tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo FROM documentos_mascotas WHERE tramite_id = ?',
          [tramite.id]
        );
      }
      
      // Determinar título según el tipo
      let tipoLabel = '';
      switch(tramite.tipo) {
        case 'vegetal': tipoLabel = 'Declaración SAG (Vegetal)'; break;
        case 'animal': tipoLabel = 'Declaración SAG (Animal)'; break;
        case 'mascota': tipoLabel = 'Declaración SAG (Mascota)'; break;
      }
      
      // Determinar fecha de término basada en el estado y las fechas disponibles
      let fechaTermino = '';
      if (tramite.estado === 'Aprobado' && tramite.fecha_aprobacion) {
        fechaTermino = format(new Date(tramite.fecha_aprobacion), 'dd/MM/yyyy');
      } else if (tramite.estado === 'Rechazado' && tramite.fecha_rechazo) {
        fechaTermino = format(new Date(tramite.fecha_rechazo), 'dd/MM/yyyy');
      }
      
      // Formatear para el frontend
      const detallesTramite = {
        id: tramite.id,
        customId: tramite.custom_id,
        tipo: tipoLabel,
        estado: tramite.estado,
        fechaInicio: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        fechaCreacion: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        fechaTermino: fechaTermino || null,
        solicitante: {
          nombre: tramite.nombre + ' ' + tramite.apellidos,
          rut: tramite.rut,
          email: tramite.email,
          telefono: tramite.telefono
        },
        detalles: {
          tipo: tramite.tipo,
          cantidad: tramite.cantidad.toString(),
          descripcion: tramite.descripcion,
          transporte: tramite.transporte
        },
        documentos: []
      };
      
      // Agregar documentos específicos para mascotas
      if (documentosMascota && documentosMascota.length > 0) {
        const docs = documentosMascota[0];
        detallesTramite.detalles.tipoMascota = docs.tipo_mascota;
        
        detallesTramite.documentos = [
          { nombre: 'Registro de mascota', archivo: docs.archivo_registro },
          { nombre: 'Certificado de vacunación', archivo: docs.archivo_vacunas },
          { nombre: 'Certificado de desparasitación', archivo: docs.archivo_desparasitacion },
          { nombre: 'Certificado zoosanitario', archivo: docs.archivo_zoo }
        ];
      }
      
      await connection.end();
      return res.json(detallesTramite);
    }
    
    // Si no se encontró ningún trámite
    await connection.end();
    return res.status(404).json({ error: 'Trámite no encontrado' });

  } catch (err) {
    console.error('Error al obtener detalles del trámite:', err);
    res.status(500).json({ error: 'Error al consultar los detalles del trámite' });
  }
});

// Endpoint para aprobar un trámite
app.post('/api/tramites/:id/aprobar', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea funcionario aduanero
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden aprobar trámites.' });
  }

  const { id } = req.params;
  const { observaciones } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Determinar el tipo de trámite por su ID o custom_id
    let tramiteEncontrado = false;
    
    // Verificar en tramites_vehiculo
    let [vehiculos] = await connection.query(
      'SELECT id FROM tramites_vehiculo WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (vehiculos.length > 0) {
      await connection.query(
        'UPDATE tramites_vehiculo SET estado = ? WHERE id = ?',
        ['Aprobado', vehiculos[0].id]
      );
      tramiteEncontrado = true;
    }
    
    // Verificar en tramites_menores
    if (!tramiteEncontrado) {
      let [menores] = await connection.query(
        'SELECT id FROM tramites_menores WHERE id = ? OR custom_id = ?',
        [id, id]
      );
      
      if (menores.length > 0) {
        await connection.query(
          'UPDATE tramites_menores SET estado = ? WHERE id = ?',
          ['Aprobado', menores[0].id]
        );
        tramiteEncontrado = true;
      }
    }
    
    // Verificar en tramites_alimentos
    if (!tramiteEncontrado) {
      let [alimentos] = await connection.query(
        'SELECT id FROM tramites_alimentos WHERE id = ? OR custom_id = ?',
        [id, id]
      );
      
      if (alimentos.length > 0) {
        await connection.query(
          'UPDATE tramites_alimentos SET estado = ?, fecha_aprobacion = NOW() WHERE id = ?',
          ['Aprobado', alimentos[0].id]
        );
        tramiteEncontrado = true;
      }
    }
    
    await connection.end();
    
    if (!tramiteEncontrado) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    res.json({ 
      success: true, 
      message: 'Trámite aprobado correctamente' 
    });
    
  } catch (err) {
    console.error('Error al aprobar trámite:', err);
    res.status(500).json({ error: 'Error al aprobar el trámite' });
  }
});

// Endpoint para rechazar un trámite
app.post('/api/tramites/:id/rechazar', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea funcionario aduanero
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden rechazar trámites.' });
  }

  const { id } = req.params;
  const { motivo } = req.body;
  
  if (!motivo) {
    return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Determinar el tipo de trámite por su ID o custom_id
    let tramiteEncontrado = false;
    
    // Verificar en tramites_vehiculo
    let [vehiculos] = await connection.query(
      'SELECT id FROM tramites_vehiculo WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (vehiculos.length > 0) {
      await connection.query(
        'UPDATE tramites_vehiculo SET estado = ? WHERE id = ?',
        ['Rechazado', vehiculos[0].id]
      );
      tramiteEncontrado = true;
    }
    
    // Verificar en tramites_menores
    if (!tramiteEncontrado) {
      let [menores] = await connection.query(
        'SELECT id FROM tramites_menores WHERE id = ? OR custom_id = ?',
        [id, id]
      );
      
      if (menores.length > 0) {
        await connection.query(
          'UPDATE tramites_menores SET estado = ? WHERE id = ?',
          ['Rechazado', menores[0].id]
        );
        tramiteEncontrado = true;
      }
    }
    
    // Verificar en tramites_alimentos
    if (!tramiteEncontrado) {
      let [alimentos] = await connection.query(
        'SELECT id FROM tramites_alimentos WHERE id = ? OR custom_id = ?',
        [id, id]
      );
      
      if (alimentos.length > 0) {
        await connection.query(
          'UPDATE tramites_alimentos SET estado = ?, fecha_rechazo = NOW() WHERE id = ?',
          ['Rechazado', alimentos[0].id]
        );
        tramiteEncontrado = true;
      }
    }
    
    await connection.end();
    
    if (!tramiteEncontrado) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    res.json({ 
      success: true, 
      message: 'Trámite rechazado correctamente' 
    });
    
  } catch (err) {
    console.error('Error al rechazar trámite:', err);
    res.status(500).json({ error: 'Error al rechazar el trámite' });
  }
});

// Endpoint para generar reportes (para Funcionario Aduanero)
app.get('/api/reportes', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea funcionario aduanero
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden acceder a reportes.' });
  }

  const { tipo, fechaInicio, fechaFin } = req.query;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Simular datos de reportes
    const reportes = {
      tramitesTotal: 0,
      tramitesAprobados: 0,
      tramitesRechazados: 0,
      tramitesPendientes: 0,
      distribucionPorTipo: {
        vehiculo: 0,
        menores: 0,
        sag: {
          vegetal: 0,
          animal: 0,
          mascota: 0
        }
      }
    };
    
    // Obtener estadísticas reales de la base de datos
    // Contar trámites de vehículo
    const [vehiculos] = await connection.query(
      `SELECT estado, COUNT(*) as total FROM tramites_vehiculo 
       GROUP BY estado`
    );
    
    // Contar trámites de menores
    const [menores] = await connection.query(
      `SELECT estado, COUNT(*) as total FROM tramites_menores 
       GROUP BY estado`
    );
    
    // Contar trámites de alimentos
    const [alimentos] = await connection.query(
      `SELECT tipo, estado, COUNT(*) as total FROM tramites_alimentos 
       GROUP BY tipo, estado`
    );
    
    // Procesar resultados de vehículos
    vehiculos.forEach(row => {
      reportes.distribucionPorTipo.vehiculo += row.total;
      reportes.tramitesTotal += row.total;
      
      switch(row.estado) {
        case 'Aprobado': reportes.tramitesAprobados += row.total; break;
        case 'Rechazado': reportes.tramitesRechazados += row.total; break;
        case 'En revisión': reportes.tramitesPendientes += row.total; break;
      }
    });
    
    // Procesar resultados de menores
    menores.forEach(row => {
      reportes.distribucionPorTipo.menores += row.total;
      reportes.tramitesTotal += row.total;
      
      switch(row.estado) {
        case 'Aprobado': reportes.tramitesAprobados += row.total; break;
        case 'Rechazado': reportes.tramitesRechazados += row.total; break;
        case 'En revisión': reportes.tramitesPendientes += row.total; break;
      }
    });
    
    // Procesar resultados de alimentos
    alimentos.forEach(row => {
      reportes.distribucionPorTipo.sag[row.tipo] += row.total;
      reportes.tramitesTotal += row.total;
      
      switch(row.estado) {
        case 'Aprobado': reportes.tramitesAprobados += row.total; break;
        case 'Rechazado': reportes.tramitesRechazados += row.total; break;
        case 'En revisión': reportes.tramitesPendientes += row.total; break;
      }
    });
    
    await connection.end();
    
    res.json(reportes);
    
  } catch (err) {
    console.error('Error al generar reporte:', err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

// Endpoint para obtener alertas (para Funcionario Aduanero)
app.get('/api/alertas', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea funcionario aduanero
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden acceder a alertas.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Obtener trámites pendientes
    const [pendientes] = await connection.query(
      `SELECT 'vehiculo' as tipo, id, custom_id, fecha_creacion
       FROM tramites_vehiculo 
       WHERE estado = 'En revisión'
       UNION ALL
       SELECT 'menor' as tipo, id, custom_id, fecha_creacion
       FROM tramites_menores 
       WHERE estado = 'En revisión'
       UNION ALL
       SELECT tipo, id, custom_id, fecha_creacion
       FROM tramites_alimentos 
       WHERE estado = 'En revisión'
       ORDER BY fecha_creacion ASC
       LIMIT 10`
    );
    
    // Formateamos los resultados para el frontend
    const alertas = pendientes.map(tramite => {
      let tipoTexto = '';
      switch(tramite.tipo) {
        case 'vehiculo': tipoTexto = 'Trámite de vehículo temporal'; break;
        case 'menor': tipoTexto = 'Documentación para menor'; break;
        case 'vegetal': tipoTexto = 'Declaración SAG (Vegetal)'; break;
        case 'animal': tipoTexto = 'Declaración SAG (Animal)'; break;
        case 'mascota': tipoTexto = 'Declaración SAG (Mascota)'; break;
      }
      
      return {
        id: tramite.id,
        customId: tramite.custom_id,
        tipo: tipoTexto,
        fecha: format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy'),
        mensaje: `Trámite ${tramite.custom_id} pendiente de revisión desde ${format(new Date(tramite.fecha_creacion), 'dd/MM/yyyy')}`
      };
    });
    
    await connection.end();
    
    res.json(alertas);
    
  } catch (err) {
    console.error('Error al obtener alertas:', err);
    res.status(500).json({ error: 'Error al obtener las alertas' });
  }
});

// Endpoint para obtener historial de actividad (solo para admin)
app.get('/api/historial', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden acceder al historial.' });
  }

  // Simular datos de historial
  // En una implementación real, estos datos provendrían de una tabla en la base de datos
  const historial = [
    {
      id: 1,
      usuario: 'Carlos González',
      accion: 'Aprobación de trámite',
      recurso: 'VEH-0003',
      fecha: '20/06/2025',
      hora: '14:35'
    },
    {
      id: 2,
      usuario: 'Ana Martínez',
      accion: 'Rechazo de trámite',
      recurso: 'MEN-0002',
      fecha: '20/06/2025',
      hora: '11:20'
    },
    {
      id: 3,
      usuario: 'Pedro Soto',
      accion: 'Inicio de sesión',
      recurso: '-',
      fecha: '20/06/2025',
      hora: '09:15'
    },
    {
      id: 4,
      usuario: 'Ana Martínez',
      accion: 'Aprobación de trámite',
      recurso: 'VEG-0001',
      fecha: '19/06/2025',
      hora: '16:40'
    },
    {
      id: 5,
      usuario: 'Carlos González',
      accion: 'Cambio de configuración',
      recurso: 'Perfil',
      fecha: '19/06/2025',
      hora: '10:05'
    }
  ];
  
  res.json(historial);
});

// Endpoint para administrar usuarios (solo para admin)
app.get('/api/users', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden administrar usuarios.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Obtener todos los usuarios
    const [users] = await connection.query(
      `SELECT id, nombre, apellidos, rut, email, role, estado FROM users ORDER BY id`
    );
    
    await connection.end();
    
    // Determinar acciones basadas en el rol
    const usuarios = users.map(user => ({
      id: user.id,
      nombre: `${user.nombre} ${user.apellidos}`,
      rut: user.rut,
      email: user.email,
      rol: user.role,
      estado: user.estado,
      acciones: {
        editar: true,
        eliminar: user.role !== 'admin' || user.id !== req.user.id,
        desactivar: user.estado === 'activo' && (user.role !== 'admin' || user.id !== req.user.id),
        activar: user.estado === 'inactivo'
      }
    }));
    
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al consultar los usuarios' });
  }
});

// Endpoint para actualizar estado de usuario (solo para admin)
app.put('/api/users/:id/estado', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden modificar usuarios.' });
  }

  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado || !['activo', 'inactivo'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar que no sea uno mismo si es admin
    const [admins] = await connection.query(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    
    if (admins.length > 0 && admins[0].role === 'admin' && parseInt(id) === req.user.id) {
      await connection.end();
      return res.status(403).json({ error: 'No puede cambiar su propio estado como administrador' });
    }
    
    // Actualizar estado
    await connection.query(
      'UPDATE users SET estado = ? WHERE id = ?',
      [estado, id]
    );
    
    await connection.end();
    
    res.json({ 
      success: true, 
      message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente` 
    });
  } catch (err) {
    console.error('Error al actualizar estado de usuario:', err);
    res.status(500).json({ error: 'Error al actualizar el estado del usuario' });
  }
});

// Endpoint para eliminar usuario (solo para admin)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden eliminar usuarios.' });
  }

  const { id } = req.params;
  
  // Para implementarlo completamente, necesitarías añadir un campo 'estado' a la tabla users
  // En este ejemplo, simplemente devolvemos success
  res.json({ success: true, message: 'Usuario eliminado correctamente' });
});

// Endpoint para obtener todas las incidencias (solo para admin)
app.get('/api/incidencias', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden ver incidencias.' });
  }

  // Simular datos de incidencias
  // En una implementación real, estos datos provendrían de una tabla en la base de datos
  const incidencias = [
    {
      id: 1,
      tipo: 'Error de sistema',
      descripcion: 'Error al procesar trámite VEH-0002',
      estado: 'Pendiente',
      fechaReporte: '21/06/2025',
      reportadoPor: 'Carlos González'
    },
    {
      id: 2,
      tipo: 'Problema de acceso',
      descripcion: 'No se puede acceder al módulo de reportes',
      estado: 'En proceso',
      fechaReporte: '20/06/2025',
      reportadoPor: 'Ana Martínez'
    },
    {
      id: 3,
      tipo: 'Funcionalidad incorrecta',
      descripcion: 'El filtro de búsqueda no funciona correctamente',
      estado: 'Resuelto',
      fechaReporte: '19/06/2025',
      reportadoPor: 'Pedro Soto'
    },
    {
      id: 4,
      usuario: 'Ana Martínez',
      accion: 'Rechazo de trámite',
      recurso: 'MEN-0002',
      fecha: '20/06/2025',
      hora: '11:20'
    },
    {
      id: 5,
      usuario: 'Carlos González',
      accion: 'Cambio de configuración',
      recurso: 'Perfil',
      fecha: '19/06/2025',
      hora: '10:05'
    }
  ];
  
  res.json(incidencias);
});

// Endpoint para obtener configuración global (solo para admin)
app.get('/api/configuracion', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden ver la configuración global.' });
  }

  // En una implementación real, estas configuraciones se obtendrían de la base de datos
  const configuracion = {
    sistema: {
      diasRetencionDatos: 365,
      intentosMaximosLogin: 5,
      tiempoBloqueoLogin: 30,
      validacionDosPasos: true,
      almacenamientoArchivos: 'local', // local, s3, azure, etc.
    },
    notificaciones: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      frecuenciaDigest: 'diario' // diario, semanal, mensual
    },
    seguridad: {
      complejidadPassword: 'alta', // baja, media, alta
      caducidadPassword: 90, // días
      sesionMaximaDuracion: 120, // minutos
      ipRestriction: false
    }
  };
  
  res.json(configuracion);
});

// Endpoint para actualizar configuración global (solo para admin)
app.put('/api/configuracion', authenticateToken, async (req, res) => {
  // Verificar que el usuario sea administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores pueden modificar la configuración global.' });
  }

  const { configuracion } = req.body;
  
  // Validar configuración mínima
  if (!configuracion || !configuracion.sistema || !configuracion.notificaciones || !configuracion.seguridad) {
    return res.status(400).json({ error: 'Configuración incompleta' });
  }
  
  // En una implementación real, guardaríamos estas configuraciones en la base de datos
  
  res.json({ 
    success: true, 
    message: 'Configuración actualizada correctamente' 
  });
});

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, async () => {
  console.log(`Backend SIGA escuchando en http://localhost:${PORT}`);
  
  // Probar conexión a la base de datos
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    // Consulta de prueba
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Consulta de prueba exitosa. Número de usuarios: ${rows[0].count}`);
    
    await connection.end();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);  }
});

// Endpoints para obtener trámites individuales por ID

// Obtener trámite de vehículo individual
app.get('/api/tramites/vehiculo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM tramites_vehiculo WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    await conn.end();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const tramite = rows[0];
    res.json({
      id: tramite.id,
      customId: tramite.custom_id,
      patente: tramite.patente,
      marca: tramite.marca,
      modelo: tramite.modelo,
      anio: tramite.anio,
      color: tramite.color,
      fechaInicio: tramite.fecha_inicio,
      fechaTermino: tramite.fecha_termino,
      estado: tramite.estado,
      archivos: {
        cedula: tramite.archivo_cedula,
        licencia: tramite.archivo_licencia,
        revision: tramite.archivo_revision,
        salida: tramite.archivo_salida,
        autorizacion: tramite.archivo_autorizacion,
        certificado: tramite.archivo_certificado,
        seguro: tramite.archivo_seguro
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámite de menores individual
app.get('/api/tramites/menores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM tramites_menores WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    await conn.end();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const tramite = rows[0];
    res.json({
      id: tramite.id,
      customId: tramite.custom_id,
      menorNombres: tramite.menor_nombres,
      menorApellidos: tramite.menor_apellidos,
      menorRut: tramite.menor_rut,
      menorNacimiento: tramite.menor_nacimiento,
      acompNombres: tramite.acomp_nombres,
      acompApellidos: tramite.acomp_apellidos,
      acompRut: tramite.acomp_rut,
      estado: tramite.estado,
      archivos: {
        identidad: tramite.archivo_identidad,
        autorizacion: tramite.archivo_autorizacion
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámite de alimentos individual
app.get('/api/tramites/alimentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM tramites_alimentos WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (rows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const tramite = rows[0];
    let documentosMascota = null;
    
    if (tramite.tipo === 'mascota') {
      const [docs] = await conn.execute(
        'SELECT * FROM documentos_mascotas WHERE tramite_id = ?',
        [tramite.id]
      );
      if (docs.length > 0) {
        documentosMascota = docs[0];
      }
    }
    
    await conn.end();
    
    res.json({
      id: tramite.id,
      customId: tramite.custom_id,
      tipo: tramite.tipo,
      cantidad: tramite.cantidad,
      transporte: tramite.transporte,
      descripcion: tramite.descripcion,
      estado: tramite.estado,
      documentosMascota
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoints para editar trámites

// Editar trámite de vehículo
app.put('/api/tramites/vehiculo/:id', upload.fields([
  { name: 'cedula', maxCount: 1 },
  { name: 'licencia', maxCount: 1 },
  { name: 'revision', maxCount: 1 },
  { name: 'salida', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'seguro', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    const {
      patente, marca, modelo, anio, color,
      fechaInicio, fechaTermino
    } = req.body;

    const conn = await mysql.createConnection(dbConfig);
    
    // Obtener trámite actual
    const [currentRows] = await conn.execute(
      'SELECT * FROM tramites_vehiculo WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (currentRows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const current = currentRows[0];
    const files = req.files;
    
    // Usar archivos nuevos si se subieron, sino mantener los existentes
    const archivoCedula = files.cedula ? files.cedula[0].filename : current.archivo_cedula;
    const archivoLicencia = files.licencia ? files.licencia[0].filename : current.archivo_licencia;
    const archivoRevision = files.revision ? files.revision[0].filename : current.archivo_revision;
    const archivoSalida = files.salida ? files.salida[0].filename : current.archivo_salida;
    const archivoAutorizacion = files.autorizacion ? files.autorizacion[0].filename : current.archivo_autorizacion;
    const archivoCertificado = files.certificado ? files.certificado[0].filename : current.archivo_certificado;
    const archivoSeguro = files.seguro ? files.seguro[0].filename : current.archivo_seguro;

    // Actualizar trámite
    await conn.execute(`
      UPDATE tramites_vehiculo SET
      patente = ?, marca = ?, modelo = ?, anio = ?, color = ?,
      fecha_inicio = ?, fecha_termino = ?,
      archivo_cedula = ?, archivo_licencia = ?, archivo_revision = ?,
      archivo_salida = ?, archivo_autorizacion = ?, archivo_certificado = ?,
      archivo_seguro = ?
      WHERE id = ?
    `, [
      patente, marca, modelo, anio, color, fechaInicio, fechaTermino,
      archivoCedula, archivoLicencia, archivoRevision, archivoSalida,
      archivoAutorizacion, archivoCertificado, archivoSeguro, current.id
    ]);

    await conn.end();

    res.json({
      success: true,
      message: 'Trámite actualizado exitosamente'
    });

  } catch (err) {
    console.error('Error al actualizar trámite de vehículo:', err);
    res.status(500).json({ error: 'Error al actualizar el trámite', details: err.message });
  }
});

// Editar trámite de menores
app.put('/api/tramites/menores/:id', upload.fields([
  { name: 'identidad', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    const {
      menorNombres, menorApellidos, menorRut, menorNacimiento,
      acompNombres, acompApellidos, acompRut
    } = req.body;

    const conn = await mysql.createConnection(dbConfig);
    
    // Obtener trámite actual
    const [currentRows] = await conn.execute(
      'SELECT * FROM tramites_menores WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (currentRows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const current = currentRows[0];
    const files = req.files;
    
    // Usar archivos nuevos si se subieron, sino mantener los existentes
    const archivoIdentidad = files.identidad ? files.identidad[0].filename : current.archivo_identidad;
    const archivoAutorizacion = files.autorizacion ? files.autorizacion[0].filename : current.archivo_autorizacion;

    // Actualizar trámite
    await conn.execute(`
      UPDATE tramites_menores SET
      menor_nombres = ?, menor_apellidos = ?, menor_rut = ?, menor_nacimiento = ?,
      acomp_nombres = ?, acomp_apellidos = ?, acomp_rut = ?,
      archivo_identidad = ?, archivo_autorizacion = ?
      WHERE id = ?
    `, [
      menorNombres, menorApellidos, menorRut, menorNacimiento,
      acompNombres, acompApellidos, acompRut,
      archivoIdentidad, archivoAutorizacion, current.id
    ]);

    await conn.end();

    res.json({
      success: true,
      message: 'Trámite actualizado exitosamente'
    });

  } catch (err) {
    console.error('Error al actualizar trámite de menores:', err);
    res.status(500).json({ error: 'Error al actualizar el trámite', details: err.message });
  }
});

// Editar trámite de alimentos
app.put('/api/tramites/alimentos/:id', upload.fields([
  { name: 'registro', maxCount: 1 },
  { name: 'vacunas', maxCount: 1 },
  { name: 'desparasitacion', maxCount: 1 },
  { name: 'zoo', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    const {
      tipo, cantidad, transporte, descripcion, tipoMascota
    } = req.body;

    const conn = await mysql.createConnection(dbConfig);
    
    // Obtener trámite actual
    const [currentRows] = await conn.execute(
      'SELECT * FROM tramites_alimentos WHERE id = ? OR custom_id = ?',
      [id, id]
    );
    
    if (currentRows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    
    const current = currentRows[0];

    // Actualizar trámite principal
    await conn.execute(`
      UPDATE tramites_alimentos SET
      tipo = ?, cantidad = ?, transporte = ?, descripcion = ?
      WHERE id = ?
    `, [tipo, cantidad, transporte, descripcion, current.id]);

    // Si es mascota, actualizar documentos adicionales
    if (tipo === 'mascota' && req.files) {
      const files = req.files;
      
      // Verificar si ya existen documentos de mascota
      const [existingDocs] = await conn.execute(
        'SELECT * FROM documentos_mascotas WHERE tramite_id = ?',
        [current.id]
      );
      
      if (existingDocs.length > 0) {
        // Actualizar documentos existentes
        const existing = existingDocs[0];
        const archivoRegistro = files.registro ? files.registro[0].filename : existing.archivo_registro;
        const archivoVacunas = files.vacunas ? files.vacunas[0].filename : existing.archivo_vacunas;
        const archivoDesparasitacion = files.desparasitacion ? files.desparasitacion[0].filename : existing.archivo_desparasitacion;
        const archivoZoo = files.zoo ? files.zoo[0].filename : existing.archivo_zoo;
        
        await conn.execute(`
          UPDATE documentos_mascotas SET
          tipo_mascota = ?, archivo_registro = ?, archivo_vacunas = ?,
          archivo_desparasitacion = ?, archivo_zoo = ?
          WHERE tramite_id = ?
        `, [
          tipoMascota || existing.tipo_mascota,
          archivoRegistro, archivoVacunas, archivoDesparasitacion, archivoZoo,
          current.id
        ]);
      } else {
        // Crear nuevos documentos de mascota
        const archivoRegistro = files.registro ? files.registro[0].filename : null;
        const archivoVacunas = files.vacunas ? files.vacunas[0].filename : null;
        const archivoDesparasitacion = files.desparasitacion ? files.desparasitacion[0].filename : null;
        const archivoZoo = files.zoo ? files.zoo[0].filename : null;
        
        if (archivoRegistro || archivoVacunas || archivoDesparasitacion || archivoZoo) {
          await conn.execute(`
            INSERT INTO documentos_mascotas 
            (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            current.id, tipoMascota || 'No especificado',
            archivoRegistro, archivoVacunas, archivoDesparasitacion, archivoZoo
          ]);
        }
      }
    }

    await conn.end();

    res.json({
      success: true,
      message: 'Trámite actualizado exitosamente'
    });

  } catch (err) {
    console.error('Error al actualizar trámite de alimentos:', err);
    res.status(500).json({ error: 'Error al actualizar el trámite', details: err.message });
  }
});

// Endpoint para crear nuevo trámite de vehículo temporal
app.post('/api/tramites/vehiculo', upload.fields([
  { name: 'cedula', maxCount: 1 },
  { name: 'licencia', maxCount: 1 },
  { name: 'revision', maxCount: 1 },
  { name: 'salida', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'seguro', maxCount: 1 }
]), async (req, res) => {
  console.log('📝 Creando nuevo trámite de vehículo...');
  console.log('Datos recibidos:', req.body);
  console.log('Archivos recibidos:', Object.keys(req.files || {}));
  
  try {
    const {
      userId, patente, marca, modelo, anio, color,
      fechaInicio, fechaTermino
    } = req.body;

    if (!userId || !patente || !marca || !modelo || !anio || !color || !fechaInicio || !fechaTermino) {
      console.log('❌ Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const conn = await mysql.createConnection(dbConfig);
    
    // Generar ID personalizado
    const [seqResult] = await conn.execute('SELECT last_number FROM tramite_sequences WHERE tipo = "vehiculo"');
    const nextNumber = seqResult[0].last_number + 1;
    const customId = `VEH-${nextNumber.toString().padStart(4, '0')}`;
    
    // Actualizar secuencia
    await conn.execute('UPDATE tramite_sequences SET last_number = ? WHERE tipo = "vehiculo"', [nextNumber]);

    // Obtener nombres de archivos
    const files = req.files;
    const archivoCedula = files.cedula ? files.cedula[0].filename : null;
    const archivoLicencia = files.licencia ? files.licencia[0].filename : null;
    const archivoRevision = files.revision ? files.revision[0].filename : null;
    const archivoSalida = files.salida ? files.salida[0].filename : null;
    const archivoAutorizacion = files.autorizacion ? files.autorizacion[0].filename : null;
    const archivoCertificado = files.certificado ? files.certificado[0].filename : null;
    const archivoSeguro = files.seguro ? files.seguro[0].filename : null;

    console.log('✅ Insertando trámite con ID:', customId);

    // Insertar trámite
    const [result] = await conn.execute(`
      INSERT INTO tramites_vehiculo 
      (user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
       archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, 
       archivo_autorizacion, archivo_certificado, archivo_seguro, custom_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, patente, marca, modelo, anio, color, fechaInicio, fechaTermino,
      archivoCedula, archivoLicencia, archivoRevision, archivoSalida,
      archivoAutorizacion, archivoCertificado, archivoSeguro, customId
    ]);

    await conn.end();

    console.log('🎉 Trámite creado exitosamente');
    res.json({
      success: true,
      message: 'Trámite de vehículo creado exitosamente',
      tramiteId: result.insertId,
      customId: customId
    });

  } catch (err) {
    console.error('❌ Error al crear trámite de vehículo:', err);
    res.status(500).json({ error: 'Error al crear el trámite', details: err.message });
  }
});

// Endpoint para crear nuevo trámite de menores
app.post('/api/tramites/menores', upload.fields([
  { name: 'identidad', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 }
]), async (req, res) => {
  console.log('📝 Creando nuevo trámite de menores...');
  console.log('Datos recibidos:', req.body);
  console.log('Archivos recibidos:', Object.keys(req.files || {}));
  
  try {
    const {
      userId, menorNombres, menorApellidos, menorRut, menorNacimiento,
      acompNombres, acompApellidos, acompRut
    } = req.body;

    if (!userId || !menorNombres || !menorApellidos || !menorRut || !menorNacimiento ||
        !acompNombres || !acompApellidos || !acompRut) {
      console.log('❌ Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const conn = await mysql.createConnection(dbConfig);
    
    // Generar ID personalizado
    const [seqResult] = await conn.execute('SELECT last_number FROM tramite_sequences WHERE tipo = "menores"');
    const nextNumber = seqResult[0].last_number + 1;
    const customId = `MEN-${nextNumber.toString().padStart(4, '0')}`;
    
    // Actualizar secuencia
    await conn.execute('UPDATE tramite_sequences SET last_number = ? WHERE tipo = "menores"', [nextNumber]);

    // Obtener nombres de archivos
    const files = req.files;
    const archivoIdentidad = files.identidad ? files.identidad[0].filename : null;
    const archivoAutorizacion = files.autorizacion ? files.autorizacion[0].filename : null;

    console.log('✅ Insertando trámite con ID:', customId);

    // Insertar trámite
    const [result] = await conn.execute(`
      INSERT INTO tramites_menores 
      (user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
       acomp_nombres, acomp_apellidos, acomp_rut, archivo_identidad, archivo_autorizacion, custom_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, menorNombres, menorApellidos, menorRut, menorNacimiento,
      acompNombres, acompApellidos, acompRut, archivoIdentidad, archivoAutorizacion, customId
    ]);

    await conn.end();

    console.log('🎉 Trámite creado exitosamente');
    res.json({
      success: true,
      message: 'Trámite de menores creado exitosamente',
      tramiteId: result.insertId,
      customId: customId
    });

  } catch (err) {
    console.error('❌ Error al crear trámite de menores:', err);
    res.status(500).json({ error: 'Error al crear el trámite', details: err.message });
  }
});

// Endpoint para crear nuevo trámite de alimentos/mascotas
app.post('/api/tramites/alimentos', upload.fields([
  { name: 'registro', maxCount: 1 },
  { name: 'vacunas', maxCount: 1 },
  { name: 'desparasitacion', maxCount: 1 },
  { name: 'zoo', maxCount: 1 }
]), async (req, res) => {
  console.log('📝 Creando nuevo trámite de alimentos/mascotas...');
  console.log('Datos recibidos:', req.body);
  console.log('Archivos recibidos:', Object.keys(req.files || {}));
  
  try {
    const {
      userId, tipo, cantidad, transporte, descripcion,
      tipoMascota
    } = req.body;

    if (!userId || !tipo || !cantidad || !transporte || !descripcion) {
      console.log('❌ Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const conn = await mysql.createConnection(dbConfig);
    
    // Generar ID personalizado basado en el tipo
    let seqTipo;
    switch(tipo) {
      case 'vegetal': seqTipo = 'vegetal'; break;
      case 'animal': seqTipo = 'animal'; break;
      case 'mascota': seqTipo = 'mascota'; break;
      default: seqTipo = 'animal';
    }
    
    const [seqResult] = await conn.execute('SELECT last_number FROM tramite_sequences WHERE tipo = ?', [seqTipo]);
    const nextNumber = seqResult[0].last_number + 1;
    const customId = `${seqTipo.substring(0, 3).toUpperCase()}-${nextNumber.toString().padStart(4, '0')}`;
    
    // Actualizar secuencia
    await conn.execute('UPDATE tramite_sequences SET last_number = ? WHERE tipo = ?', [nextNumber, seqTipo]);

    console.log('✅ Insertando trámite con ID:', customId);

    // Insertar trámite
    const [result] = await conn.execute(`
      INSERT INTO tramites_alimentos 
      (user_id, tipo, cantidad, transporte, descripcion, custom_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId, tipo, cantidad, transporte, descripcion, customId
    ]);

    // Si es mascota, insertar documentos adicionales
    if (tipo === 'mascota' && req.files) {
      const files = req.files;
      const archivoRegistro = files.registro ? files.registro[0].filename : null;
      const archivoVacunas = files.vacunas ? files.vacunas[0].filename : null;
      const archivoDesparasitacion = files.desparasitacion ? files.desparasitacion[0].filename : null;
      const archivoZoo = files.zoo ? files.zoo[0].filename : null;

      if (archivoRegistro || archivoVacunas || archivoDesparasitacion || archivoZoo) {
        console.log('📎 Agregando documentos de mascota...');
        await conn.execute(`
          INSERT INTO documentos_mascotas 
          (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          result.insertId, tipoMascota || 'No especificado', 
          archivoRegistro, archivoVacunas, archivoDesparasitacion, archivoZoo
        ]);
      }
    }

    await conn.end();

    console.log('🎉 Trámite creado exitosamente');
    res.json({
      success: true,
      message: 'Trámite de alimentos/mascotas creado exitosamente',
      tramiteId: result.insertId,
      customId: customId
    });

  } catch (err) {
    console.error('❌ Error al crear trámite de alimentos:', err);
    res.status(500).json({ error: 'Error al crear el trámite', details: err.message });
  }
});