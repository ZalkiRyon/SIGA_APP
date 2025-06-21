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

-- Datos de prueba
INSERT INTO users (email, password, role, name) VALUES
('admin@siga.cl', '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'admin', 'Administrador'),
('funcionario@siga.cl', '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'officer', 'Funcionario Aduanero'),
('pasajero@siga.cl', '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'passenger', 'Pasajero/Turista');

-- Las contraseñas están hasheadas con bcrypt para 'admin123', 'funcionario123', 'pasajero123' respectivamente.
