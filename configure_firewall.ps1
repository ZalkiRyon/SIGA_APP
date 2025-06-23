# Script para configurar Windows Firewall para SIGA
# Ejecutar como Administrador

Write-Host "Configurando Windows Firewall para SIGA..." -ForegroundColor Green

try {
    # Abrir puerto 5173 para frontend
    netsh advfirewall firewall add rule name="SIGA Frontend" dir=in action=allow protocol=TCP localport=5173
    Write-Host "Puerto 5173 (Frontend) abierto en Windows Firewall" -ForegroundColor Green
    
    # Abrir puerto 4000 para backend
    netsh advfirewall firewall add rule name="SIGA Backend" dir=in action=allow protocol=TCP localport=4000
    Write-Host "Puerto 4000 (Backend) abierto en Windows Firewall" -ForegroundColor Green
    
    Write-Host "`nConfiguración de firewall completada!" -ForegroundColor Yellow
    Write-Host "El sistema SIGA ahora debería ser accesible desde otros computadores en la red." -ForegroundColor Yellow
    
    # Mostrar IP local
    Write-Host "`nIPs locales disponibles:" -ForegroundColor Cyan
    Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object IPAddress, InterfaceAlias | Format-Table
    
} catch {
    Write-Host "Error al configurar el firewall: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegúrese de ejecutar este script como Administrador" -ForegroundColor Yellow
}

Write-Host "`nPresione cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
