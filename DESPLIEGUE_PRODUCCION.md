# 🚀 Guía de Despliegue en Producción

## Sistema de Gestión Empresarial SaaS

Esta guía te llevará paso a paso para desplegar tu sistema completo en producción de forma **GRATUITA** (o con costos mínimos).

---

## 📋 Índice

1. [Arquitectura de Despliegue](#arquitectura-de-despliegue)
2. [Requisitos Previos](#requisitos-previos)
3. [Preparación del Código](#preparación-del-código)
4. [Despliegue del Backend (Railway)](#despliegue-del-backend-railway)
5. [Migración de Datos SQLite → PostgreSQL](#migración-de-datos)
6. [Despliegue del Frontend (Cloudflare Pages)](#despliegue-del-frontend-cloudflare-pages)
7. [Configuración Final y Pruebas](#configuración-final-y-pruebas)
8. [Mantenimiento y Actualizaciones](#mantenimiento-y-actualizaciones)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🏗️ Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIOS                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (Frontend)                    │
│              - React + Vite                                 │
│              - Hosting gratuito                             │
│              - CDN global                                   │
│              - HTTPS automático                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│                 RAILWAY (Backend)                           │
│              - FastAPI + Uvicorn                            │
│              - PostgreSQL incluido                          │
│              - $5/mes (500 horas gratis)                    │
│              - HTTPS automático                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            POSTGRESQL (Base de Datos)                       │
│              - Incluido en Railway                          │
│              - Backups automáticos                          │
│              - 1GB almacenamiento gratis                    │
└─────────────────────────────────────────────────────────────┘
```

### 💰 Costos Estimados

- **Frontend (Cloudflare Pages)**: **GRATIS** ✅
- **Backend + DB (Railway)**: **$5/mes** (500 horas gratis mensuales) ✅
- **Dominio personalizado** (opcional): $10-15/año

**Total inicial: $0** (usando tier gratuito de Railway)

---

## 📦 Requisitos Previos

### 1. Cuentas Necesarias

- ✅ **GitHub**: Para alojar el código
  - Crear cuenta en: https://github.com
  
- ✅ **Railway**: Para el backend y base de datos
  - Crear cuenta en: https://railway.app
  - Vincular con GitHub
  
- ✅ **Cloudflare**: Para el frontend
  - Crear cuenta en: https://dash.cloudflare.com

### 2. Herramientas Locales

```bash
# Git (para subir código)
git --version

# Python 3.8+ (para scripts de migración)
python --version

# Node.js 16+ (para build del frontend)
node --version
npm --version
```

---

## 🔧 Preparación del Código

### Paso 1: Inicializar Git (si no lo has hecho)

```bash
cd "g:\Nueva carpeta (4)\Nueva carpeta45"
git init
```

### Paso 2: Crear archivo `.gitignore` en la raíz

Ya existe, pero verifica que incluya:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.db
*.sqlite3

# Node
node_modules/
dist/
build/
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### Paso 3: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `sistema-gestion-empresarial`
3. Descripción: "Sistema SaaS de Gestión Empresarial"
4. Público o Privado (tu elección)
5. **NO** inicialices con README (ya tienes uno)
6. Crea el repositorio

### Paso 4: Subir código a GitHub

```bash
# Agregar remote
git remote add origin https://github.com/TU_USUARIO/sistema-gestion-empresarial.git

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit: Sistema de Gestión Empresarial SaaS"

# Subir a GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 Despliegue del Backend (Railway)

### Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a GitHub
5. Selecciona tu repositorio `sistema-gestion-empresarial`

### Paso 2: Configurar el Servicio Backend

1. Railway detectará automáticamente que es un proyecto Python
2. Configura las siguientes variables de entorno:

#### Variables de Entorno en Railway

```bash
# Base de datos (Railway la provee automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Seguridad
SECRET_KEY=tu_clave_secreta_super_segura_aqui_cambiar_esto_123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL (la configuraremos después)
FRONTEND_URL=https://tu-app.pages.dev
```

**⚠️ IMPORTANTE**: Genera una SECRET_KEY segura:

```python
# Ejecuta esto en Python para generar una clave segura
import secrets
print(secrets.token_urlsafe(32))
```

### Paso 3: Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database" → "PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se vinculará automáticamente

### Paso 4: Configurar Build y Start

Railway necesita saber cómo iniciar tu aplicación. Crea estos archivos:

#### `Procfile` (en la raíz del proyecto)

```
web: cd backend && gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

#### `railway.json` (en la raíz del proyecto)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### `nixpacks.toml` (en la raíz del proyecto)

```toml
[phases.setup]
nixPkgs = ["python39", "postgresql"]

[phases.install]
cmds = ["cd backend && pip install -r requirements.txt"]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "cd backend && gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT"
```

### Paso 5: Actualizar `backend/app/config.py`

```python
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Paso 6: Actualizar `backend/requirements.txt`

Asegúrate de que incluya:

```txt
fastapi
uvicorn[standard]
sqlalchemy
pydantic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
email-validator
python-dotenv
psycopg2-binary
gunicorn
```

### Paso 7: Desplegar

```bash
# Commit y push de los cambios
git add .
git commit -m "Configuración para Railway"
git push origin main
```

Railway detectará el push y comenzará el despliegue automáticamente.

### Paso 8: Obtener URL del Backend

1. En Railway, ve a tu servicio backend
2. Ve a **"Settings" → "Networking"**
3. Click en **"Generate Domain"**
4. Copia la URL (ej: `https://tu-app.up.railway.app`)

---

## 🔄 Migración de Datos

Si ya tienes datos en SQLite local, necesitas migrarlos a PostgreSQL.

### Script de Migración

Crea `backend/migrate_to_postgres.py`:

```python
"""
Script para migrar datos de SQLite a PostgreSQL
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models_extended import Base, User, Client, Category, Supplier, Product, Quotation, Sale, Rental, InventoryMovement
from app.models_organization import Organization

# URLs de base de datos
SQLITE_URL = "sqlite:///./inventory.db"
POSTGRES_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

# Crear engines
sqlite_engine = create_engine(SQLITE_URL)
postgres_engine = create_engine(POSTGRES_URL)

# Crear sesiones
SqliteSession = sessionmaker(bind=sqlite_engine)
PostgresSession = sessionmaker(bind=postgres_engine)

def migrate_data():
    """Migra todos los datos de SQLite a PostgreSQL"""
    
    print("🔄 Iniciando migración de datos...")
    
    # Crear tablas en PostgreSQL
    print("📋 Creando tablas en PostgreSQL...")
    Base.metadata.create_all(bind=postgres_engine)
    
    sqlite_db = SqliteSession()
    postgres_db = PostgresSession()
    
    try:
        # Lista de modelos a migrar (en orden de dependencias)
        models = [
            Organization,
            User,
            Category,
            Supplier,
            Client,
            Product,
            Quotation,
            Sale,
            Rental,
            InventoryMovement
        ]
        
        for model in models:
            print(f"\n📦 Migrando {model.__tablename__}...")
            
            # Obtener datos de SQLite
            records = sqlite_db.query(model).all()
            
            if not records:
                print(f"   ⚠️  No hay datos en {model.__tablename__}")
                continue
            
            # Insertar en PostgreSQL
            for record in records:
                # Crear diccionario con los datos
                data = {}
                for column in model.__table__.columns:
                    data[column.name] = getattr(record, column.name)
                
                # Crear nuevo objeto
                new_record = model(**data)
                postgres_db.add(new_record)
            
            postgres_db.commit()
            print(f"   ✅ {len(records)} registros migrados")
        
        print("\n✅ Migración completada exitosamente!")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        postgres_db.rollback()
        raise
    finally:
        sqlite_db.close()
        postgres_db.close()

if __name__ == "__main__":
    migrate_data()
```

### Ejecutar Migración

```bash
# Desde tu máquina local
cd backend

# Configurar URL de PostgreSQL de Railway
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Ejecutar migración
python migrate_to_postgres.py
```

**Alternativa**: Inicializar datos directamente en producción:

```bash
# Conectarse a Railway CLI
railway login
railway link

# Ejecutar script de inicialización
railway run python backend/init_db_final.py
```

---

## ☁️ Despliegue del Frontend (Cloudflare Pages)

### Paso 1: Preparar Frontend para Producción

#### Actualizar `frontend/src/services/api.js`

```javascript
import axios from 'axios';

// Usar variable de entorno o URL de producción
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Crear `frontend/.env.production`

```bash
VITE_API_URL=https://tu-app.up.railway.app/api
```

#### Actualizar `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

### Paso 2: Crear Build de Producción Localmente (Prueba)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear build
npm run build

# Probar build localmente
npm run preview
```

### Paso 3: Desplegar en Cloudflare Pages

#### Opción A: Desde Dashboard de Cloudflare

1. Ve a https://dash.cloudflare.com
2. Click en **"Workers & Pages"**
3. Click en **"Create application"**
4. Selecciona **"Pages"** → **"Connect to Git"**
5. Autoriza Cloudflare para acceder a GitHub
6. Selecciona tu repositorio
7. Configura el build:

```
Framework preset: Vite
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
Root directory: /
```

8. Variables de entorno:

```
VITE_API_URL=https://tu-app.up.railway.app/api
```

9. Click en **"Save and Deploy"**

#### Opción B: Desde CLI (Wrangler)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Desde el directorio frontend
cd frontend

# Desplegar
wrangler pages deploy dist --project-name=sistema-gestion
```

### Paso 4: Obtener URL del Frontend

Cloudflare te dará una URL como:
- `https://sistema-gestion.pages.dev`

---

## ⚙️ Configuración Final y Pruebas

### Paso 1: Actualizar CORS en Backend

Actualiza `backend/app/main.py`:

```python
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    FRONTEND_URL,
    "https://*.pages.dev",  # Para previews de Cloudflare
]

# Si hay una URL específica de producción
if FRONTEND_URL and FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Paso 2: Actualizar Variables en Railway

En Railway, agrega/actualiza:

```bash
FRONTEND_URL=https://sistema-gestion.pages.dev
```

### Paso 3: Actualizar Variables en Cloudflare

En Cloudflare Pages, Settings → Environment variables:

```bash
VITE_API_URL=https://tu-app.up.railway.app/api
```

### Paso 4: Redesplegar

```bash
# Commit cambios
git add .
git commit -m "Configuración de producción"
git push origin main
```

Ambos servicios se redesplegarán automáticamente.

### Paso 5: Pruebas

1. **Accede a tu frontend**: `https://sistema-gestion.pages.dev`
2. **Verifica la API**: `https://tu-app.up.railway.app/docs`
3. **Prueba el login** con las credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 🔄 Mantenimiento y Actualizaciones

### Actualizar la Aplicación

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Tanto Railway como Cloudflare Pages se actualizarán automáticamente.

### Backups de Base de Datos

Railway hace backups automáticos, pero puedes hacer backups manuales:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Hacer backup
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Monitoreo

- **Railway**: Dashboard → Metrics (CPU, RAM, requests)
- **Cloudflare**: Analytics → Web Analytics

---

## 🐛 Solución de Problemas

### Error: "Database connection failed"

```bash
# Verificar que PostgreSQL esté corriendo en Railway
# Verificar DATABASE_URL en variables de entorno
# Verificar que psycopg2-binary esté en requirements.txt
```

### Error: "CORS policy blocked"

```bash
# Verificar que FRONTEND_URL esté configurada en Railway
# Verificar allowed_origins en main.py
# Redesplegar backend
```

### Error: "API calls failing"

```bash
# Verificar VITE_API_URL en Cloudflare Pages
# Verificar que la URL del backend sea correcta
# Verificar logs en Railway: railway logs
```

### Frontend no carga

```bash
# Verificar build en Cloudflare Pages
# Ver logs de build
# Verificar que dist/ se generó correctamente
```

### Datos no aparecen

```bash
# Verificar que la migración se completó
# Ejecutar init_db_final.py en Railway:
railway run python backend/init_db_final.py
```

---

## 📊 Monitoreo de Costos

### Railway

- **Gratis**: 500 horas/mes + $5 crédito
- **Pro**: $20/mes (uso ilimitado)

Monitorea tu uso en: https://railway.app/account/usage

### Cloudflare Pages

- **Gratis**: Builds ilimitados, 500 builds/mes
- **Pro**: $20/mes (más builds concurrentes)

---

## 🎯 Próximos Pasos

1. ✅ **Dominio personalizado**: Conecta tu propio dominio
2. ✅ **SSL/HTTPS**: Ya incluido automáticamente
3. ✅ **Monitoreo**: Configura alertas en Railway
4. ✅ **Backups**: Programa backups automáticos
5. ✅ **CI/CD**: Ya configurado con GitHub

---

## 📞 Soporte

- **Railway**: https://railway.app/help
- **Cloudflare**: https://developers.cloudflare.com/pages
- **Documentación FastAPI**: https://fastapi.tiangolo.com
- **Documentación React**: https://react.dev

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Backend desplegado en Railway
- [ ] PostgreSQL configurado
- [ ] Datos migrados/inicializados
- [ ] Frontend desplegado en Cloudflare Pages
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Login funciona
- [ ] Dashboard carga datos
- [ ] Todas las funcionalidades probadas

---

**🎉 ¡Felicidades! Tu sistema está en producción y accesible desde cualquier lugar del mundo.**

**URL de acceso**: `https://sistema-gestion.pages.dev`
**API Docs**: `https://tu-app.up.railway.app/docs`

---

*Última actualización: 2024*
