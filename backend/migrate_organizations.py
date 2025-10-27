"""
Script de migración para actualizar organizaciones existentes
Ejecutar una sola vez para migrar de pending a active
"""
from app.database import SessionLocal
from app.models_organization import Organization

def migrate_organizations():
    db = SessionLocal()
    try:
        # Actualizar todas las organizaciones con status pending a active
        orgs = db.query(Organization).all()
        
        for org in orgs:
            # Si no tiene is_active, establecerlo en True
            if not hasattr(org, 'is_active') or org.is_active is None:
                org.is_active = True
            
            # Si tiene status pending, cambiarlo a active
            if org.status == 'pending':
                org.status = 'active'
            
            # Asegurar que tenga max_users
            if not org.max_users or org.max_users == 0:
                org.max_users = 1
        
        db.commit()
        print(f"✅ Migración completada. {len(orgs)} organizaciones actualizadas.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error en migración: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_organizations()
