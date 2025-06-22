-- Crear base de datos
CREATE DATABASE IF NOT EXISTS siga_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siga_app;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer', 'passenger') NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Datos de prueba (contraseñas en texto plano para pruebas)
INSERT INTO users (email, password, role, name) VALUES
('admin@siga.cl', 'admin123', 'admin', 'Administrador'),
('funcionario@siga.cl', 'funcionario123', 'officer', 'Funcionario Aduanero'),
('pasajero@siga.cl', 'pasajero123', 'passenger', 'Pasajero/Turista');
