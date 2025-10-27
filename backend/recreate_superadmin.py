"""
Script para recrear el usuario Super Admin
Ejecutar con: python recreate_superadmin.py
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def recreate_superadmin():
    db = SessionLocal()
    
    try:
        # Verificar si ya existe
        existing = db.query(User).filter(User.email == "superadmin@sistema.com").first()
        
        if existing:
            print("⚠️  El usuario Super Admin ya existe.")
            print(f"   Email: {existing.email}")
            print(f"   Username: {existing.username}")
            print(f"   Role: {existing.role}")
            
            # Preguntar si quiere resetear la contraseña
            response = input("\n¿Deseas resetear la contraseña? (s/n): ")
            if response.lower() == 's':
                existing.hashed_password = get_password_hash("SuperAdmin2025!")
                existing.is_active = True
                existing.role = "super_admin"
                existing.organization_id = None
                db.commit()
                print("\n✅ Contraseña reseteada exitosamente!")
                print("   Email: superadmin@sistema.com")
                print("   Contraseña: SuperAdmin2025!")
            else:
                print("\n❌ Operación cancelada.")
            return
        
        # Crear nuevo super admin
        superadmin = User(
            email="superadmin@sistema.com",
            username="superadmin",
            full_name="Super Administrador",
            hashed_password=get_password_hash("SuperAdmin2025!"),
            role="super_admin",
            is_active=True,
            organization_id=None,
            phone=""
        )
        
        db.add(superadmin)
        db.commit()
        db.refresh(superadmin)
        
        print("\n✅ Super Admin creado exitosamente!")
        print("\n📋 Credenciales:")
        print("   Email: superadmin@sistema.com")
        print("   Username: superadmin")
        print("   Contraseña: SuperAdmin2025!")
        print("\n⚠️  Guarda estas credenciales en un lugar seguro.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Script de Recuperación de Super Admin")
    print("=" * 60)
    recreate_superadmin()
    print("=" * 60)
