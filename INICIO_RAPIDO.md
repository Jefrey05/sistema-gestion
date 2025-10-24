# 🚀 Guía de Inicio Rápido - Despliegue en Producción

## Resumen Ejecutivo

Despliega tu Sistema de Gestión Empresarial SaaS en **menos de 30 minutos** de forma **GRATUITA**.

---

## ⚡ Pasos Rápidos

### 1️⃣ Preparar Código (5 minutos)

```bash
# Navegar al proyecto
cd "g:\Nueva carpeta (4)\Nueva carpeta45"

# Inicializar Git
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/TU_USUARIO/sistema-gestion.git
git branch -M main
git push -u origin main
```

### 2️⃣ Desplegar Backend en Railway (10 minutos)

1. **Ir a**: https://railway.app
2. **Crear cuenta** y vincular con GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Seleccionar tu repositorio
5. **Add PostgreSQL** database
6. **Configurar variables de entorno**:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=genera_una_clave_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://tu-app.pages.dev
```

7. **Generate Domain** en Settings → Networking
8. Copiar URL (ej: `https://tu-app.up.railway.app`)

### 3️⃣ Inicializar Datos (2 minutos)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y conectar
railway login
railway link

# Inicializar base de datos
railway run python backend/init_db_postgres.py
```

### 4️⃣ Desplegar Frontend en Cloudflare (10 minutos)

1. **Actualizar** `frontend/.env.production`:
```bash
VITE_API_URL=https://tu-app.up.railway.app/api
```

2. **Commit y push**:
```bash
git add .
git commit -m "Configurar URL de producción"
git push origin main
```

3. **Ir a**: https://dash.cloudflare.com
4. **Workers & Pages** → **Create application** → **Pages**
5. **Connect to Git** → Seleccionar repositorio
6. **Configurar build**:
   - Framework: `Vite`
   - Build command: `cd frontend && npm install && npm run build`
   - Build output: `frontend/dist`
   - Root directory: `/`

7. **Variables de entorno**:
```bash
VITE_API_URL=https://tu-app.up.railway.app/api
```

8. **Save and Deploy**

### 5️⃣ Configurar CORS (3 minutos)

1. En Railway, actualizar variable:
```bash
FRONTEND_URL=https://tu-app.pages.dev
```

2. Railway redesplegarán automáticamente

---

## ✅ Verificación

1. **Frontend**: https://tu-app.pages.dev
2. **Backend API**: https://tu-app.up.railway.app/docs
3. **Login**:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 📋 Checklist

- [ ] Código en GitHub
- [ ] Backend en Railway
- [ ] PostgreSQL configurado
- [ ] Datos inicializados
- [ ] Frontend en Cloudflare
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Login funciona ✅

---

## 🆘 Problemas Comunes

### Backend no inicia
```bash
# Ver logs
railway logs

# Verificar que requirements.txt incluya gunicorn
```

### Frontend no conecta al backend
```bash
# Verificar VITE_API_URL en Cloudflare Pages
# Verificar CORS en Railway (FRONTEND_URL)
```

### Base de datos vacía
```bash
# Ejecutar inicialización
railway run python backend/init_db_postgres.py
```

---

## 💰 Costos

- **Frontend**: $0 (Cloudflare Pages - Gratis)
- **Backend + DB**: $0-5/mes (Railway - 500 horas gratis)
- **Total**: **$0 inicialmente**

---

## 📚 Documentación Completa

Ver: [DESPLIEGUE_PRODUCCION.md](./DESPLIEGUE_PRODUCCION.md)

---

## 🎉 ¡Listo!

Tu sistema está en producción y accesible desde cualquier lugar del mundo.

**URL de acceso**: `https://tu-app.pages.dev`
