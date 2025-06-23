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
    // Aquí normalmente se enviaría un correo real
    return res.json({ ok: true, message: 'Instrucciones para recuperar la contraseña enviadas exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Registro de usuario pasajero/turista
app.post('/api/register', async (req, res) => {
  const { nombre, apellidos, rut, telefono, sexo, region, comuna, direccion, email, password } = req.body;
  if (!nombre || !apellidos || !rut || !sexo || !region || !comuna || !direccion || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Verificar si el correo ya existe
    const [exists] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      await conn.end();
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    // Insertar usuario como pasajero/turista
    await conn.execute(
      `INSERT INTO users (nombre, apellidos, rut, telefono, sexo, region, comuna, direccion, email, password, role, name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'passenger', ?)`,
      [nombre, apellidos, rut, telefono, sexo, region, comuna, direccion, email, password, nombre + ' ' + apellidos]
    );
    await conn.end();
    res.json({ ok: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Función auxiliar para obtener y actualizar el custom_id
async function generarCustomId(conn, tipo) {
  // Mapear tipo a prefijo
  const prefijos = {
    vehiculo: 'VEH',
    menores: 'MEN',
    animal: 'ANI',
    vegetal: 'VEG',
    mascota: 'MAS'
  };
  const prefijo = prefijos[tipo];
  if (!prefijo) throw new Error('Tipo de trámite inválido para custom_id');
  // Obtener y actualizar correlativo
  const [rows] = await conn.execute('SELECT last_number FROM tramite_sequences WHERE tipo = ? FOR UPDATE', [tipo]);
  let next = 1;
  if (rows.length > 0) next = rows[0].last_number + 1;
  await conn.execute('UPDATE tramite_sequences SET last_number = ? WHERE tipo = ?', [next, tipo]);
  return `${prefijo}-${String(next).padStart(4, '0')}`;
}

// Endpoint para guardar trámite de vehículo temporal
app.post('/api/tramite/vehiculo', upload.fields([
  { name: 'cedula', maxCount: 1 },
  { name: 'licencia', maxCount: 1 },
  { name: 'revision', maxCount: 1 },
  { name: 'salida', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'seguro', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      patente, marca, modelo, anio, color, fechaInicio, fechaTermino, userId
    } = req.body;
    if (!patente || !marca || !modelo || !anio || !color || !fechaInicio || !fechaTermino || !userId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const files = req.files;
    if (!files.cedula || !files.licencia || !files.revision || !files.salida || !files.certificado || !files.seguro) {
      return res.status(400).json({ error: 'Faltan archivos obligatorios' });
    }
    const conn = await mysql.createConnection(dbConfig);
    const customId = await generarCustomId(conn, 'vehiculo');
    await conn.execute(
      `INSERT INTO tramites_vehiculo
        (user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
         archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro, custom_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, patente, marca, modelo, anio, color, fechaInicio, fechaTermino,
        files.cedula[0].filename,
        files.licencia[0].filename,
        files.revision[0].filename,
        files.salida[0].filename,
        files.autorizacion ? files.autorizacion[0].filename : null,
        files.certificado[0].filename,
        files.seguro[0].filename,
        customId
      ]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite guardado exitosamente', customId });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámites de vehículo temporal por usuario
app.get('/api/tramites/vehiculo', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino, estado, fecha_creacion,
        archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro, custom_id
       FROM tramites_vehiculo WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    // Formatear fechas y campos para frontend
    const data = rows.map(row => ({
      id: row.custom_id || row.id, // Mostrar custom_id si existe
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

// Endpoint para guardar trámite de menores de edad
app.post('/api/tramite/menores', upload.fields([
  { name: 'docIdentidad', maxCount: 1 },
  { name: 'docAutorizacion', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      menorNombres, menorApellidos, menorRut, menorNacimiento,
      acompNombres, acompApellidos, acompRut, userId
    } = req.body;
    if (!menorNombres || !menorApellidos || !menorRut || !menorNacimiento || !acompNombres || !acompApellidos || !acompRut || !userId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const files = req.files;
    if (!files.docIdentidad || !files.docAutorizacion) {
      return res.status(400).json({ error: 'Faltan archivos obligatorios' });
    }
    const conn = await mysql.createConnection(dbConfig);
    const customId = await generarCustomId(conn, 'menores');
    await conn.execute(
      `INSERT INTO tramites_menores
        (user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
         acomp_nombres, acomp_apellidos, acomp_rut, archivo_identidad, archivo_autorizacion, custom_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, menorNombres, menorApellidos, menorRut, menorNacimiento,
        acompNombres, acompApellidos, acompRut,
        files.docIdentidad[0].filename,
        files.docAutorizacion[0].filename,
        customId
      ]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite de menores guardado exitosamente', customId });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener trámites de menores de edad por usuario
app.get('/api/tramites/menores', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento, acomp_nombres, acomp_apellidos, acomp_rut, estado, fecha_creacion, archivo_identidad, archivo_autorizacion, custom_id
       FROM tramites_menores WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    const data = rows.map(row => ({
      id: row.custom_id || row.id, // Mostrar custom_id si existe
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

// Endpoint para guardar trámite de alimentos/mascotas (Declaración SAG)
app.post('/api/tramite/alimentos', upload.fields([
  { name: 'registro', maxCount: 1 },
  { name: 'vacunas', maxCount: 1 },
  { name: 'desparasitacion', maxCount: 1 },
  { name: 'zoo', maxCount: 1 },
]), async (req, res) => {
  try {
    const { tipo, cantidad, transporte, descripcion, userId, tipoMascota } = req.body;
    if (!tipo || !transporte || !userId || (tipo !== 'mascota' && (!cantidad || !descripcion))) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const conn = await mysql.createConnection(dbConfig);
    // Determinar tipo para secuencia
    let tipoSecuencia = tipo;
    if (tipo !== 'mascota' && tipo !== 'animal' && tipo !== 'vegetal') tipoSecuencia = 'animal';
    const customId = await generarCustomId(conn, tipoSecuencia);    // Insertar trámite principal
    const [result] = await conn.execute(
      `INSERT INTO tramites_alimentos (user_id, tipo, cantidad, transporte, descripcion, custom_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, tipo, tipo === 'mascota' ? 1 : cantidad, transporte, tipo === 'mascota' ? descripcion || '' : descripcion, customId]
    );
    const tramiteId = result.insertId;
    // Si es mascota, guardar documentos
    if (tipo === 'mascota') {
      if (!tipoMascota || !req.files['registro'] || !req.files['vacunas'] || !req.files['desparasitacion'] || !req.files['zoo']) {
        await conn.end();
        return res.status(400).json({ error: 'Faltan documentos de mascota' });
      }
      await conn.execute(
        `INSERT INTO documentos_mascotas (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tramiteId, tipoMascota,
          req.files['registro'][0].filename,
          req.files['vacunas'][0].filename,
          req.files['desparasitacion'][0].filename,
          req.files['zoo'][0].filename]
      );
    }
    await conn.end();
    res.json({ ok: true, message: 'Trámite guardado correctamente', customId });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint seguro para servir archivos adjuntos de trámites
app.get('/api/archivo/:tipo/:filename', async (req, res) => {
  const { tipo, filename } = req.params;
  // Validar tipo permitido
  const allowedTypes = ['vehiculo', 'menores', 'alimentos']; // Se agregó 'alimentos'
  if (!allowedTypes.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de archivo no permitido' });
  }
  // Sanitizar filename
  if (!/^[\w\-\.]+$/.test(filename)) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' });
  }
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).json({ error: 'Archivo no encontrado' });
    }
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
    
    // Probar consulta simple
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Consulta de prueba exitosa. Número de usuarios: ${rows[0].count}`);
    
    await connection.end();
  } catch (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
    console.error('Stack trace:', err.stack);
  }
});

// Obtener trámite de vehículo por ID
app.get('/api/tramite/vehiculo/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta id' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino, estado, fecha_creacion,
        archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro
       FROM tramites_vehiculo WHERE id = ? LIMIT 1`,
      [id]
    );
    await conn.end();
    if (!rows.length) return res.status(404).json({ error: 'Trámite no encontrado' });
    const row = rows[0];
    res.json({
      id: row.id,
      userId: row.user_id,
      patente: row.patente,
      marca: row.marca,
      modelo: row.modelo,
      anio: row.anio,
      color: row.color,
      fechaInicio: row.fecha_inicio ? row.fecha_inicio.toISOString().split('T')[0] : '',
      fechaTermino: row.fecha_termino ? row.fecha_termino.toISOString().split('T')[0] : '',
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
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para editar trámite de vehículo temporal
app.put('/api/tramite/vehiculo/:id', upload.fields([
  { name: 'cedula', maxCount: 1 },
  { name: 'licencia', maxCount: 1 },
  { name: 'revision', maxCount: 1 },
  { name: 'salida', maxCount: 1 },
  { name: 'autorizacion', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'seguro', maxCount: 1 },
]), async (req, res) => {
  const tramiteId = req.params.id;
  const { patente, marca, modelo, anio, color, fechaInicio, fechaTermino, userId } = req.body;
  if (!patente || !marca || !modelo || !anio || !color || !fechaInicio || !fechaTermino || !userId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Obtener archivos actuales
    const [rows] = await conn.execute('SELECT * FROM tramites_vehiculo WHERE id = ?', [tramiteId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado' });
    const actual = rows[0];
    // Archivos: si no se sube uno nuevo, mantener el anterior
    const archivos = {
      cedula: req.files['cedula'] ? req.files['cedula'][0].filename : actual.archivo_cedula,
      licencia: req.files['licencia'] ? req.files['licencia'][0].filename : actual.archivo_licencia,
      revision: req.files['revision'] ? req.files['revision'][0].filename : actual.archivo_revision,
      salida: req.files['salida'] ? req.files['salida'][0].filename : actual.archivo_salida,
      autorizacion: req.files['autorizacion'] ? req.files['autorizacion'][0].filename : actual.archivo_autorizacion,
      certificado: req.files['certificado'] ? req.files['certificado'][0].filename : actual.archivo_certificado,
      seguro: req.files['seguro'] ? req.files['seguro'][0].filename : actual.archivo_seguro,
    };
    await conn.execute(
      `UPDATE tramites_vehiculo SET patente=?, marca=?, modelo=?, anio=?, color=?, fecha_inicio=?, fecha_termino=?, archivo_cedula=?, archivo_licencia=?, archivo_revision=?, archivo_salida=?, archivo_autorizacion=?, archivo_certificado=?, archivo_seguro=? WHERE id=?`,
      [patente, marca, modelo, anio, color, fechaInicio, fechaTermino, archivos.cedula, archivos.licencia, archivos.revision, archivos.salida, archivos.autorizacion, archivos.certificado, archivos.seguro, tramiteId]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

app.get('/api/tramite/menores/:id', async (req, res) => {
  const tramiteId = req.params.id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM tramites_menores WHERE id = ?', [tramiteId]);
    await conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado' });
    const row = rows[0];
    res.json({
      id: row.id,
      menorNombres: row.menor_nombres,
      menorApellidos: row.menor_apellidos,
      menorRut: row.menor_rut,
      menorNacimiento: row.menor_nacimiento ? row.menor_nacimiento.toISOString().split('T')[0] : '',
      acompNombres: row.acomp_nombres,
      acompApellidos: row.acomp_apellidos,
      acompRut: row.acomp_rut,
      archivos: {
        identidad: row.archivo_identidad,
        autorizacion: row.archivo_autorizacion
      },
      estado: row.estado
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

app.put('/api/tramite/menores/:id', upload.fields([
  { name: 'docIdentidad', maxCount: 1 },
  { name: 'docAutorizacion', maxCount: 1 },
]), async (req, res) => {
  const tramiteId = req.params.id;
  const { menorNombres, menorApellidos, menorRut, menorNacimiento, acompNombres, acompApellidos, acompRut, userId } = req.body;
  if (!menorNombres || !menorApellidos || !menorRut || !menorNacimiento || !acompNombres || !acompApellidos || !acompRut || !userId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM tramites_menores WHERE id = ?', [tramiteId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado' });
    const actual = rows[0];
    const archivos = {
      identidad: req.files['docIdentidad'] ? req.files['docIdentidad'][0].filename : actual.archivo_identidad,
      autorizacion: req.files['docAutorizacion'] ? req.files['docAutorizacion'][0].filename : actual.archivo_autorizacion,
    };
    await conn.execute(
      `UPDATE tramites_menores SET menor_nombres=?, menor_apellidos=?, menor_rut=?, menor_nacimiento=?, acomp_nombres=?, acomp_apellidos=?, acomp_rut=?, archivo_identidad=?, archivo_autorizacion=? WHERE id=?`,
      [menorNombres, menorApellidos, menorRut, menorNacimiento, acompNombres, acompApellidos, acompRut, archivos.identidad, archivos.autorizacion, tramiteId]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámite de alimentos/mascotas por ID (incluye documentos de mascota si aplica)
app.get('/api/tramite/alimentos/:id', async (req, res) => {
  const tramiteId = req.params.id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM tramites_alimentos WHERE id = ?', [tramiteId]);
    if (rows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }
    const row = rows[0];
    let mascota = null;
    if (row.tipo === 'mascota') {
      const [docs] = await conn.execute('SELECT * FROM documentos_mascotas WHERE tramite_id = ?', [tramiteId]);
      if (docs.length > 0) mascota = docs[0];
    }
    await conn.end();
    res.json({
      id: row.id,
      tipo: row.tipo,
      cantidad: row.cantidad,
      transporte: row.transporte,
      descripcion: row.descripcion,
      estado: row.estado,
      mascota
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para editar trámite de alimentos/mascotas (incluye edición de documentos de mascota)
app.put('/api/tramite/alimentos/:id', upload.fields([
  { name: 'registro', maxCount: 1 },
  { name: 'vacunas', maxCount: 1 },
  { name: 'desparasitacion', maxCount: 1 },
  { name: 'zoo', maxCount: 1 },
]), async (req, res) => {
  const tramiteId = req.params.id;
  const { tipo, cantidad, transporte, descripcion, userId, tipoMascota } = req.body;
  if (!tipo || !transporte || !userId || (tipo !== 'mascota' && (!cantidad || !descripcion))) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Actualizar trámite principal
    await conn.execute(
      `UPDATE tramites_alimentos SET tipo=?, cantidad=?, transporte=?, descripcion=? WHERE id=?`,
      [tipo, tipo === 'mascota' ? 1 : cantidad, transporte, tipo === 'mascota' ? descripcion || '' : descripcion, tramiteId]
    );
    // Si es mascota, actualizar documentos
    if (tipo === 'mascota') {
      const [docs] = await conn.execute('SELECT * FROM documentos_mascotas WHERE tramite_id = ?', [tramiteId]);
      if (docs.length > 0) {
        const actual = docs[0];
        await conn.execute(
          `UPDATE documentos_mascotas SET tipo_mascota=?, archivo_registro=?, archivo_vacunas=?, archivo_desparasitacion=?, archivo_zoo=? WHERE tramite_id=?`,
          [
            tipoMascota || actual.tipo_mascota,
            req.files['registro'] ? req.files['registro'][0].filename : actual.archivo_registro,
            req.files['vacunas'] ? req.files['vacunas'][0].filename : actual.archivo_vacunas,
            req.files['desparasitacion'] ? req.files['desparasitacion'][0].filename : actual.archivo_desparasitacion,
            req.files['zoo'] ? req.files['zoo'][0].filename : actual.archivo_zoo,
            tramiteId
          ]
        );
      }
    }
    await conn.end();
    res.json({ ok: true, message: 'Trámite actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para aprobar un trámite de alimentos
app.put('/api/tramites/alimentos/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const fecha_aprobacion = new Date().toISOString().split('T')[0];
    
    // Actualizar el estado y fecha de aprobación
    await conn.execute(
      `UPDATE tramites_alimentos SET estado = 'Aprobado', fecha_aprobacion = ? WHERE id = ?`,
      [fecha_aprobacion, id]
    );
    
    await conn.end();
    res.json({ success: true, message: 'Trámite aprobado correctamente', fecha_aprobacion });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para rechazar un trámite de alimentos
app.put('/api/tramites/alimentos/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const conn = await mysql.createConnection(dbConfig);
    const fecha_rechazo = new Date().toISOString().split('T')[0];
    
    // Actualizar el estado y fecha de rechazo
    await conn.execute(
      `UPDATE tramites_alimentos SET estado = 'Rechazado', fecha_rechazo = ? WHERE id = ?`,
      [fecha_rechazo, id]
    );
    
    await conn.end();
    res.json({ success: true, message: 'Trámite rechazado correctamente', fecha_rechazo });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámites de alimentos/mascotas (incluye mascotas) por usuario
app.get('/api/tramites/alimentos', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, tipo, cantidad, transporte, descripcion, estado, fecha_creacion, fecha_aprobacion, fecha_rechazo, custom_id FROM tramites_alimentos WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    // Para trámites de tipo mascota, obtener documentos asociados
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
      
      // Determinar fecha de término basada en el estado y las fechas disponibles
      let fechaTermino = null;
      if (row.estado === 'Aprobado' && row.fecha_aprobacion) {
        fechaTermino = new Date(row.fecha_aprobacion).toISOString().split('T')[0];
      } else if (row.estado === 'Rechazado' && row.fecha_rechazo) {
        fechaTermino = new Date(row.fecha_rechazo).toISOString().split('T')[0];
      }
      
      return {
        id: row.custom_id || row.id, // Mostrar custom_id si existe
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

// Endpoint para obtener todos los usuarios (solo para admin)
app.get('/api/users', authenticateToken, async (req, res) => {
  console.log('GET /api/users - User role:', req.user.role);
  
  if (req.user.role !== 'admin') {
    console.log('Access denied - User is not admin');
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }

  try {    
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, nombre, apellidos, rut, email, role, name, estado, perfil FROM users');
    await conn.end();
    
    console.log(`Retrieved ${rows.length} users from database`);

    const formattedUsers = rows.map(user => {
      let acciones = ['editar'];
      // Determinar acciones basadas en el rol
      if (user.role === 'admin') {
        // No permitir eliminar o inhabilitar administradores
        acciones = ['editar'];
      } else if (user.role === 'officer') {
        // Funcionarios pueden ser inhabilitados
        acciones.push('inhabilitar');
      } else {
        // Pasajeros pueden ser eliminados
        acciones.push('eliminar');
      }

      // Mapear role a texto en español
      let rol = 'Pasajero';
      if (user.role === 'admin') rol = 'Administrador';
      else if (user.role === 'officer') rol = 'Funcionario Aduanero';

      return {
        id: user.id,
        rut: user.rut || '(No registrado)',
        nombre: user.nombre && user.apellidos ? `${user.nombre} ${user.apellidos}` : user.name,
        rol,
        acciones,
        estado: user.estado || 'activo',
        perfil: user.perfil
      };
    });

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor', details: err.message });
  }
});

// Endpoint para crear un nuevo usuario (solo admin)
app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { nombre, apellidos, rut, email, password, role, telefono, sexo, region, comuna, direccion, estado, perfil } = req.body;

  // Validaciones
  if (!email || !password || !role || !nombre || !apellidos || !rut || !sexo || !region || !comuna || !direccion) {
    return res.status(400).json({ error: 'Datos incompletos. Todos los campos marcados con * son obligatorios.' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Verificar si el email ya existe
    const [exists] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      await conn.end();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Verificar si el RUT ya existe
    const [rutExists] = await conn.execute('SELECT id FROM users WHERE rut = ?', [rut]);
    if (rutExists.length > 0) {
      await conn.end();
      return res.status(400).json({ error: 'El RUT ya está registrado' });
    }

    // Crear usuario
    const name = `${nombre} ${apellidos}`; // Nombre completo para mostrar
    const [result] = await conn.execute(
      `INSERT INTO users (nombre, apellidos, rut, telefono, sexo, region, comuna, direccion, email, password, role, name, estado, perfil)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, rut, telefono || '', sexo, region, comuna, direccion, email, password, role, name, estado || 'activo', perfil || null]
    );

    await conn.end();
    res.status(201).json({ id: result.insertId, message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor', details: err.message });
  }
});

// Endpoint para actualizar un usuario (solo admin)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const userId = req.params.id;
  const { nombre, apellidos, rut, email, telefono, sexo, region, comuna, direccion, role, password } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Verificar si el usuario existe
    const [user] = await conn.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Construir query dinámica para actualizar solo los campos proporcionados
    let updateFields = [];
    let params = [];

    if (nombre !== undefined) { updateFields.push('nombre = ?'); params.push(nombre); }
    if (apellidos !== undefined) { updateFields.push('apellidos = ?'); params.push(apellidos); }
    if (rut !== undefined) { updateFields.push('rut = ?'); params.push(rut); }
    if (email !== undefined) { updateFields.push('email = ?'); params.push(email); }
    if (telefono !== undefined) { updateFields.push('telefono = ?'); params.push(telefono); }
    if (sexo !== undefined) { updateFields.push('sexo = ?'); params.push(sexo); }
    if (region !== undefined) { updateFields.push('region = ?'); params.push(region); }
    if (comuna !== undefined) { updateFields.push('comuna = ?'); params.push(comuna); }
    if (direccion !== undefined) { updateFields.push('direccion = ?'); params.push(direccion); }
    if (role !== undefined) { updateFields.push('role = ?'); params.push(role); }
    if (password !== undefined) { updateFields.push('password = ?'); params.push(password); }

    if (updateFields.length === 0) {
      await conn.end();
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Agregar id al final de los parámetros
    params.push(userId);

    // Ejecutar la actualización
    await conn.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    await conn.end();
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor', details: err.message });
  }
});

// Endpoint para eliminar un usuario (solo admin)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const userId = req.params.id;

  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Verificar que el usuario existe y no es admin
    const [user] = await conn.execute('SELECT role FROM users WHERE id = ?', [userId]);
    
    if (user.length === 0) {
      await conn.end();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (user[0].role === 'admin') {
      await conn.end();
      return res.status(403).json({ error: 'No se puede eliminar un usuario administrador' });
    }
    
    // Eliminar usuario
    await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    await conn.end();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor', details: err.message });
  }
});

// Endpoint para cambiar estado de usuario (habilitar/inhabilitar) - por implementar
// Nota: Requiere añadir columna "estado" a la tabla users
app.put('/api/users/:id/toggle-status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const userId = req.params.id;
  
  // Nota: Este endpoint es un placeholder. 
  // Para implementarlo completamente, necesitarías añadir un campo 'estado' a la tabla users
  
  res.json({ message: 'Estado de usuario cambiado (simulado)', userId });
});

// Endpoint para obtener todas las incidencias (solo para admin)
app.get('/api/incidents', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // Simulamos datos de incidencias
  // En una implementación real, estos datos vendrían de una tabla en la base de datos
  const incidents = [
    { id: 'SYS-205', tipo: 'API Aduana AR: Error de conexión (Timeout)', estado: 'No resuelto', tiempo: '45 minutos', prioridad: 'Alta', fechaCreacion: new Date(Date.now() - 45 * 60000) },
    { id: 'SEC-101', tipo: 'Seguridad: 5 intentos fallidos', estado: 'No resuelto', tiempo: '1.2 horas', prioridad: 'Alta', fechaCreacion: new Date(Date.now() - 72 * 60000) },
    { id: 'DB-003', tipo: 'Base de datos: Lentitud queries', estado: 'En progreso', tiempo: '15 minutos', prioridad: 'Media', fechaCreacion: new Date(Date.now() - 15 * 60000) },
    { id: 'API-042', tipo: 'API SAG: Timeout en validación', estado: 'Resuelto', tiempo: '3.5 horas', prioridad: 'Media', fechaCreacion: new Date(Date.now() - 210 * 60000) },
    { id: 'UI-107', tipo: 'Formulario de menores: Error validación', estado: 'En progreso', tiempo: '30 minutos', prioridad: 'Baja', fechaCreacion: new Date(Date.now() - 30 * 60000) }
  ];

  res.json(incidents);
});

// Endpoint para actualizar una incidencia (solo admin)
app.put('/api/incidents/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const id = req.params.id;
  const { estado, prioridad } = req.body;

  // En una implementación real, aquí actualizaríamos la incidencia en la base de datos
  res.json({ 
    message: `Incidencia ${id} actualizada`, 
    data: { id, estado, prioridad }
  });
});

// Endpoint para obtener el historial completo (solo para admin)
app.get('/api/history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // Simulamos datos de historial
  // En una implementación real, estos datos vendrían de una tabla en la base de datos
  const historyData = [
    { fecha: '15/05 14:30', usuario: 'Func-101', accion: 'Aprobó trámite #TR-6068', ip: '192.168.1.5' },
    { fecha: '15/05 11:15', usuario: 'Func-100', accion: 'Rechazó trámite #TR-6011', ip: '10.0.0.12' },
    { fecha: '14/05 17:22', usuario: 'Admin-01', accion: 'Creó usuario Func-102', ip: '192.168.1.10' },
    { fecha: '14/05 09:45', usuario: 'Func-100', accion: 'Aprobó trámite #TR-6010', ip: '10.0.0.12' },
    { fecha: '13/05 16:30', usuario: 'Func-101', accion: 'Rechazó trámite #TR-6005', ip: '192.168.1.5' }
  ];

  res.json(historyData);
});

// Endpoint para generar reporte de historial (solo admin)
app.post('/api/history/report', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { reportType, range } = req.body;

  // Validación de parámetros
  if (!reportType || !range) {
    return res.status(400).json({ error: 'Tipo de reporte y rango son requeridos' });
  }

  // En una implementación real, aquí generaríamos un PDF basado en los parámetros
  // Por ahora, solo devolvemos una respuesta simulada
  res.json({ 
    message: `Reporte generado: ${reportType} - ${range}`, 
    downloadUrl: '/path/to/report.pdf'
  });
});

// Endpoints para configuraciones de usuario
app.get('/api/settings', authenticateToken, async (req, res) => {
  // En una implementación real, estas configuraciones se obtendrían de la base de datos
  // para el usuario actual (req.user.id)
  
  // Datos de muestra
  const userSettings = {
    darkMode: false,
    defaultView: 'inicio',
    keyboardShortcuts: {
      usersManagement: 'CTRL + F',
      history: 'CTRL + A'
    }
  };
  
  res.json(userSettings);
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const settings = req.body;
  
  // Validar los datos recibidos
  if (!settings) {
    return res.status(400).json({ error: 'Datos de configuración no proporcionados' });
  }
  
  // En una implementación real, guardaríamos estas configuraciones en la base de datos
  // para el usuario actual (req.user.id)
    res.json({ 
    success: true, 
    message: 'Configuración actualizada correctamente',
    settings
  });
});

// Endpoint para obtener trámites para validación (funcionario aduanero)
app.get('/api/tramites/validacion', authenticateToken, async (req, res) => {
  console.log('Accediendo a /api/tramites/validacion con query:', req.query);
  
  // Verificar que el usuario sea funcionario aduanero
  if (req.user.role !== 'officer') {
    console.log('Acceso denegado: usuario no es funcionario aduanero');
    return res.status(403).json({ error: 'Acceso no autorizado. Solo funcionarios aduaneros pueden acceder a esta función.' });
  }

  const {
    search = '',
    tipo = '',
    fechaInicio = '',
    estado = '',
    page = 1,
    limit = 10
  } = req.query;

  const offset = (page - 1) * limit;
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a MySQL establecida correctamente');
    
    // Construir la consulta base
    let queryVehiculo = 
      "SELECT " +
        "tv.id, " +
        "tv.custom_id as customId, " +
        "tv.fecha_inicio as fechaInicio, " +
        "tv.fecha_creacion as fechaCreacion, " +
        "'Vehículo temporal' as tipo, " +
        "tv.estado, " +
        "CONCAT(u.nombre, ' ', u.apellidos) as solicitante, " +
        "tv.patente as dato1, " +
        "tv.marca as dato2, " +
        "tv.modelo as dato3 " +
      "FROM tramites_vehiculo tv " +
      "JOIN users u ON tv.user_id = u.id " +
      "WHERE 1=1";

    let queryMenores =
      "SELECT " +
        "tm.id, " +
        "tm.custom_id as customId, " +
        "tm.fecha_creacion as fechaCreacion, " +
        "tm.menor_nacimiento as fechaInicio, " +
        "'Documentación Menor' as tipo, " +
        "tm.estado, " +
        "CONCAT(u.nombre, ' ', u.apellidos) as solicitante, " +
        "CONCAT(tm.menor_nombres, ' ', tm.menor_apellidos) as dato1, " +
        "CONCAT(tm.acomp_nombres, ' ', tm.acomp_apellidos) as dato2, " +
        "tm.menor_rut as dato3 " +
      "FROM tramites_menores tm " +
      "JOIN users u ON tm.user_id = u.id " +
      "WHERE 1=1";

    let queryAlimentos =
      "SELECT " +
        "ta.id, " +
        "ta.custom_id as customId, " +
        "ta.fecha_creacion as fechaCreacion, " +
        "ta.fecha_creacion as fechaInicio, " +
        "CONCAT('Declaración SAG (', CASE ta.tipo " +
          "WHEN 'vegetal' THEN 'Vegetal' " +
          "WHEN 'animal' THEN 'Animal' " +
          "WHEN 'mascota' THEN 'Mascota' " +
          "END, ')') as tipo, " +
        "ta.estado, " +
        "CONCAT(u.nombre, ' ', u.apellidos) as solicitante, " +
        "ta.tipo as dato1, " +
        "ta.cantidad as dato2, " +
        "ta.descripcion as dato3 " +
      "FROM tramites_alimentos ta " +
      "JOIN users u ON ta.user_id = u.id " +
      "WHERE 1=1";

    // Aplicar filtros si se proporciona
    const params = [];

    if (search) {
      const searchParam = `%${search}%`;
      queryVehiculo += ` AND (tv.custom_id LIKE ? OR tv.patente LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      params.push(searchParam, searchParam, searchParam);
      
      queryMenores += ` AND (tm.custom_id LIKE ? OR CONCAT(tm.menor_nombres, ' ', tm.menor_apellidos) LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      params.push(searchParam, searchParam, searchParam);
      
      queryAlimentos += ` AND (ta.custom_id LIKE ? OR ta.descripcion LIKE ? OR CONCAT(u.nombre, ' ', u.apellidos) LIKE ?)`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (tipo) {
      if (tipo === 'vehiculo') {
        queryMenores = '';
        queryAlimentos = '';
      } else if (tipo === 'menores') {
        queryVehiculo = '';
        queryAlimentos = '';
      } else if (tipo === 'sag') {
        queryVehiculo = '';
        queryMenores = '';
      }
    }

    if (fechaInicio) {
      // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD para MySQL
      const partesFecha = fechaInicio.split('/');
      if (partesFecha.length === 3) {
        const fechaSQL = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
        
        if (queryVehiculo) {
          queryVehiculo += ` AND tv.fecha_inicio >= ?`;
          params.push(fechaSQL);
        }
        
        if (queryMenores) {
          queryMenores += ` AND tm.fecha_creacion >= ?`;
          params.push(fechaSQL);
        }
        
        if (queryAlimentos) {
          queryAlimentos += ` AND ta.fecha_creacion >= ?`;
          params.push(fechaSQL);
        }
      }
    }

    if (estado) {
      if (queryVehiculo) {
        queryVehiculo += ` AND tv.estado = ?`;
        params.push(estado);
      }
      
      if (queryMenores) {
        queryMenores += ` AND tm.estado = ?`;
        params.push(estado);
      }
      
      if (queryAlimentos) {
        queryAlimentos += ` AND ta.estado = ?`;
        params.push(estado);
      }
    }

    // Unir las consultas
    let queries = [];
    if (queryVehiculo) queries.push(queryVehiculo);
    if (queryMenores) queries.push(queryMenores);
    if (queryAlimentos) queries.push(queryAlimentos);    const unionQuery = queries.join(' UNION ALL ');
    const countQuery = "SELECT COUNT(*) total FROM (" + unionQuery + ") combined_results";
    const [countResult] = await connection.query(countQuery, params.concat(params).concat(params));
    
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);    // Consulta final con paginación
    const finalQuery = 
      unionQuery +
      " ORDER BY fechaCreacion DESC" +
      " LIMIT ? OFFSET ?";
    
    
    const finalParams = [...params, ...params, ...params, parseInt(limit), offset];
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
      };      // Agregar detalles específicos según el tipo
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
    });    await connection.end();

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
    res.status(500).json({ error: 'Error al consultar los trámites de validación', details: err.message });
  }
});

// Endpoint para obtener detalles de un trámite específico
app.get('/api/tramites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Verificar que el usuario sea funcionario aduanero o dueño del trámite
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    // Si es pasajero, verificar que sea el dueño del trámite
    // Esta comprobación se implementará dentro de cada tipo de trámite
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Primero debemos determinar qué tipo de trámite es (vehículo, menor o alimento)
    // Por la estructura de nuestro ID custom (ejemplo: VEH-0001, MEN-0002, VEG-0003)
    let tipoTramite = '';
    let detallesTramite = null;
    let documentos = [];

    // Intentar encontrar en tramites_vehiculo
    let [vehiculos] = await connection.query(
      `SELECT tv.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono
       FROM tramites_vehiculo tv
       JOIN users u ON tv.user_id = u.id
       WHERE tv.id = ? OR tv.custom_id = ?`,
      [id, id]
    );

    if (vehiculos.length > 0) {
      tipoTramite = 'vehiculo';
      const vehiculo = vehiculos[0];

      // Si es pasajero, verificar que sea el dueño del trámite
      if (req.user.role === 'passenger' && vehiculo.user_id !== req.user.id) {
        await connection.end();
        return res.status(403).json({ error: 'No tienes permiso para ver este trámite' });
      }

      detallesTramite = {
        id: vehiculo.id,
        customId: vehiculo.custom_id,
        fechaCreacion: format(new Date(vehiculo.fecha_creacion), 'dd/MM/yyyy'),
        fechaInicio: format(new Date(vehiculo.fecha_inicio), 'dd/MM/yyyy'),
        fechaTermino: format(new Date(vehiculo.fecha_termino), 'dd/MM/yyyy'),
        tipo: 'Vehículo temporal',
        estado: vehiculo.estado,
        solicitante: {
          nombre: `${vehiculo.nombre} ${vehiculo.apellidos}`,
          rut: vehiculo.rut,
          email: vehiculo.email,
          telefono: vehiculo.telefono
        },
        detalles: {
          patente: vehiculo.patente,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          color: vehiculo.color,
          fechaInicio: format(new Date(vehiculo.fecha_inicio), 'dd/MM/yyyy'),
          fechaTermino: format(new Date(vehiculo.fecha_termino), 'dd/MM/yyyy')
        },
        documentos: [
          { nombre: 'Cédula de identidad', url: `/uploads/${vehiculo.archivo_cedula}` },
          { nombre: 'Licencia de conducir', url: `/uploads/${vehiculo.archivo_licencia}` },
          { nombre: 'Revisión técnica', url: `/uploads/${vehiculo.archivo_revision}` },
          { nombre: 'Permiso de salida', url: `/uploads/${vehiculo.archivo_salida}` },
          { nombre: 'Certificado de registro', url: `/uploads/${vehiculo.archivo_certificado}` },
          { nombre: 'Seguro vehicular', url: `/uploads/${vehiculo.archivo_seguro}` }
        ]
      };

      if (vehiculo.archivo_autorizacion) {
        detallesTramite.documentos.push({ 
          nombre: 'Autorización de propietario', 
          url: `/uploads/${vehiculo.archivo_autorizacion}` 
        });
      }
    }

    // Si no es vehículo, intentar con menores
    if (!tipoTramite) {
      let [menores] = await connection.query(
        `SELECT tm.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono
         FROM tramites_menores tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.id = ? OR tm.custom_id = ?`,
        [id, id]
      );

      if (menores.length > 0) {
        tipoTramite = 'menor';
        const menor = menores[0];

        // Si es pasajero, verificar que sea el dueño del trámite
        if (req.user.role === 'passenger' && menor.user_id !== req.user.id) {
          await connection.end();
          return res.status(403).json({ error: 'No tienes permiso para ver este trámite' });
        }

        detallesTramite = {
          id: menor.id,
          customId: menor.custom_id,
          fechaCreacion: format(new Date(menor.fecha_creacion), 'dd/MM/yyyy'),
          fechaInicio: format(new Date(menor.menor_nacimiento), 'dd/MM/yyyy'),
          tipo: 'Documentación Menor',
          estado: menor.estado,
          solicitante: {
            nombre: `${menor.nombre} ${menor.apellidos}`,
            rut: menor.rut,
            email: menor.email,
            telefono: menor.telefono
          },
          detalles: {
            menor: `${menor.menor_nombres} ${menor.menor_apellidos}`,
            menorRut: menor.menor_rut,
            menorNacimiento: format(new Date(menor.menor_nacimiento), 'dd/MM/yyyy'),
            acompanante: `${menor.acomp_nombres} ${menor.acomp_apellidos}`,
            acompRut: menor.acomp_rut
          },
          documentos: [
            { nombre: 'Documento de identidad', url: `/uploads/${menor.archivo_identidad}` },
            { nombre: 'Autorización de viaje', url: `/uploads/${menor.archivo_autorizacion}` }
          ]
        };
      }
    }

    // Si no es vehículo ni menor, intentar con alimentos
    if (!tipoTramite) {
      let [alimentos] = await connection.query(
        `SELECT ta.*, u.nombre, u.apellidos, u.rut, u.email, u.telefono
         FROM tramites_alimentos ta
         JOIN users u ON ta.user_id = u.id
         WHERE ta.id = ? OR ta.custom_id = ?`,
        [id, id]
      );

      if (alimentos.length > 0) {
        tipoTramite = 'alimento';
        const alimento = alimentos[0];

        // Si es pasajero, verificar que sea el dueño del trámite
        if (req.user.role === 'passenger' && alimento.user_id !== req.user.id) {
          await connection.end();
          return res.status(403).json({ error: 'No tienes permiso para ver este trámite' });
        }

        const tipoTexto = {
          'vegetal': 'Vegetal',
          'animal': 'Animal',
          'mascota': 'Mascota'
        };

        detallesTramite = {
          id: alimento.id,
          customId: alimento.custom_id,
          fechaCreacion: format(new Date(alimento.fecha_creacion), 'dd/MM/yyyy'),
          fechaInicio: format(new Date(alimento.fecha_creacion), 'dd/MM/yyyy'),
          tipo: `Declaración SAG (${tipoTexto[alimento.tipo] || alimento.tipo})`,
          estado: alimento.estado,
          solicitante: {
            nombre: `${alimento.nombre} ${alimento.apellidos}`,
            rut: alimento.rut,
            email: alimento.email,
            telefono: alimento.telefono
          },
          detalles: {
            tipo: alimento.tipo,
            cantidad: alimento.cantidad,
            transporte: alimento.transporte,
            descripcion: alimento.descripcion,
            fechaCreacion: format(new Date(alimento.fecha_creacion), 'dd/MM/yyyy')
          }
        };

        // Si es mascota, agregar información adicional
        if (alimento.tipo === 'mascota') {
          let [mascotas] = await connection.query(
            `SELECT * FROM documentos_mascotas WHERE tramite_id = ?`,
            [alimento.id]
          );

          if (mascotas.length > 0) {
            const mascota = mascotas[0];
            
            detallesTramite.detalles.tipoMascota = mascota.tipo_mascota;
            
            detallesTramite.documentos = [
              { nombre: 'Registro de mascota', url: `/uploads/${mascota.archivo_registro}` },
              { nombre: 'Certificado de vacunación', url: `/uploads/${mascota.archivo_vacunas}` },
              { nombre: 'Certificado de desparasitación', url: `/uploads/${mascota.archivo_desparasitacion}` },
              { nombre: 'Certificado zoosanitario', url: `/uploads/${mascota.archivo_zoo}` }
            ];
          }
        }
      }
    }

    await connection.end();

    if (!detallesTramite) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    res.json(detallesTramite);

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
    return res.status(400).json({ error: 'Se requiere especificar un motivo de rechazo' });
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
