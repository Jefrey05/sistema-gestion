# 🆓 Guía de Despliegue COMPLETAMENTE GRATIS

## Sistema de Gestión Empresarial SaaS - Sin Pagar Nada

Esta guía te mostrará cómo desplegar tu sistema **100% GRATIS** usando solo servicios con planes gratuitos permanentes.

---

## 💰 Costo Total: $0 (GRATIS PARA SIEMPRE)

---

## 🏗️ Arquitectura Gratuita

```
┌─────────────────────────────────────────────────────────────┐
│              VERCEL (Frontend) - GRATIS                     │
│              - React + Vite                                 │
│              - HTTPS automático                             │
│              - Despliegues ilimitados desde GitHub          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              RENDER (Backend) - GRATIS                      │
│              - FastAPI + Uvicorn                            │
│              - Auto-deploy desde GitHub                     │
│              - (UptimeRobot para mantener despierto)        │
└─────────────────────────────────────────────────────────────┘
                 │                            │
                 ▼                            ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     NEON DB (Gratis)      │   │   CLOUDINARY (Gratis)     │
│   - PostgreSQL 512MB      │   │   - Almacenamiento img    │
│   - Serverless rápido     │   │   - CDN optimizado        │
└───────────────────────────┘   └───────────────────────────┘
```

### Stack Exacto Utilizado:

**Opción 1 (Actual y Recomendada):**
- Control de Versiones: **Git + GitHub**
- Frontend: **Vercel** (gratis para siempre)
- Backend: **Render** (750 horas/mes gratis)
- Base de datos: **Neon DB** (PostgreSQL Serverless, 512MB gratis)
- Imágenes: **Cloudinary** (gratis)
- Keep-Alive: **UptimeRobot** (para mantener a Render despierto)

---

## 🚀 Despliegue Paso a Paso (Opción 1 - Recomendada)

### Paso 1: Preparar el Código

```bash
cd "g:\Nueva carpeta (4)\Nueva carpeta45"

# Inicializar Git
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub (gratis)
# Ir a: https://github.com/new
# Crear repositorio público (gratis ilimitado)

# Subir código
git remote add origin https://github.com/TU_USUARIO/sistema-gestion.git
git branch -M main
git push -u origin main
```

---

### Paso 2: Base de Datos en Neon DB (GRATIS)

1. **Ir a**: https://neon.tech
2. **Crear cuenta gratis** (con GitHub)
3. **New Project**:
   - Name: `sistema-gestion`
   - Postgres version: (la más reciente recomendada)
   - Region: `US East` o la que prefieras
   - Plan: **Free** ✅

4. **Obtener credenciales**:
   - Ve al **Dashboard** de tu proyecto en Neon.
   - Copia el **Connection String**:
   ```
   postgresql://[USUARIO]:[PASSWORD]@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

5. **Guardar** esta URL, la necesitarás en Render.

---
### Paso 2.5: Imágenes en Cloudinary (GRATIS)
1. **Ir a**: https://cloudinary.com
2. Crear cuenta gratis.
3. Copiar las credenciales desde el Dashboard: `Cloud Name`, `API Key`, `API Secret`.
4. Las necesitarás también para las Variables de Entorno del backend.

---

### Paso 3: Backend en Render (GRATIS)

1. **Ir a**: https://render.com
2. **Crear cuenta gratis** (con GitHub)
3. **New** → **Web Service**
4. **Connect** tu repositorio de GitHub
5. **Configurar**:
   - Name: `sistema-gestion-api`
   - Region: `Oregon (US West)` (gratis)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - Plan: **Free** ✅

6. **Variables de Entorno** (Environment):
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SECRET_KEY=tu_clave_super_secreta_cambiar_esto_123456789
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   FRONTEND_URL=https://tu-app.vercel.app
   ```

7. **Create Web Service**

8. **Esperar 5-10 minutos** al primer deploy

9. **Copiar URL**: `https://sistema-gestion-api.onrender.com`

⚠️ **IMPORTANTE**: El plan gratuito de Render se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos en despertar.

---

### Paso 4: Inicializar Base de Datos

Necesitamos crear las tablas y datos iniciales:

#### Opción A: Desde tu computadora

```bash
# Instalar dependencias
cd backend
pip install -r requirements.txt

# Configurar URL de Supabase
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Windows (PowerShell):
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Inicializar base de datos
python init_db_postgres.py
```

#### Opción B: Desde Render Shell (más fácil)

1. En Render, ve a tu servicio
2. Click en **Shell** (en el menú superior)
3. Ejecutar:
```bash
python init_db_postgres.py
```

---

### Paso 5: Frontend en Vercel (GRATIS)

1. **Actualizar** `frontend/.env.production`:
```bash
VITE_API_URL=https://sistema-gestion-api.onrender.com/api
```

2. **Commit y push**:
```bash
git add .
git commit -m "Configurar URL de producción"
git push origin main
```

3. **Ir a**: https://vercel.com
4. **Crear cuenta gratis** (con GitHub)
5. **Add New** → **Project**
6. **Import** tu repositorio de GitHub
7. **Configurar**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

8. **Environment Variables**:
   ```bash
   VITE_API_URL=https://sistema-gestion-api.onrender.com/api
   ```

9. **Deploy**

10. **Copiar URL**: `https://tu-app.vercel.app`

---

### Paso 6: Actualizar CORS en Backend

1. En Render, ve a **Environment**
2. Actualizar variable:
   ```bash
   FRONTEND_URL=https://tu-app.vercel.app
   ```
3. **Save Changes** (se redespleará automáticamente)

---

## ✅ Verificación

1. **Frontend**: https://tu-app.vercel.app
2. **Backend**: https://sistema-gestion-api.onrender.com/docs
3. **Login**:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 📊 Límites de los Planes Gratuitos

### Vercel (Frontend)
- ✅ 100GB bandwidth/mes
- ✅ Despliegues ilimitados
- ✅ HTTPS automático
- ✅ Sin tarjeta de crédito requerida

### Render (Backend)
- ✅ 750 horas/mes (suficiente para 1 app 24/7)
- ✅ 512MB RAM
- ⚠️ Se duerme después de 15 min de inactividad
- ⚠️ Primer request tarda 30-60s en despertar
- ✅ Sin tarjeta de crédito requerida

### Supabase (Base de Datos)
- ✅ 500MB de almacenamiento
- ✅ 2GB de transferencia/mes
- ✅ Backups automáticos (7 días)
- ✅ Sin tarjeta de crédito requerida

---

## 🎯 Optimizaciones para Plan Gratuito

### Mantener Render Despierto (Opcional)

Crea un servicio gratuito de "ping" para mantener tu backend activo:

**Opción 1: UptimeRobot** (gratis)
1. Ir a: https://uptimerobot.com
2. Crear cuenta gratis
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://sistema-gestion-api.onrender.com/health`
   - Interval: 5 minutos

**Opción 2: Cron-job.org** (gratis)
1. Ir a: https://cron-job.org
2. Crear cuenta gratis
3. Create cronjob:
   - URL: `https://sistema-gestion-api.onrender.com/health`
   - Interval: Every 5 minutes

⚠️ **Nota**: Esto consumirá más de tus 750 horas mensuales, pero mantendrá tu app siempre rápida.

---

## 🔄 Alternativa: Todo en Render (Más Simple)

Si prefieres tener todo en un solo lugar:

### Frontend + Backend en Render

1. **Backend**: Como se explicó arriba
2. **Frontend**: 
   - New → Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Plan: **Free**

**Ventaja**: Todo en un lugar
**Desventaja**: Render Free para static sites es más limitado que Vercel

---

## 🆓 Alternativa: Netlify (También Gratis)

### Frontend en Netlify

1. **Ir a**: https://netlify.com
2. **Crear cuenta gratis** (con GitHub)
3. **Add new site** → **Import from Git**
4. Seleccionar repositorio
5. **Configurar**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. **Environment variables**:
   ```bash
   VITE_API_URL=https://sistema-gestion-api.onrender.com/api
   ```
7. **Deploy**

**Límites Netlify Free**:
- 100GB bandwidth/mes
- 300 build minutes/mes
- Despliegues ilimitados

---

## 🗄️ Alternativas de Base de Datos Gratuitas

### Opción 1: Supabase (Recomendada)
- ✅ 500MB almacenamiento
- ✅ Interface web incluida
- ✅ Backups automáticos
- URL: https://supabase.com

### Opción 2: Neon
- ✅ 512MB almacenamiento
- ✅ 1 proyecto gratis
- ✅ Serverless PostgreSQL
- URL: https://neon.tech

### Opción 3: ElephantSQL
- ⚠️ Solo 20MB (muy limitado)
- ✅ PostgreSQL completo
- URL: https://www.elephantsql.com

### Opción 4: Aiven
- ✅ 1GB almacenamiento
- ✅ PostgreSQL, MySQL, Redis
- ✅ 30 días gratis, luego $10/mes
- URL: https://aiven.io

---

## 📝 Archivos de Configuración para Render

Ya están creados en tu proyecto:
- ✅ `Procfile` (no necesario para Render, pero útil)
- ✅ `requirements.txt` actualizado
- ✅ `backend/app/config.py` con variables de entorno

---

## 🐛 Solución de Problemas

### Backend tarda mucho en responder
- **Causa**: Render Free se duerme después de 15 min
- **Solución**: Usar UptimeRobot para mantenerlo despierto

### Error de conexión a base de datos
```bash
# Verificar que DATABASE_URL sea correcta
# Formato: postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

### CORS Error
```bash
# Verificar FRONTEND_URL en Render
# Debe ser: https://tu-app.vercel.app (sin / al final)
```

### Build falla en Vercel
```bash
# Verificar que frontend/package.json tenga todas las dependencias
# Verificar que VITE_API_URL esté configurada
```

---

## 📊 Comparación de Opciones Gratuitas

| Servicio | Frontend | Backend | Base de Datos | Costo |
|----------|----------|---------|---------------|-------|
| **Opción 1** | Vercel | Render | Supabase | $0 |
| **Opción 2** | Netlify | Render | Neon | $0 |
| **Opción 3** | Cloudflare | Render | ElephantSQL | $0 |
| Railway | ❌ | ⚠️ $5/mes | Incluido | $5/mes |

---

## ✅ Checklist Final

- [ ] Código en GitHub (gratis)
- [ ] Base de datos en Supabase (gratis)
- [ ] Backend en Render (gratis)
- [ ] Datos inicializados
- [ ] Frontend en Vercel (gratis)
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Login funciona ✅
- [ ] **Costo total: $0** ✅

---

## 🎉 ¡Listo!

Tu sistema está en producción **COMPLETAMENTE GRATIS** y accesible desde cualquier lugar del mundo.

**URLs de acceso**:
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://sistema-gestion-api.onrender.com`
- API Docs: `https://sistema-gestion-api.onrender.com/docs`

**Credenciales**:
- Usuario: `admin`
- Contraseña: `admin123`

---

## 🔮 Próximos Pasos (Opcional)

1. **Dominio personalizado**: Vercel y Render permiten dominios custom gratis
2. **Monitoreo**: UptimeRobot para mantener el backend despierto
3. **Analytics**: Vercel Analytics (gratis)
4. **Backups**: Supabase hace backups automáticos

---

**💡 Tip**: Si tu proyecto crece y necesitas más recursos, puedes actualizar a planes pagos en cualquier momento. Pero para empezar y probar, ¡todo es gratis!

---

*Última actualización: 2024*
