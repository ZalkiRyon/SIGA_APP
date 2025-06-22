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

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend SIGA escuchando en http://localhost:${PORT}`);
});
