#!/bin/bash

# SIGA ADUANAS - INSTALACION AUTOMATICA
# Para sistemas Unix/Linux/macOS

echo "============================================"
echo "     SIGA ADUANAS - INSTALACION AUTOMATICA"
echo "============================================"
echo

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes de error
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para imprimir mensajes de éxito
print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Función para imprimir mensajes de información
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para imprimir advertencias
print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado."
    echo "Por favor, instala Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Ubuntu/Debian: sudo apt-get install nodejs npm"
    echo "  - CentOS/RHEL: sudo yum install nodejs npm"
    echo "  - Arch Linux: sudo pacman -S nodejs npm"
    echo "  - O descarga desde: https://nodejs.org/"
    echo
    echo "Se requiere Node.js versión 18 o superior."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version)
print_info "Verificando Node.js..."
print_success "Node.js detectado: $NODE_VERSION"
echo

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    print_error "npm no está disponible."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_info "Verificando npm..."
print_success "npm detectado: v$NPM_VERSION"
echo

# Verificar si MySQL está instalado
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL no detectado en PATH."
    echo "Si MySQL no está instalado, puedes instalarlo con:"
    echo "  - macOS: brew install mysql"
    echo "  - Ubuntu/Debian: sudo apt-get install mysql-server"
    echo "  - CentOS/RHEL: sudo yum install mysql-server"
    echo "  - Arch Linux: sudo pacman -S mysql"
    echo
    read -p "¿Continuar sin verificar MySQL? (y/n): " continuar
    if [[ ! $continuar =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_info "Verificando MySQL..."
    MYSQL_VERSION=$(mysql --version)
    print_success "MySQL detectado: $MYSQL_VERSION"
fi
echo

# Instalar dependencias de Node.js
print_info "Instalando dependencias del proyecto..."
echo "============================================"
if ! npm install; then
    print_error "Error al instalar dependencias de npm."
    exit 1
fi
print_success "Dependencias instaladas correctamente."
echo

# Verificar archivos críticos
print_info "Verificando archivos del proyecto..."

if [ ! -f "backend.cjs" ]; then
    print_error "Archivo backend.cjs no encontrado."
    exit 1
fi
print_success "backend.cjs encontrado."

if [ ! -f "siga_app.sql" ]; then
    print_error "Archivo siga_app.sql no encontrado."
    exit 1
fi
print_success "siga_app.sql encontrado."

if [ ! -f "package.json" ]; then
    print_error "Archivo package.json no encontrado."
    exit 1
fi
print_success "package.json encontrado."
echo

# Instrucciones para la base de datos
echo "============================================"
echo "     CONFIGURACION DE BASE DE DATOS"
echo "============================================"
echo
echo "Para configurar la base de datos MySQL:"
echo
echo "1. Asegúrate de que MySQL esté ejecutándose:"
echo "   - macOS: brew services start mysql"
echo "   - Linux: sudo systemctl start mysql"
echo
echo "2. Ejecuta uno de estos comandos:"
echo
echo "   Opción A - Con contraseña:"
echo "   mysql -u root -p < siga_app.sql"
echo
echo "   Opción B - Sin contraseña:"
echo "   mysql -u root < siga_app.sql"
echo

# Crear archivo de configuración de base de datos
print_info "Creando archivo de configuración..."
cat > db_config.txt << EOF
// Configuración de base de datos para SIGA
// Edita backend.cjs si necesitas cambiar estos valores:

Host: localhost
Usuario: root
Contraseña: (vacía por defecto)
Base de datos: siga_app
Puerto: 3306
EOF

# Crear scripts de ejecución
print_info "Creando scripts de ejecución..."

# Script para ejecutar solo el backend
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "Iniciando backend SIGA en puerto 4000..."
npm run backend
EOF

# Script para ejecutar solo el frontend
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "Iniciando frontend SIGA en puerto 5173..."
npm run dev
EOF

# Script para ejecutar ambos
cat > start_full.sh << 'EOF'
#!/bin/bash
echo "Iniciando SIGA completo..."
echo

echo "[1/2] Iniciando backend..."
gnome-terminal --title="Backend SIGA" -- bash -c "npm run backend; bash" 2>/dev/null || \
xterm -title "Backend SIGA" -e "npm run backend" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"$(pwd)\" && npm run backend"' 2>/dev/null || \
(npm run backend &)

sleep 3

echo "[2/2] Iniciando frontend..."
gnome-terminal --title="Frontend SIGA" -- bash -c "npm run dev; bash" 2>/dev/null || \
xterm -title "Frontend SIGA" -e "npm run dev" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"$(pwd)\" && npm run dev"' 2>/dev/null || \
npm run dev

echo
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:5173"
EOF

# Hacer ejecutables los scripts
chmod +x start_backend.sh
chmod +x start_frontend.sh
chmod +x start_full.sh

print_success "Scripts de ejecución creados:"
echo "     - start_backend.sh (solo backend)"
echo "     - start_frontend.sh (solo frontend)"  
echo "     - start_full.sh (ambos servicios)"
echo

# Resumen final
echo "============================================"
echo "          INSTALACION COMPLETADA"
echo "============================================"
echo
print_success "Dependencias de Node.js instaladas"
print_success "Scripts de ejecución creados"
print_success "Archivo de configuración creado"
echo
echo "PROXIMOS PASOS:"
echo
echo "1. Configurar MySQL y ejecutar: mysql -u root -p < siga_app.sql"
echo "2. Ejecutar el proyecto con: ./start_full.sh"
echo "3. Acceder a: http://localhost:5173"
echo
echo "USUARIOS DE PRUEBA:"
echo "  Admin: admin@siga.cl / admin123"
echo "  Funcionario: funcionario@siga.cl / funcionario123"  
echo "  Pasajero: pasajero@siga.cl / pasajero123"
echo
echo "============================================"
echo
