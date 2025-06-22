// Backend básico en Node.js + Express para autenticación con MySQL
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt'); // No se usará para esta prueba

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

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend SIGA escuchando en http://localhost:${PORT}`);
});
