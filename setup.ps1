# PowerShell Script para Instalación Automática de SIGA
# Ejecutar con: PowerShell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     SIGA ADUANAS - INSTALACION AUTOMATICA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) { return $true }
    }
    catch { return $false }
}

# Función para imprimir mensajes de error
function Write-Error-Message($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Función para imprimir mensajes de éxito
function Write-Success-Message($message) {
    Write-Host "[✓] $message" -ForegroundColor Green
}

# Función para imprimir mensajes de información
function Write-Info-Message($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

# Función para imprimir advertencias
function Write-Warning-Message($message) {
    Write-Host "[ADVERTENCIA] $message" -ForegroundColor Yellow
}

# Verificar si Node.js está instalado
if (!(Test-Command "node")) {
    Write-Error-Message "Node.js no está instalado."
    Write-Host "Por favor, descarga e instala Node.js desde: https://nodejs.org/" -ForegroundColor White
    Write-Host "Se requiere Node.js versión 18 o superior." -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones de instalación:" -ForegroundColor White
    Write-Host "1. Descargar desde nodejs.org" -ForegroundColor White
    Write-Host "2. Usar Chocolatey: choco install nodejs" -ForegroundColor White
    Write-Host "3. Usar winget: winget install OpenJS.NodeJS" -ForegroundColor White
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar versión de Node.js
$nodeVersion = node --version
Write-Info-Message "Verificando Node.js..."
Write-Success-Message "Node.js detectado: $nodeVersion"
Write-Host ""

# Verificar si npm está disponible
if (!(Test-Command "npm")) {
    Write-Error-Message "npm no está disponible."
    Read-Host "Presiona Enter para salir"
    exit 1
}

$npmVersion = npm --version
Write-Info-Message "Verificando npm..."
Write-Success-Message "npm detectado: v$npmVersion"
Write-Host ""

# Verificar si MySQL está instalado
if (!(Test-Command "mysql")) {
    Write-Warning-Message "MySQL no detectado en PATH."
    Write-Host "Si MySQL no está instalado, puedes instalarlo con:" -ForegroundColor White
    Write-Host "1. Descargar desde: https://dev.mysql.com/downloads/mysql/" -ForegroundColor White
    Write-Host "2. Usar Chocolatey: choco install mysql" -ForegroundColor White
    Write-Host "3. Usar XAMPP: https://www.apachefriends.org/" -ForegroundColor White
    Write-Host ""
    $continuar = Read-Host "¿Continuar sin verificar MySQL? (y/n)"
    if ($continuar -ne "y" -and $continuar -ne "Y") {
        exit 1
    }
} else {
    Write-Info-Message "Verificando MySQL..."
    $mysqlVersion = mysql --version
    Write-Success-Message "MySQL detectado: $mysqlVersion"
}
Write-Host ""

# Instalar dependencias de Node.js
Write-Info-Message "Instalando dependencias del proyecto..."
Write-Host "============================================" -ForegroundColor Cyan

try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error en npm install"
    }
} catch {
    Write-Error-Message "Error al instalar dependencias de npm."
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Success-Message "Dependencias instaladas correctamente."
Write-Host ""

# Verificar archivos críticos
Write-Info-Message "Verificando archivos del proyecto..."

if (!(Test-Path "backend.cjs")) {
    Write-Error-Message "Archivo backend.cjs no encontrado."
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Success-Message "backend.cjs encontrado."

if (!(Test-Path "siga_app.sql")) {
    Write-Error-Message "Archivo siga_app.sql no encontrado."
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Success-Message "siga_app.sql encontrado."

if (!(Test-Path "package.json")) {
    Write-Error-Message "Archivo package.json no encontrado."
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Success-Message "package.json encontrado."
Write-Host ""

# Instrucciones para la base de datos
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     CONFIGURACION DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para configurar la base de datos MySQL:" -ForegroundColor White
Write-Host ""
Write-Host "1. Asegúrate de que MySQL esté ejecutándose" -ForegroundColor White
Write-Host "2. Ejecuta uno de estos comandos:" -ForegroundColor White
Write-Host ""
Write-Host "   Opción A - Con contraseña:" -ForegroundColor Yellow
Write-Host "   mysql -u root -p < siga_app.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   Opción B - Sin contraseña:" -ForegroundColor Yellow
Write-Host "   mysql -u root < siga_app.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   Opción C - Usando MySQL Workbench:" -ForegroundColor Yellow
Write-Host "   - Abre MySQL Workbench" -ForegroundColor Gray
Write-Host "   - Conecta a tu servidor local" -ForegroundColor Gray
Write-Host "   - Abre el archivo siga_app.sql" -ForegroundColor Gray
Write-Host "   - Ejecuta el script completo" -ForegroundColor Gray
Write-Host ""

# Crear archivo de configuración de base de datos
Write-Info-Message "Creando archivo de configuración..."
@"
// Configuración de base de datos para SIGA
// Edita backend.cjs si necesitas cambiar estos valores:

Host: localhost
Usuario: root
Contraseña: (vacía por defecto)
Base de datos: siga_app
Puerto: 3306
"@ | Out-File -FilePath "db_config.txt" -Encoding UTF8

# Crear scripts de ejecución PowerShell
Write-Info-Message "Creando scripts de ejecución..."

# Script para ejecutar solo el backend
@"
# Script para iniciar solo el backend
Write-Host "Iniciando backend SIGA en puerto 4000..." -ForegroundColor Green
npm run backend
"@ | Out-File -FilePath "start_backend.ps1" -Encoding UTF8

# Script para ejecutar solo el frontend
@"
# Script para iniciar solo el frontend
Write-Host "Iniciando frontend SIGA en puerto 5173..." -ForegroundColor Green
npm run dev
"@ | Out-File -FilePath "start_frontend.ps1" -Encoding UTF8

# Script para ejecutar ambos
@"
# Script para iniciar SIGA completo
Write-Host "Iniciando SIGA completo..." -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] Iniciando backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run backend" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/2] Iniciando frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
"@ | Out-File -FilePath "start_full.ps1" -Encoding UTF8

Write-Success-Message "Scripts de ejecución creados:"
Write-Host "     - start_backend.ps1 (solo backend)" -ForegroundColor White
Write-Host "     - start_frontend.ps1 (solo frontend)" -ForegroundColor White
Write-Host "     - start_full.ps1 (ambos servicios)" -ForegroundColor White
Write-Host ""

# Resumen final
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "          INSTALACION COMPLETADA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Success-Message "Dependencias de Node.js instaladas"
Write-Success-Message "Scripts de ejecución creados"
Write-Success-Message "Archivo de configuración creado"
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configurar MySQL y ejecutar: mysql -u root -p < siga_app.sql" -ForegroundColor White
Write-Host "2. Ejecutar el proyecto con: .\start_full.ps1" -ForegroundColor White
Write-Host "3. Acceder a: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "USUARIOS DE PRUEBA:" -ForegroundColor Yellow
Write-Host "  Admin: admin@siga.cl / admin123" -ForegroundColor White
Write-Host "  Funcionario: funcionario@siga.cl / funcionario123" -ForegroundColor White
Write-Host "  Pasajero: pasajero@siga.cl / pasajero123" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para finalizar"
