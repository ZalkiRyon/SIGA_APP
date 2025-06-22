-- Crear base de datos
CREATE DATABASE IF NOT EXISTS siga_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siga_app;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  rut VARCHAR(20) NOT NULL,
  telefono VARCHAR(30),
  sexo ENUM('Femenino','Masculino') NOT NULL,
  region VARCHAR(100) NOT NULL,
  comuna VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer', 'passenger') NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Datos de prueba (contraseñas en texto plano para pruebas)
INSERT INTO users (email, password, role, name, nombre, apellidos, rut, telefono, sexo, region, comuna, direccion) VALUES
('admin@siga.cl', 'admin123', 'admin', 'Administrador', 'Administrador', '', '', '', 'Masculino', '', '', ''),
('funcionario@siga.cl', 'funcionario123', 'officer', 'Funcionario Aduanero', 'Funcionario', '', '', '', 'Masculino', '', '', ''),
('pasajero@siga.cl', 'pasajero123', 'passenger', 'Pasajero/Turista', 'Pasajero', '', '', '', 'Femenino', '', '', '');
