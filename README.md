# SIGA Aduanas - Sistema Integral de Gestión Aduanera

## 📋 Descripción del Proyecto

SIGA Aduanas es una aplicación web integral diseñada para gestionar trámites aduaneros de manera eficiente y moderna. El sistema permite a pasajeros, funcionarios aduaneros y administradores realizar y supervisar diversos tipos de trámites relacionados con el cruce de fronteras.

### 🎯 Funcionalidades Principales

#### Para Pasajeros/Turistas:
- **Gestión de Trámites de Vehículo Temporal**: Solicitud de permisos para ingresar vehículos al país temporalmente
- **Documentación para Menores de Edad**: Tramitación de permisos para viaje de menores
- **Declaración SAG**: Gestión de declaraciones para productos:
  - Vegetales y productos alimenticios
  - Productos de origen animal
  - Mascotas y animales de compañía
- **Dashboard Personal**: Visualización y seguimiento de todos los trámites
- **Edición de Trámites**: Modificación de trámites en estado "En revisión"

#### Para Funcionarios Aduaneros:
- **Validación de Trámites**: Revisión y procesamiento de solicitudes
- **Dashboard Operativo**: Resumen de actividad y trámites urgentes
- **Gestión de Estados**: Aprobación y rechazo de trámites con motivos
- **Sistema de Alertas**: Notificaciones de trámites pendientes
- **Reportes**: Generación de estadísticas y reportes de gestión
- **Filtros Avanzados**: Búsqueda por tipo, estado y fechas

#### Para Administradores:
- **Gestión de Usuarios**: Administración completa de cuentas de usuario
- **Historial de Actividad**: Monitoreo de acciones del sistema
- **Gestión de Incidencias**: Seguimiento de problemas y errores
- **Configuración Global**: Ajustes de seguridad y sistema

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca principal de UI
- **React Router DOM 6.30.1** - Enrutamiento de aplicación
- **Vite 6.3.5** - Herramienta de construcción y desarrollo
- **CSS3** - Estilos personalizados
- **JavaScript (ES6+)** - Lenguaje principal

### Backend
- **Node.js** - Entorno de ejecución
- **Express 5.1.0** - Framework web
- **MySQL2 3.14.1** - Conexión a base de datos
- **JWT (jsonwebtoken 9.0.2)** - Autenticación y autorización
- **Multer 2.0.1** - Manejo de archivos subidos
- **CORS 2.8.5** - Configuración de CORS
- **BCrypt 6.0.0** - Encriptación de contraseñas
- **date-fns** - Manipulación de fechas

### Base de Datos
- **MySQL** - Sistema de gestión de base de datos relacional

### Herramientas de Desarrollo
- **ESLint 9.25.0** - Linter de código
- **Vite Plugin React** - Integración React con Vite

## 📦 Instalación y Configuración

### 🚀 Instalación Automática (Recomendada)

Para una instalación rápida y automática, utiliza los scripts incluidos:

#### Windows
```bash
# Opción 1 - Archivo Batch
.\setup.bat

# Opción 2 - PowerShell (recomendado)
.\setup.ps1
```

#### macOS / Linux
```bash
# Hacer ejecutable y ejecutar
chmod +x setup.sh
./setup.sh
```

Los scripts automáticamente:
- ✅ Verifican las dependencias del sistema
- ✅ Instalan todas las dependencias de npm
- ✅ Crean scripts de ejecución
- ✅ Configuran archivos de configuración
- ✅ Proporcionan instrucciones para MySQL

### 📋 Instalación Manual

### Requisitos Previos
- **Node.js** (versión 18 o superior)
- **MySQL** (versión 8.0 o superior)
- **Git** (para clonar el repositorio)

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd SIGA_APP
```

### 2. Instalación de Dependencias
```bash
# Instalar todas las dependencias de frontend y backend
npm install
```

### 3. Configuración de la Base de Datos

#### Instalar MySQL (si no está instalado)
```bash
# En Windows con Chocolatey
choco install mysql

# En macOS con Homebrew
brew install mysql

# En Ubuntu/Debian
sudo apt-get install mysql-server
```

#### Configurar la Base de Datos
1. Iniciar el servicio de MySQL
2. Crear la base de datos ejecutando el archivo SQL:
```bash
mysql -u root -p < siga_app.sql
```

### 4. Configuración del Backend
El backend está configurado para conectarse a MySQL con los siguientes parámetros por defecto:
- **Host**: localhost
- **Usuario**: root
- **Contraseña**: (vacía)
- **Base de datos**: siga_app
- **Puerto**: 3306

Si necesitas cambiar la configuración, edita el archivo `backend.cjs` en la sección `dbConfig`.

## 🚀 Ejecución del Proyecto

### 🎯 Ejecución Automática (Después de usar scripts de instalación)

#### Windows
```bash
# Ejecutar aplicación completa
.\start_full.bat         # Batch
.\start_full.ps1         # PowerShell

# Ejecutar servicios por separado
.\start_backend.bat      # Solo backend
.\start_frontend.bat     # Solo frontend
```

#### macOS / Linux
```bash
# Ejecutar aplicación completa
./start_full.sh

# Ejecutar servicios por separado
./start_backend.sh       # Solo backend
./start_frontend.sh      # Solo frontend
```

### 🔧 Ejecución Manual

### Modo Desarrollo

#### Opción 1: Ejecutar Frontend y Backend por Separado
```bash
# Terminal 1 - Backend (Puerto 4000)
npm run backend

# Terminal 2 - Frontend (Puerto 5173)
npm run dev
```

#### Opción 2: Comandos Individuales
```bash
# Solo Frontend
npm run dev

# Solo Backend
node backend.cjs
```

### Modo Producción
```bash
# Construir la aplicación
npm run build

# Previsualizar la construcción
npm run preview
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo de Vite
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta ESLint para verificar el código
- `npm run backend` - Inicia el servidor backend

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173 (o http://[IP-LOCAL]:5173 para acceso remoto)
- **Backend API**: http://localhost:4000 (o http://[IP-LOCAL]:4000 para acceso remoto)

> **Nota**: Al iniciar el backend, se mostrará automáticamente la IP local del servidor para facilitar el acceso desde otros computadores.

## 👥 Usuarios de Prueba

### Administradores
- **Email**: admin@siga.cl | **Contraseña**: admin123
- **Email**: admin2@siga.cl | **Contraseña**: admin456

### Funcionarios Aduaneros
- **Email**: funcionario@siga.cl | **Contraseña**: funcionario123
- **Email**: funcionario2@siga.cl | **Contraseña**: func456
- **Email**: funcionario3@siga.cl | **Contraseña**: func789

### Pasajeros/Turistas
- **Email**: pasajero@siga.cl | **Contraseña**: pasajero123
- **Email**: juan.perez@gmail.com | **Contraseña**: pass123
- **Email**: carmen.silva@hotmail.com | **Contraseña**: pass456
- **Email**: roberto.muñoz@outlook.com | **Contraseña**: pass789

## 📁 Estructura del Proyecto

```
SIGA_APP/
├── setup.bat                  # Script de instalación Windows (Batch)
├── setup.ps1                  # Script de instalación Windows (PowerShell)
├── setup.sh                   # Script de instalación macOS/Linux
├── start_backend.*            # Scripts para ejecutar solo backend
├── start_frontend.*           # Scripts para ejecutar solo frontend
├── start_full.*               # Scripts para ejecutar ambos servicios
├── INSTALACION.md             # Guía detallada de instalación
├── db_config.txt              # Configuración de base de datos (generado)
├── backend.cjs                # Servidor backend de Express
├── package.json               # Dependencias y scripts
├── siga_app.sql               # Esquema y datos de la base de datos
├── vite.config.js             # Configuración de Vite
├── index.html                 # Punto de entrada HTML
├── src/
│   ├── App.jsx                # Componente principal
│   ├── main.jsx              # Punto de entrada React
│   ├── components/           # Componentes organizados por rol
│   │   ├── Admin/           # Componentes de administrador
│   │   ├── Officer/         # Componentes de funcionario aduanero
│   │   ├── Passenger/       # Componentes de pasajero
│   │   ├── Auth/           # Componentes de autenticación
│   │   └── Shared/         # Componentes compartidos
│   ├── context/            # Contextos de React
│   ├── services/           # Servicios de API
│   ├── routes/            # Configuración de rutas
│   ├── styles/            # Estilos globales
│   └── utils/             # Utilidades
├── public/                # Archivos estáticos
├── uploads/              # Archivos subidos por usuarios
└── prototipo/           # Prototipos de diseño
```

## 🌐 Acceso desde Otros Computadores

El sistema SIGA está configurado para ser accesible desde otros computadores en la red local.

### URLs de Acceso en Red
- **Frontend**: http://[IP-DEL-SERVIDOR]:5173
- **Backend API**: http://[IP-DEL-SERVIDOR]:4000

### Para encontrar la IP del servidor:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### Ejemplo de Acceso
Si la IP del computador servidor es `192.168.1.100`:
- **Frontend**: http://192.168.1.100:5173
- **Backend**: http://192.168.1.100:4000

### Configuración de Red
1. **Firewall**: Asegurar que los puertos 5173 y 4000 estén abiertos
2. **Router**: Para acceso desde internet, configurar port forwarding
3. **Antivirus**: Verificar que no bloquee las conexiones

### Configuración de Firewall Windows
```powershell
# Abrir puertos en Windows Firewall
netsh advfirewall firewall add rule name="SIGA Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="SIGA Backend" dir=in action=allow protocol=TCP localport=4000
```

### Para uso en producción o acceso externo:
- Configurar HTTPS con certificados SSL
- Implementar autenticación más robusta
- Configurar reverse proxy (nginx/Apache)
- Usar variables de entorno para configuración

## 🔒 Seguridad

- Autenticación basada en JWT
- Validación de roles y permisos
- Encriptación de contraseñas con BCrypt
- Validación de datos en frontend y backend
- Sanitización de archivos subidos

## 🐛 Solución de Problemas

### Error de Conexión a la Base de Datos
1. Verificar que MySQL esté ejecutándose
2. Confirmar las credenciales en `backend.cjs`
3. Asegurar que la base de datos `siga_app` existe

### Error de Puerto en Uso
```bash
# Cambiar puerto del backend en backend.cjs
const PORT = 4001; # Cambiar de 4000 a otro puerto

# Para el frontend, modificar vite.config.js o usar:
npm run dev -- --port 5174
```

### Problemas de CORS
- El backend está configurado para permitir todas las origins en desarrollo
- Para producción, configurar CORS específicamente

## 📝 Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte de un sistema de gestión aduanera y su uso está restringido según las políticas organizacionales.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.
