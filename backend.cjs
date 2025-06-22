// Backend básico en Node.js + Express para autenticación con MySQL
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt'); // No se usará para esta prueba
const multer = require('multer');
const path = require('path');

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
    res.json({ user: userData });
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
    await conn.execute(
      `INSERT INTO tramites_vehiculo
        (user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
         archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, patente, marca, modelo, anio, color, fechaInicio, fechaTermino,
        files.cedula[0].filename,
        files.licencia[0].filename,
        files.revision[0].filename,
        files.salida[0].filename,
        files.autorizacion ? files.autorizacion[0].filename : null,
        files.certificado[0].filename,
        files.seguro[0].filename
      ]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite guardado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Obtener trámites de vehículo temporal por usuario
app.get('/api/tramites/vehiculo', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino, estado, fecha_creacion,
        archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion, archivo_certificado, archivo_seguro
       FROM tramites_vehiculo WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    // Formatear fechas y campos para frontend
    const data = rows.map(row => ({
      id: row.id,
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
    await conn.execute(
      `INSERT INTO tramites_menores
        (user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
         acomp_nombres, acomp_apellidos, acomp_rut, archivo_identidad, archivo_autorizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, menorNombres, menorApellidos, menorRut, menorNacimiento,
        acompNombres, acompApellidos, acompRut,
        files.docIdentidad[0].filename,
        files.docAutorizacion[0].filename
      ]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite de menores guardado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener trámites de menores de edad por usuario
app.get('/api/tramites/menores', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento, acomp_nombres, acomp_apellidos, acomp_rut, estado, fecha_creacion, archivo_identidad, archivo_autorizacion
       FROM tramites_menores WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    const data = rows.map(row => ({
      id: row.id,
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
app.post('/api/tramite/alimentos', async (req, res) => {
  try {
    const { tipo, cantidad, transporte, descripcion, userId } = req.body;
    if (!tipo || !cantidad || !transporte || !descripcion || !userId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO tramites_alimentos
        (user_id, tipo, cantidad, transporte, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tipo, cantidad, transporte, descripcion]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite de alimentos/mascotas guardado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint para obtener trámites de alimentos/mascotas por usuario
app.get('/api/tramites/alimentos', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT id, tipo, cantidad, transporte, descripcion, estado, fecha_creacion
       FROM tramites_alimentos WHERE user_id = ? ORDER BY fecha_creacion DESC`,
      [userId]
    );
    await conn.end();
    const data = rows.map(row => ({
      id: row.id,
      tipo: row.tipo === 'vegetal' ? 'Mascotas o alimentos' : (row.tipo === 'animal' ? 'Mascotas o alimentos' : 'Mascotas o alimentos'),
      detalleTipo: row.tipo,
      cantidad: row.cantidad,
      transporte: row.transporte,
      descripcion: row.descripcion,
      fechaInicio: row.fecha_creacion ? row.fecha_creacion.toISOString().split('T')[0] : '',
      fechaTermino: '',
      estado: row.estado,
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// Endpoint seguro para servir archivos adjuntos de trámites
app.get('/api/archivo/:tipo/:filename', async (req, res) => {
  const { tipo, filename } = req.params;
  // Validar tipo permitido
  const allowedTypes = ['vehiculo', 'menores'];
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
app.listen(PORT, () => {
  console.log(`Backend SIGA escuchando en http://localhost:${PORT}`);
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

app.get('/api/tramite/alimentos/:id', async (req, res) => {
  const tramiteId = req.params.id;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM tramites_alimentos WHERE id = ?', [tramiteId]);
    await conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado' });
    const row = rows[0];
    res.json({
      id: row.id,
      tipo: row.tipo,
      cantidad: row.cantidad,
      transporte: row.transporte,
      descripcion: row.descripcion,
      estado: row.estado
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

app.put('/api/tramite/alimentos/:id', async (req, res) => {
  const tramiteId = req.params.id;
  const { tipo, cantidad, transporte, descripcion, userId } = req.body;
  if (!tipo || !cantidad || !transporte || !descripcion || !userId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM tramites_alimentos WHERE id = ?', [tramiteId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado' });
    await conn.execute(
      `UPDATE tramites_alimentos SET tipo=?, cantidad=?, transporte=?, descripcion=? WHERE id=?`,
      [tipo, cantidad, transporte, descripcion, tramiteId]
    );
    await conn.end();
    res.json({ ok: true, message: 'Trámite actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});
