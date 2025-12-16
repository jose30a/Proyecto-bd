# Guía de Configuración del Proyecto - Sistema de Turismo

Esta guía te ayudará a configurar y ejecutar el proyecto correctamente desde cero.

## 📋 Prerequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm (viene con Node.js)

## 🚀 Configuración Inicial

### 1. Clonar/Descargar el Proyecto

Si aún no tienes el proyecto:
```bash
cd "c:\Users\Windows 10\Documents"
# El proyecto ya debería estar en Proyecto-bd
```

### 2. Instalar Dependencias

#### Backend
```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd\server"
npm install
```

#### Frontend
```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd"
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server`:

```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd\server"
# Crea el archivo .env con el siguiente contenido:
```

Contenido del archivo `.env`:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=turismo_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI
DB_SSL=false

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# Session Secret (cambia esto por una cadena aleatoria segura)
SESSION_SECRET=tu_secreto_super_seguro_aqui_cambialo_por_favor
```

**⚠️ IMPORTANTE**: Reemplaza `TU_CONTRASEÑA_AQUI` con tu contraseña de PostgreSQL.

### 4. Crear la Base de Datos

#### Opción A: Usando pgAdmin o psql
```sql
CREATE DATABASE turismo_db;
```

#### Opción B: Desde la línea de comandos
```bash
psql -U postgres -c "CREATE DATABASE turismo_db;"
```

### 5. Inicializar el Schema de la Base de Datos

```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd\server"
```

#### Para una instalación limpia (primera vez):
```bash
node setup-database.js --drop --create --insert
```

**Esto hará:**
- `--drop`: Elimina todas las tablas existentes (si las hay)
- `--create`: Crea todas las tablas, funciones y procedimientos
- `--insert`: Inserta datos de prueba

#### Para actualizar solo el schema (sin borrar datos):
```bash
node setup-database.js --create
```

#### Para solo insertar datos de prueba:
```bash
node setup-database.js --insert
```

## ▶️ Ejecutar el Proyecto

### 1. Iniciar el Servidor Backend

Abre una terminal:
```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd\server"
npm start
```

Deberías ver:
```
🚀 Server running on port 3001
✅ Database connection successful
```

### 2. Iniciar el Frontend

Abre OTRA terminal (deja la anterior corriendo):
```bash
cd "c:\Users\Windows 10\Documents\Proyecto-bd"
npm run dev
```

Deberías ver:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

### 3. Abrir la Aplicación

Abre tu navegador y ve a: **http://localhost:5173**

## 👥 Usuarios de Prueba

Si ejecutaste `--insert`, tendrás estos usuarios:

| Email | Password | Rol |
|-------|----------|-----|
| admin@turismo.com | admin123 | Administrador |
| operator@turismo.com | operator123 | Operador |
| client@turismo.com | client123 | Cliente |

## 🔧 Solución de Problemas Comunes

### Error: "Connection refused" o "ECONNREFUSED"

**Problema**: No se puede conectar a la base de datos.

**Solución**:
1. Verifica que PostgreSQL esté corriendo
2. Revisa que las credenciales en `.env` sean correctas
3. Asegúrate de que el puerto 5432 no esté bloqueado

### Error: "Database turismo_db does not exist"

**Solución**:
```bash
psql -U postgres -c "CREATE DATABASE turismo_db;"
```

### Error: "Module not found" o "Cannot find module"

**Solución**:
```bash
# En la carpeta del backend
cd server
npm install

# En la carpeta del frontend
cd ..
npm install
```

### Error: "Port 3001 already in use"

**Solución**:
```bash
# Windows: Encuentra y mata el proceso
netstat -ano | findstr :3001
taskkill /PID [NUMERO_PID] /F
```

### Error: "no existe la columna" en create.sql

**Problema**: El schema de la base de datos está desactualizado.

**Solución**:
```bash
cd server
node setup-database.js --drop --create --insert
```

### Frontend muestra página en blanco

**Solución**:
1. Abre la consola del navegador (F12)
2. Verifica errores
3. Asegúrate de que el backend esté corriendo en puerto 3001
4. Limpia la caché del navegador (Ctrl+Shift+R)

## 📁 Estructura del Proyecto

```
Proyecto-bd/
├── server/                 # Backend (Node.js + Express)
│   ├── create.sql         # Schema de la base de datos
│   ├── insert.sql         # Datos de prueba
│   ├── drop.sql           # Limpiar base de datos
│   ├── index.js           # Servidor principal
│   ├── setup-database.js  # Script de configuración DB
│   └── .env               # Variables de entorno (crear tú)
├── src/                   # Frontend (React + TypeScript)
│   ├── components/        # Componentes React
│   ├── services/          # API calls
│   └── App.tsx            # Componente principal
└── package.json           # Dependencias frontend
```

## 🔄 Workflow de Desarrollo

### Cada vez que empieces a trabajar:

1. **Inicia PostgreSQL** (si no está corriendo automáticamente)

2. **Terminal 1 - Backend**:
   ```bash
   cd "c:\Users\Windows 10\Documents\Proyecto-bd\server"
   npm start
   ```

3. **Terminal 2 - Frontend**:
   ```bash
   cd "c:\Users\Windows 10\Documents\Proyecto-bd"
   npm run dev
   ```

4. **Navega a**: http://localhost:5173

### Cuando hagas cambios en el schema:

```bash
cd server
node setup-database.js --create
# O si quieres empezar desde cero:
node setup-database.js --drop --create --insert
```

## 📝 Comandos Útiles

### Base de Datos
```bash
# Resetear base de datos completamente
node setup-database.js --drop --create --insert

# Solo actualizar schema
node setup-database.js --create

# Solo insertar datos de prueba
node setup-database.js --insert

# Ver ayuda
node setup-database.js
```

### Desarrollo
```bash
# Backend
npm start              # Inicia el servidor
npm run dev            # Modo desarrollo con hot reload (si existe)

# Frontend  
npm run dev            # Servidor de desarrollo Vite
npm run build          # Compilar para producción
npm run preview        # Vista previa de build de producción
```

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema que no está aquí:

1. Revisa los logs de la consola (tanto backend como frontend)
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que PostgreSQL esté corriendo
4. Revisa que el archivo `.env` tenga las credenciales correctas

---

**¡Listo! Tu proyecto debería estar funcionando correctamente.** 🎉
