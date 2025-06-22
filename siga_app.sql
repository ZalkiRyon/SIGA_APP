DROP DATABASE IF EXISTS siga_app;
CREATE DATABASE siga_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
  name VARCHAR(100) NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  perfil VARCHAR(50) DEFAULT NULL
);

-- Datos de prueba
INSERT INTO users (email, password, role, name, nombre, apellidos, rut, telefono, sexo, region, comuna, direccion, estado, perfil) VALUES
('admin@siga.cl', 'admin123', 'admin', 'Administrador', 'Administrador', 'Sistema', '1.111.111-1', '912345678', 'Masculino', 'Metropolitana', 'Santiago', 'Av. Principal 123', 'activo', 'Perfil Admin'),
('admin2@siga.cl', 'admin456', 'admin', 'Administrador 2', 'Rodrigo', 'Vargas', '2.222.222-2', '912345679', 'Masculino', 'Metropolitana', 'Las Condes', 'Av. Kennedy 500', 'activo', 'Perfil Admin'),
('funcionario@siga.cl', 'funcionario123', 'officer', 'Funcionario Aduanero', 'Carlos', 'González', '8.888.888-8', '987654321', 'Masculino', 'Valparaíso', 'Viña del Mar', 'Calle Aduana 456', 'activo', 'Perfil Aduanero 1'),
('funcionario2@siga.cl', 'func456', 'officer', 'Funcionario Aduanero', 'Ana', 'Martínez', '9.999.999-9', '987654322', 'Femenino', 'Arica y Parinacota', 'Arica', 'Av. Frontera 123', 'activo', 'Perfil Aduanero 2'),
('funcionario3@siga.cl', 'func789', 'officer', 'Funcionario Aduanero', 'Pedro', 'Soto', '7.777.777-7', '987654323', 'Masculino', 'Los Lagos', 'Puerto Montt', 'Manuel Rodríguez 789', 'activo', 'Perfil Aduanero 1'),
('pasajero@siga.cl', 'pasajero123', 'passenger', 'Pasajero/Turista', 'María', 'López', '12.345.678-9', '945678123', 'Femenino', 'Metropolitana', 'Providencia', 'Los Leones 789', 'activo', NULL),
('juan.perez@gmail.com', 'pass123', 'passenger', 'Juan Pérez', 'Juan', 'Pérez', '10.111.222-3', '956789123', 'Masculino', 'Metropolitana', 'Ñuñoa', 'Av. Irarrázaval 1500', 'activo', NULL),
('carmen.silva@hotmail.com', 'pass456', 'passenger', 'Carmen Silva', 'Carmen', 'Silva', '11.222.333-4', '967891234', 'Femenino', 'Biobío', 'Concepción', 'Barros Arana 2500', 'activo', NULL),
('roberto.muñoz@outlook.com', 'pass789', 'passenger', 'Roberto Muñoz', 'Roberto', 'Muñoz', '12.333.444-5', '978912345', 'Masculino', 'Valparaíso', 'Valparaíso', 'Av. Brasil 700', 'activo', NULL),
('andrea.fuentes@yahoo.com', 'pass321', 'passenger', 'Andrea Fuentes', 'Andrea', 'Fuentes', '13.444.555-6', '989123456', 'Femenino', 'Metropolitana', 'Santiago', 'Santa Rosa 2300', 'inactivo', NULL);

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
  custom_id VARCHAR(20) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
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
  custom_id VARCHAR(20) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
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
  fecha_aprobacion DATE DEFAULT NULL,
  fecha_rechazo DATE DEFAULT NULL,
  custom_id VARCHAR(20) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla para secuencias de identificadores personalizados
CREATE TABLE IF NOT EXISTS tramite_sequences (
  tipo VARCHAR(20) PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

-- Inicializar secuencias para cada tipo
INSERT INTO tramite_sequences (tipo, last_number) VALUES
  ('vehiculo', 6),
  ('menores', 5),
  ('animal', 4),
  ('vegetal', 4),
  ('mascota', 4)
ON DUPLICATE KEY UPDATE tipo=tipo;

-- Insertar todos los trámites de ejemplo para pasajero@siga.cl

-- Primeros registros de vehículos (ID 1 y ID 2)
INSERT INTO tramites_vehiculo (
  user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
  archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion,
  archivo_certificado, archivo_seguro, custom_id
) VALUES
(
  3, 'XYZ789', 'Nissan', 'Sentra', '2020', 'Azul', '2025-05-30', '2025-12-07',
  'cedula_demo1.pdf', 'licencia_demo1.pdf', 'revision_demo1.pdf', 'salida_demo1.pdf', NULL,
  'certificado_demo1.pdf', 'seguro_demo1.pdf', 'VEH-0001'
),
(
  3, 'ABC123', 'Toyota', 'Corolla', '2022', 'Rojo', '2025-06-22', '2025-12-22',
  'cedula_demo2.pdf', 'licencia_demo2.pdf', 'revision_demo2.pdf', 'salida_demo2.pdf', NULL,
  'certificado_demo2.pdf', 'seguro_demo2.pdf', 'VEH-0002'
);

-- Trámite de menores de edad (ID 1)
INSERT INTO tramites_menores (
  user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
  acomp_nombres, acomp_apellidos, acomp_rut,
  archivo_identidad, archivo_autorizacion, custom_id
) VALUES (
  3, 'Juanito', 'Pérez Soto', '22.222.222-2', '2010-09-02',
  'María', 'Soto López', '11.111.111-1',
  'identidad_demo.pdf', 'autorizacion_demo.pdf', 'MEN-0001'
);

-- Trámites de alimentos/mascotas de ejemplo para pasajero@siga.cl
INSERT INTO tramites_alimentos (
  user_id, tipo, cantidad, transporte, descripcion, custom_id
) VALUES
  (3, 'vegetal', 3, 'Auto particular', '3 manzanas y 2 peras en bolsa sellada', 'VEG-0001'),
  (3, 'mascota', 1, 'Auto particular', 'Perro raza mixta, 2 años, con chip', 'MAS-0001'),
  (3, 'animal', 2, 'Bus', 'Queso y jamón envasados al vacío', 'ANI-0001');

-- Tabla de documentos de mascotas para trámites SAG
CREATE TABLE IF NOT EXISTS documentos_mascotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tramite_id INT NOT NULL,
  tipo_mascota VARCHAR(30) NOT NULL,
  archivo_registro VARCHAR(255) NOT NULL,
  archivo_vacunas VARCHAR(255) NOT NULL,
  archivo_desparasitacion VARCHAR(255) NOT NULL,
  archivo_zoo VARCHAR(255) NOT NULL,
  FOREIGN KEY (tramite_id) REFERENCES tramites_alimentos(id)
);

-- Insertar documentos de mascota usando subconsulta para el ID del trámite
INSERT INTO documentos_mascotas (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
VALUES (
  (SELECT id FROM tramites_alimentos WHERE user_id = 3 AND tipo = 'mascota' ORDER BY id DESC LIMIT 1),
  'Perro', 'registro_demo.pdf', 'vacunas_demo.pdf', 'desparasitacion_demo.pdf', 'zoo_demo.pdf'
);

-- Insertar trámites adicionales con diferentes estados para probar fechas
INSERT INTO tramites_alimentos (
  user_id, tipo, cantidad, transporte, descripcion, estado, fecha_creacion, fecha_aprobacion, fecha_rechazo, custom_id
) VALUES
  (3, 'vegetal', 5, 'Barco', 'Semillas de chía y amaranto', 'Aprobado', '2025-05-15 10:30:00', '2025-05-20', NULL, 'VEG-0002'),
  (3, 'animal', 3, 'Avión', 'Productos lácteos sellados', 'Rechazado', '2025-05-17 14:20:00', NULL, '2025-05-19', 'ANI-0002'),
  (3, 'mascota', 1, 'Automóvil', 'Gato doméstico vacunado', 'Aprobado', '2025-06-01 09:15:00', '2025-06-10', NULL, 'MAS-0002');
  
-- Insertar documentación para la mascota adicional
INSERT INTO documentos_mascotas (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
VALUES (
  (SELECT id FROM tramites_alimentos WHERE custom_id = 'MAS-0002'),
  'Gato', 'registro_gato.pdf', 'vacunas_gato.pdf', 'desparasitacion_gato.pdf', 'zoo_gato.pdf'
);

-- Trámites adicionales para los nuevos pasajeros
-- Trámites de vehículo para Juan Pérez (ID 7)
INSERT INTO tramites_vehiculo (
  user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
  archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion,
  archivo_certificado, archivo_seguro, custom_id, estado
) VALUES
(
  7, 'BCDF12', 'Honda', 'Civic', '2023', 'Negro', '2025-06-25', '2025-09-25',
  'cedula_jp.pdf', 'licencia_jp.pdf', 'revision_jp.pdf', 'salida_jp.pdf', NULL,
  'certificado_jp.pdf', 'seguro_jp.pdf', 'VEH-0003', 'En revisión'
),
(
  7, 'GHJK34', 'Mazda', 'CX-5', '2022', 'Gris', '2025-07-10', '2025-10-10',
  'cedula_jp2.pdf', 'licencia_jp2.pdf', 'revision_jp2.pdf', 'salida_jp2.pdf', NULL,
  'certificado_jp2.pdf', 'seguro_jp2.pdf', 'VEH-0004', 'Aprobado'
);

-- Trámite de menores para Carmen Silva (ID 8)
INSERT INTO tramites_menores (
  user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
  acomp_nombres, acomp_apellidos, acomp_rut,
  archivo_identidad, archivo_autorizacion, custom_id, estado
) VALUES 
(
  8, 'Sofía', 'Silva Rojas', '24.111.222-3', '2015-05-12',
  'Jorge', 'Rojas Pérez', '15.888.999-0',
  'identidad_cs.pdf', 'autorizacion_cs.pdf', 'MEN-0002', 'Aprobado'
),
(
  8, 'Matías', 'Silva Rojas', '25.333.444-5', '2018-03-25',
  'Jorge', 'Rojas Pérez', '15.888.999-0',
  'identidad_cs2.pdf', 'autorizacion_cs2.pdf', 'MEN-0003', 'Rechazado'
);

-- Trámite de menores para Roberto Muñoz (ID 9)
INSERT INTO tramites_menores (
  user_id, menor_nombres, menor_apellidos, menor_rut, menor_nacimiento,
  acomp_nombres, acomp_apellidos, acomp_rut,
  archivo_identidad, archivo_autorizacion, custom_id, estado
) VALUES 
(
  9, 'Lucas', 'Muñoz Vega', '26.555.666-7', '2014-11-08',
  'Elena', 'Vega López', '16.777.888-9',
  'identidad_rm.pdf', 'autorizacion_rm.pdf', 'MEN-0004', 'En revisión'
);

-- Trámites de alimentos para Roberto Muñoz (ID 9)
INSERT INTO tramites_alimentos (
  user_id, tipo, cantidad, transporte, descripcion, custom_id, estado, fecha_creacion
) VALUES
  (9, 'vegetal', 4, 'Auto particular', 'Frutas secas y frutos secos', 'VEG-0003', 'En revisión', '2025-06-20 15:20:00'),
  (9, 'animal', 2, 'Avión', 'Embutidos envasados al vacío', 'ANI-0003', 'Rechazado', '2025-06-19 09:45:00');

-- Trámite de mascota para Carmen Silva (ID 8)
INSERT INTO tramites_alimentos (
  user_id, tipo, cantidad, transporte, descripcion, custom_id, estado, fecha_creacion, fecha_aprobacion
) VALUES
  (8, 'mascota', 1, 'Auto particular', 'Gato siamés, 3 años', 'MAS-0003', 'Aprobado', '2025-06-15 11:30:00', '2025-06-18');

-- Documentación para la mascota de Carmen Silva
INSERT INTO documentos_mascotas (tramite_id, tipo_mascota, archivo_registro, archivo_vacunas, archivo_desparasitacion, archivo_zoo)
VALUES (
  (SELECT id FROM tramites_alimentos WHERE custom_id = 'MAS-0003'),
  'Gato', 'registro_cs_gato.pdf', 'vacunas_cs_gato.pdf', 'desparasitacion_cs_gato.pdf', 'zoo_cs_gato.pdf'
);

-- Vehículo para Andrea Fuentes (ID 10, aunque usuario inactivo)
INSERT INTO tramites_vehiculo (
  user_id, patente, marca, modelo, anio, color, fecha_inicio, fecha_termino,
  archivo_cedula, archivo_licencia, archivo_revision, archivo_salida, archivo_autorizacion,
  archivo_certificado, archivo_seguro, custom_id, estado
) VALUES
(
  10, 'PQRS56', 'Kia', 'Sportage', '2021', 'Blanco', '2025-06-01', '2025-07-30',
  'cedula_af.pdf', 'licencia_af.pdf', 'revision_af.pdf', 'salida_af.pdf', NULL,
  'certificado_af.pdf', 'seguro_af.pdf', 'VEH-0005', 'Rechazado'
);