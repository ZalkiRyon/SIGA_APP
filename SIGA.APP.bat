@echo off
echo Iniciando servicios de SIGA...
echo.

echo Abriendo Backend en nueva consola...
start "SIGA Backend" cmd /k "cd /d C:\SIGA_APP && npm run backend"

echo Esperando 3 segundos antes de iniciar Frontend...
timeout /t 3 /nobreak >nul

echo Abriendo Frontend en nueva consola...
start "SIGA Frontend" cmd /k "cd /d C:\SIGA_APP && npm run dev"

echo Esperando que el frontend este listo...
timeout /t 3 /nobreak >nul

echo Abriendo Chrome con la aplicacion...
start chrome "http://localhost:5173/"

echo.
echo Ambos servicios iniciados:
echo - Backend: http://localhost:4000
echo - Frontend: http://localhost:5173
echo - Chrome abierto automaticamente
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
