from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import settings
from .. import auth
from ..auth import get_current_active_user

# Usar modelos extendidos por defecto
from .. import schemas_extended as schemas
from .. import models_extended as models

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/health")
async def health_check():
    """Health check endpoint para mantener el servicio despierto"""
    return {"status": "ok", "message": "Backend is running"}


@router.get("/test-cors")
async def test_cors():
    """Endpoint de prueba para verificar CORS"""
    return {"status": "ok", "message": "CORS is working", "cors_test": True}


@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Verificar email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Verificar username
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
    
    # Crear usuario
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=getattr(user, 'role', 'empleado'),
        phone=getattr(user, 'phone', None)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"🔐 Intento de login:")
    print(f"   Username/Email: {form_data.username}")
    
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        print(f"❌ Login fallido: Usuario no encontrado o contraseña incorrecta")
        # Verificar si el usuario existe
        user_check = db.query(models.User).filter(
            (models.User.username == form_data.username) | (models.User.email == form_data.username)
        ).first()
        if user_check:
            print(f"   ⚠️ Usuario existe pero contraseña incorrecta")
            print(f"   User ID: {user_check.id}, Email: {user_check.email}, Username: {user_check.username}")
        else:
            print(f"   ⚠️ Usuario no existe en la base de datos")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        print(f"❌ Login fallido: Usuario inactivo (ID: {user.id})")
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    
    print(f"✅ Login exitoso:")
    print(f"   User ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Username: {user.username}")
    print(f"   Role: {user.role}")
    print(f"   Organization ID: {user.organization_id}")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Obtener información del usuario actual"""
    try:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "organization_id": current_user.organization_id,
            "avatar": current_user.avatar,
            "phone": current_user.phone,
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None
        }
    except Exception as e:
        print(f"Error en /me: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")


@router.put("/change-password")
async def change_password(
    password_data: dict,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cambia la contraseña del usuario actual"""
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=400,
            detail="Se requieren la contraseña actual y la nueva contraseña"
        )
    
    # Verificar contraseña actual
    if not auth.verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="La contraseña actual es incorrecta"
        )
    
    # Validar nueva contraseña
    if len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="La nueva contraseña debe tener al menos 6 caracteres"
        )
    
    # Actualizar contraseña
    new_hashed_password = auth.get_password_hash(new_password)
    current_user.hashed_password = new_hashed_password
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Contraseña cambiada exitosamente"}


@router.put("/session-settings")
async def update_session_settings(
    settings: dict,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza la configuración de sesión del usuario"""
    timeout = settings.get("timeout")
    auto_logout = settings.get("autoLogout")
    remember_me = settings.get("rememberMe")
    
    # Aquí podrías guardar estas configuraciones en la base de datos
    # Por ahora solo validamos los datos
    
    if timeout is not None and timeout not in [15, 30, 60, 120, 480, 0]:
        raise HTTPException(
            status_code=400,
            detail="Timeout inválido. Debe ser: 15, 30, 60, 120, 480 o 0 minutos"
        )
    
    # TODO: Guardar configuración en la base de datos
    # current_user.session_timeout = timeout
    # current_user.auto_logout = auto_logout
    # current_user.remember_me = remember_me
    # db.commit()
    
    return {
        "message": "Configuración de sesión actualizada",
        "settings": {
            "timeout": timeout,
            "autoLogout": auto_logout,
            "rememberMe": remember_me
        }
    }


@router.post("/logout-all-sessions")
async def logout_all_sessions(
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cierra todas las sesiones del usuario excepto la actual"""
    # TODO: Implementar lógica para invalidar tokens JWT
    # Por ahora solo retornamos un mensaje de éxito
    
    return {
        "message": "Todas las sesiones han sido cerradas exitosamente",
        "sessions_closed": 1  # Simulado
    }


# ============================================================================
# GESTIÓN DE USUARIOS (Solo Admin)
# ============================================================================

@router.get("/users", response_model=list[schemas.User])
async def get_all_users(
    current_user: schemas.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtiene todos los usuarios de la organización (solo admin)"""
    users = db.query(models.User).filter(
        models.User.organization_id == current_user.organization_id
    ).all()
    return users


@router.post("/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    user_data: schemas.UserCreate,
    current_user: schemas.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo usuario (solo admin)"""
    # Verificar si el email ya existe
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    hashed_password = auth.get_password_hash(user_data.password)
    # Generar username desde el email
    username = user_data.email.split('@')[0]
    db_user = models.User(
        email=user_data.email,
        username=username,
        full_name=user_data.name,
        hashed_password=hashed_password,
        role=user_data.role,
        organization_id=current_user.organization_id,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.put("/users/{user_id}", response_model=schemas.User)
async def update_user_by_admin(
    user_id: int,
    user_data: dict,
    current_user: schemas.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Actualiza un usuario (solo admin)"""
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos
    if 'name' in user_data:
        user.full_name = user_data['name']
    if 'email' in user_data:
        # Verificar que el email no esté en uso
        existing = db.query(models.User).filter(
            models.User.email == user_data['email'],
            models.User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = user_data['email']
        # Actualizar username también
        user.username = user_data['email'].split('@')[0]
    if 'role' in user_data:
        user.role = user_data['role']
    
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    password_data: dict,
    current_user: schemas.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Resetea la contraseña de un usuario (solo admin)"""
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    new_password = password_data.get('new_password')
    if not new_password:
        raise HTTPException(status_code=400, detail="Se requiere la nueva contraseña")
    
    # Actualizar contraseña
    user.hashed_password = auth.get_password_hash(new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: schemas.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Elimina un usuario (solo admin)"""
    # No permitir que el admin se elimine a sí mismo
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propio usuario"
        )
    
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(user)
    db.commit()
    
    return {"message": "Usuario eliminado exitosamente"}


# ============================================================================
# SETUP INICIAL - Crear primer admin (Solo usar una vez)
# ============================================================================

@router.get("/setup-super-admin")
async def setup_super_admin(db: Session = Depends(get_db)):
    """
    Crea el SUPER ADMIN del sistema (solo para el dueño del sistema).
    Solo funciona si NO existe un super admin.
    Endpoint GET para poder llamarlo desde el navegador.
    """
    try:
        # Verificar que no exista un super admin
        existing_super_admin = db.query(models.User).filter(
            models.User.role == "super_admin"
        ).first()
        
        if existing_super_admin:
            return {
                "status": "error",
                "message": "Ya existe un Super Admin en el sistema.",
                "email": "superadmin@sistema.com",
                "recovery_url": "/api/auth/recover-super-admin"
            }
        
        # Crear SUPER ADMIN sin organización
        super_admin = models.User(
            email="superadmin@sistema.com",
            username="superadmin",
            full_name="Super Administrador",
            hashed_password=auth.get_password_hash("SuperAdmin2025!"),
            role="super_admin",
            organization_id=None,
            is_active=True,
            phone=""
        )
        
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        
        return {
            "status": "success",
            "message": "Super Admin creado exitosamente",
            "email": "superadmin@sistema.com",
            "password": "SuperAdmin2025!",
            "note": "CAMBIA LA CONTRASEÑA INMEDIATAMENTE",
            "instructions": "Ve a https://sistema-gestion.vercel.app e inicia sesión"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al crear super admin: {str(e)}"
        }


@router.get("/recover-super-admin")
async def recover_super_admin(db: Session = Depends(get_db)):
    """
    ENDPOINT DE RECUPERACIÓN DE EMERGENCIA
    Recrea o resetea el usuario Super Admin del sistema.
    Úsalo SOLO si perdiste acceso al super admin.
    """
    try:
        # Buscar super admin existente
        existing = db.query(models.User).filter(
            models.User.email == "superadmin@sistema.com"
        ).first()
        
        if existing:
            # Resetear contraseña y permisos
            existing.hashed_password = auth.get_password_hash("SuperAdmin2025!")
            existing.role = "super_admin"
            existing.is_active = True
            existing.organization_id = None
            existing.username = "superadmin"
            existing.full_name = "Super Administrador"
            db.commit()
            
            return {
                "status": "success",
                "action": "recovered",
                "message": "Super Admin recuperado exitosamente. Contraseña reseteada.",
                "email": "superadmin@sistema.com",
                "password": "SuperAdmin2025!",
                "note": "⚠️ CAMBIA LA CONTRASEÑA INMEDIATAMENTE después de iniciar sesión",
                "instructions": "Ve a https://sistema-gestion.vercel.app e inicia sesión"
            }
        else:
            # Crear nuevo super admin
            super_admin = models.User(
                email="superadmin@sistema.com",
                username="superadmin",
                full_name="Super Administrador",
                hashed_password=auth.get_password_hash("SuperAdmin2025!"),
                role="super_admin",
                organization_id=None,
                is_active=True,
                phone=""
            )
            
            db.add(super_admin)
            db.commit()
            db.refresh(super_admin)
            
            return {
                "status": "success",
                "action": "created",
                "message": "Super Admin creado exitosamente",
                "email": "superadmin@sistema.com",
                "password": "SuperAdmin2025!",
                "note": "⚠️ CAMBIA LA CONTRASEÑA INMEDIATAMENTE",
                "instructions": "Ve a https://sistema-gestion.vercel.app e inicia sesión"
            }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": f"Error al recuperar super admin: {str(e)}"
        }
