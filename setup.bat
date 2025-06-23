@echo off
echo ============================================
echo     SIGA ADUANAS - INSTALACION AUTOMATICA
echo ============================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado.
    echo Por favor, descarga e instala Node.js desde: https://nodejs.org/
    echo Se requiere Node.js version 18 o superior.
    pause
    exit /b 1
)

:: Mostrar versión de Node.js
echo [INFO] Verificando Node.js...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js detectado: %NODE_VERSION%
echo.

:: Verificar si npm está disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no está disponible.
    pause
    exit /b 1
)

:: Mostrar versión de npm
echo [INFO] Verificando npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm detectado: v%NPM_VERSION%
echo.

:: Verificar si MySQL está instalado
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] MySQL no detectado en PATH.
    echo Si MySQL no está instalado, puedes:
    echo   1. Descargar desde: https://dev.mysql.com/downloads/mysql/
    echo   2. Usar XAMPP: https://www.apachefriends.org/
    echo   3. Usar MySQL Workbench para gestión gráfica
    echo.
    set /p continuar="¿Continuar sin verificar MySQL? (y/n): "
    if /i not "%continuar%"=="y" exit /b 1
) else (
    echo [INFO] Verificando MySQL...
    for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo [✓] MySQL detectado: %MYSQL_VERSION%
)
echo.

:: Instalar dependencias de Node.js
echo [INFO] Instalando dependencias del proyecto...
echo ============================================
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias de npm.
    pause
    exit /b 1
)
echo [✓] Dependencias instaladas correctamente.
echo.

:: Verificar archivos críticos
echo [INFO] Verificando archivos del proyecto...
if not exist "backend.cjs" (
    echo [ERROR] Archivo backend.cjs no encontrado.
    pause
    exit /b 1
)
echo [✓] backend.cjs encontrado.

if not exist "siga_app.sql" (
    echo [ERROR] Archivo siga_app.sql no encontrado.
    pause
    exit /b 1
)
echo [✓] siga_app.sql encontrado.

if not exist "package.json" (
    echo [ERROR] Archivo package.json no encontrado.
    pause
    exit /b 1
)
echo [✓] package.json encontrado.
echo.

:: Instrucciones para la base de datos
echo ============================================
echo     CONFIGURACION DE BASE DE DATOS
echo ============================================
echo.
echo Para configurar la base de datos MySQL:
echo.
echo 1. Asegúrate de que MySQL esté ejecutándose
echo 2. Ejecuta uno de estos comandos:
echo.
echo    Opción A - Con contraseña:
echo    mysql -u root -p ^< siga_app.sql
echo.
echo    Opción B - Sin contraseña:
echo    mysql -u root ^< siga_app.sql
echo.
echo    Opción C - Usando MySQL Workbench:
echo    - Abre MySQL Workbench
echo    - Conecta a tu servidor local
echo    - Abre el archivo siga_app.sql
echo    - Ejecuta el script completo
echo.

:: Crear archivo de configuración de base de datos
echo [INFO] Creando archivo de configuración...
echo // Configuración de base de datos para SIGA > db_config.txt
echo // Edita backend.cjs si necesitas cambiar estos valores: >> db_config.txt
echo. >> db_config.txt
echo Host: localhost >> db_config.txt
echo Usuario: root >> db_config.txt
echo Contraseña: (vacía por defecto) >> db_config.txt
echo Base de datos: siga_app >> db_config.txt
echo Puerto: 3306 >> db_config.txt
echo.

:: Crear scripts de ejecución
echo [INFO] Creando scripts de ejecución...

:: Script para ejecutar solo el backend
echo @echo off > start_backend.bat
echo echo Iniciando backend SIGA en puerto 4000... >> start_backend.bat
echo npm run backend >> start_backend.bat

:: Script para ejecutar solo el frontend
echo @echo off > start_frontend.bat
echo echo Iniciando frontend SIGA en puerto 5173... >> start_frontend.bat
echo npm run dev >> start_frontend.bat

:: Script para ejecutar ambos
echo @echo off > start_full.bat
echo echo Iniciando SIGA completo... >> start_full.bat
echo echo. >> start_full.bat
echo echo [1/2] Iniciando backend... >> start_full.bat
echo start "Backend SIGA" cmd /k npm run backend >> start_full.bat
echo timeout /t 3 /nobreak ^> nul >> start_full.bat
echo echo [2/2] Iniciando frontend... >> start_full.bat
echo start "Frontend SIGA" cmd /k npm run dev >> start_full.bat
echo echo. >> start_full.bat
echo echo Backend: http://localhost:4000 >> start_full.bat
echo echo Frontend: http://localhost:5173 >> start_full.bat

echo [✓] Scripts de ejecución creados:
echo     - start_backend.bat (solo backend)
echo     - start_frontend.bat (solo frontend)  
echo     - start_full.bat (ambos servicios)
echo.

:: Resumen final
echo ============================================
echo          INSTALACION COMPLETADA
echo ============================================
echo.
echo [✓] Dependencias de Node.js instaladas
echo [✓] Scripts de ejecución creados
echo [✓] Archivo de configuración creado
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Configurar MySQL y ejecutar: mysql -u root -p ^< siga_app.sql
echo 2. Ejecutar el proyecto con: start_full.bat
echo 3. Acceder a: http://localhost:5173
echo.
echo USUARIOS DE PRUEBA:
echo   Admin: admin@siga.cl / admin123
echo   Funcionario: funcionario@siga.cl / funcionario123  
echo   Pasajero: pasajero@siga.cl / pasajero123
echo.
echo ============================================
echo.
pause
