# Guía de Instalación Rápida - SIGA Aduanas

Este archivo contiene instrucciones paso a paso para instalar y configurar el proyecto SIGA.

## 🚀 INSTALACIÓN AUTOMÁTICA

### Windows

**Opción 1 - Archivo Batch (.bat)**
```
1. Doble clic en: setup.bat
2. Seguir las instrucciones en pantalla
```

**Opción 2 - PowerShell (.ps1)**
```
1. Clic derecho en setup.ps1 → "Ejecutar con PowerShell"
   O desde PowerShell: .\setup.ps1
2. Seguir las instrucciones en pantalla
```

### macOS / Linux

**Script de Shell (.sh)**
```bash
1. Abrir terminal en la carpeta del proyecto
2. Ejecutar: chmod +x setup.sh
3. Ejecutar: ./setup.sh
4. Seguir las instrucciones en pantalla
```

## 📋 INSTALACIÓN MANUAL

### Requisitos Previos

**1. Node.js (v18 o superior)**
- Windows: https://nodejs.org/ o `choco install nodejs`
- macOS: `brew install node`
- Ubuntu/Debian: `sudo apt-get install nodejs npm`

**2. MySQL (v8.0 o superior)**
- Windows: https://dev.mysql.com/downloads/mysql/ o XAMPP
- macOS: `brew install mysql`
- Ubuntu/Debian: `sudo apt-get install mysql-server`

**3. Git (opcional)**
- Para clonar el repositorio

### Pasos de Instalación

**1. Instalar dependencias del proyecto**
```bash
npm install
```

**2. Configurar base de datos**
```bash
# Iniciar MySQL
# Windows: net start mysql
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Crear base de datos
mysql -u root -p < siga_app.sql
```

**3. Ejecutar el proyecto**
```bash
# Opción A: Ambos servicios en terminales separadas
npm run backend    # Terminal 1 (Puerto 4000)
npm run dev        # Terminal 2 (Puerto 5173)

# Opción B: Solo backend
npm run backend

# Opción C: Solo frontend
npm run dev
```

## 🌐 URLs de Acceso

- **Aplicación Web**: http://localhost:5173
- **API Backend**: http://localhost:4000

## 👥 Usuarios de Prueba

### Administradores
| Email | Contraseña |
|-------|------------|
| admin@siga.cl | admin123 |
| admin2@siga.cl | admin456 |

### Funcionarios Aduaneros
| Email | Contraseña |
|-------|------------|
| funcionario@siga.cl | funcionario123 |
| funcionario2@siga.cl | func456 |
| funcionario3@siga.cl | func789 |

### Pasajeros/Turistas
| Email | Contraseña |
|-------|------------|
| pasajero@siga.cl | pasajero123 |
| juan.perez@gmail.com | pass123 |
| carmen.silva@hotmail.com | pass456 |
| roberto.muñoz@outlook.com | pass789 |

## 🌐 ACCESO DESDE OTROS COMPUTADORES

### Configuración de Red

**1. URLs de Acceso**
- Frontend: http://[IP-DEL-SERVIDOR]:5173
- Backend: http://[IP-DEL-SERVIDOR]:4000

**2. Encontrar IP del servidor**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

**3. Configurar Firewall (Windows)**
```powershell
# Ejecutar como Administrador o usar el script:
.\configure_firewall.ps1
```

**4. Ejemplo de uso**
Si la IP del servidor es 192.168.1.100:
- Acceder desde otro PC: http://192.168.1.100:5173

### Requisitos de Red
- Computadores en la misma red local
- Puertos 5173 y 4000 abiertos en firewall
- Router configurado (para acceso externo)

## 🔧 Configuración de Base de Datos

### Configuración por Defecto
```
Host: localhost
Usuario: root
Contraseña: (vacía)
Base de datos: siga_app
Puerto: 3306
```

### Cambiar Configuración
Edita el archivo `backend.cjs` en la sección `dbConfig`:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',  // Cambia aquí
  database: 'siga_app',
};
```

## 🛠️ Comandos Útiles

```bash
# Verificar versiones
node --version
npm --version
mysql --version

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ejecutar en diferentes puertos
npm run dev -- --port 3000
# Cambiar puerto backend en backend.cjs: const PORT = 5000;

# Ver logs detallados
npm run backend --verbose
npm run dev --verbose

# Construir para producción
npm run build
npm run preview
```

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Error: "EADDRINUSE: address already in use"
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4000
kill -9 <PID>
```

### Error: "Access denied for user 'root'"
```bash
# Resetear contraseña de MySQL o usar:
mysql -u root < siga_app.sql
```

### Error: "Module not found: Error: Can't resolve"
```bash
# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📁 Archivos Importantes

- `setup.bat` - Script de instalación para Windows (Batch)
- `setup.ps1` - Script de instalación para Windows (PowerShell)
- `setup.sh` - Script de instalación para macOS/Linux
- `start_backend.*` - Scripts para ejecutar solo el backend
- `start_frontend.*` - Scripts para ejecutar solo el frontend
- `start_full.*` - Scripts para ejecutar ambos servicios
- `db_config.txt` - Configuración de base de datos
- `backend.cjs` - Servidor backend
- `siga_app.sql` - Esquema y datos de la base de datos
- `package.json` - Dependencias y scripts del proyecto

## 🎯 Funcionalidades del Sistema

### Para Pasajeros
- Crear trámites de vehículo temporal
- Documentación para menores de edad
- Declaraciones SAG (vegetales, animales, mascotas)
- Ver estado de trámites
- Editar trámites en revisión

### Para Funcionarios
- Validar y procesar trámites
- Aprobar/rechazar solicitudes
- Generar reportes
- Ver alertas y trámites urgentes
- Dashboard con estadísticas

### Para Administradores
- Gestionar usuarios del sistema
- Ver historial de actividad
- Administrar incidencias
- Configuración global del sistema

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Verifica que tengas las versiones correctas de Node.js y MySQL
2. Asegúrate de que todos los archivos del proyecto estén presentes
3. Revisa los logs de error en la consola
4. Consulta la sección de solución de problemas en el README.md

¡El sistema SIGA está listo para usar! 🎉
