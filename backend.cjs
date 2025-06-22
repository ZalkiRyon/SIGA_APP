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
