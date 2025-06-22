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

-- Tabla de trámites de vehículo temporal
CREATE TABLE IF NOT EXISTS tramites_vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  patente VARCHAR(20) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  anio VARCHAR(10) NOT NULL,
  color VARCHAR(30) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  archivo_cedula VARCHAR(255) NOT NULL,
  archivo_licencia VARCHAR(255) NOT NULL,
  archivo_revision VARCHAR(255) NOT NULL,
  archivo_salida VARCHAR(255) NOT NULL,
  archivo_autorizacion VARCHAR(255),
  archivo_certificado VARCHAR(255) NOT NULL,
  archivo_seguro VARCHAR(255) NOT NULL,
  estado ENUM('En revisión','Aprobado','Rechazado') DEFAULT 'En revisión',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trámite de vehículo temporal de ejemplo para pasajero@siga.cl
INSERT INTO tramites_vehiculo (
  user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
  archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion,
  archivo_certificado, archivo_seguro
) VALUES (
  3, 'ABC123', 'Toyota', 'Corolla', '2022', 'Rojo', '2025-06-22', '2025-12-22',
  'cedula_demo.pdf', 'licencia_demo.pdf', 'revision_demo.pdf', 'salida_demo.pdf', NULL,
  'certificado_demo.pdf', 'seguro_demo.pdf'
);

-- Tabla de trámites de menores de edad
CREATE TABLE IF NOT EXISTS tramites_menores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  menor_nombres VARCHAR(100) NOT NULL,
  menor_apellidos VARCHAR(100) NOT NULL,
  menor_rut VARCHAR(20) NOT NULL,
  menor_nacimiento DATE NOT NULL,
  acomp_nombres VARCHAR(100) NOT NULL,
  acomp_apellidos VARCHAR(100) NOT NULL,
  acomp_rut VARCHAR(20) NOT NULL,
  archivo_identidad VARCHAR(255) NOT NULL,
  archivo_autorizacion VARCHAR(255) NOT NULL,
  estado ENUM('En revisión','Aprobado','Rechazado') DEFAULT 'En revisión',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trámite de menores de edad de ejemplo para pasajero@siga.cl
INSERT INTO tramites_menores (
  user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
  acomp_nombres, acomp_apellidos, acomp_rut,
  archivo_identidad, archivo_autorizacion
) VALUES (
  3, 'Juanito', 'Pérez Soto', '22.222.222-2', '2010-09-02',
  'María', 'Soto López', '11.111.111-1',
  'identidad_demo.pdf', 'autorizacion_demo.pdf'
);

-- Tabla de trámites de alimentos/mascotas (Declaración SAG)
CREATE TABLE IF NOT EXISTS tramites_alimentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tipo ENUM('vegetal','animal','mascota') NOT NULL,
  cantidad INT NOT NULL,
  transporte VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('En revisión','Aprobado','Rechazado') DEFAULT 'En revisión',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trámite de alimentos/mascotas de ejemplo para pasajero@siga.cl
INSERT INTO tramites_alimentos (
  user_id, tipo, cantidad, transporte, descripcion
) VALUES (
  3, 'vegetal', 3, 'Auto particular', '3 manzanas y 2 peras en bolsa sellada'
);
