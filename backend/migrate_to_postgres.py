"""
Script para migrar datos de SQLite a PostgreSQL
Uso: python migrate_to_postgres.py
"""
import os
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Agregar el directorio app al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models_extended import (
    Base, User, Client, Category, Supplier, Product, 
    Quotation, QuotationItem, Sale, SaleItem, SalePayment,
    Rental, RentalPayment, InventoryMovement
)
from app.models_organization import Organization

# URLs de base de datos
SQLITE_URL = "sqlite:///./inventory.db"
POSTGRES_URL = os.getenv("DATABASE_URL")

if not POSTGRES_URL:
    print("❌ Error: La variable de entorno DATABASE_URL no está configurada")
    print("💡 Configúrala con: export DATABASE_URL='postgresql://user:password@host:5432/database'")
    sys.exit(1)

# Crear engines
print(f"📂 Conectando a SQLite: {SQLITE_URL}")
sqlite_engine = create_engine(SQLITE_URL)

print(f"🐘 Conectando a PostgreSQL...")
postgres_engine = create_engine(POSTGRES_URL)

# Crear sesiones
SqliteSession = sessionmaker(bind=sqlite_engine)
PostgresSession = sessionmaker(bind=postgres_engine)

def table_exists(engine, table_name):
    """Verifica si una tabla existe en la base de datos"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def migrate_data():
    """Migra todos los datos de SQLite a PostgreSQL"""
    
    print("\n" + "="*70)
    print("🔄 INICIANDO MIGRACIÓN DE DATOS")
    print("="*70 + "\n")
    
    # Verificar que SQLite existe
    if not os.path.exists("inventory.db"):
        print("❌ Error: No se encontró el archivo inventory.db")
        print("💡 Asegúrate de estar en el directorio backend/")
        sys.exit(1)
    
    # Crear tablas en PostgreSQL
    print("📋 Creando tablas en PostgreSQL...")
    Base.metadata.create_all(bind=postgres_engine)
    print("✅ Tablas creadas\n")
    
    sqlite_db = SqliteSession()
    postgres_db = PostgresSession()
    
    try:
        # Lista de modelos a migrar (en orden de dependencias)
        models = [
            ("organizations", Organization),
            ("users", User),
            ("categories", Category),
            ("suppliers", Supplier),
            ("clients", Client),
            ("products", Product),
            ("quotations", Quotation),
            ("quotation_items", QuotationItem),
            ("sales", Sale),
            ("sale_items", SaleItem),
            ("sale_payments", SalePayment),
            ("rentals", Rental),
            ("rental_payments", RentalPayment),
            ("inventory_movements", InventoryMovement),
        ]
        
        total_migrated = 0
        
        for table_name, model in models:
            print(f"📦 Migrando tabla: {table_name}...")
            
            # Verificar si la tabla existe en SQLite
            if not table_exists(sqlite_engine, table_name):
                print(f"   ⚠️  Tabla {table_name} no existe en SQLite, saltando...")
                continue
            
            # Obtener datos de SQLite
            try:
                records = sqlite_db.query(model).all()
            except Exception as e:
                print(f"   ⚠️  Error al leer {table_name}: {e}")
                continue
            
            if not records:
                print(f"   ℹ️  No hay datos en {table_name}")
                continue
            
            # Insertar en PostgreSQL
            migrated_count = 0
            for record in records:
                try:
                    # Crear diccionario con los datos
                    data = {}
                    for column in model.__table__.columns:
                        data[column.name] = getattr(record, column.name)
                    
                    # Crear nuevo objeto
                    new_record = model(**data)
                    postgres_db.add(new_record)
                    migrated_count += 1
                    
                except Exception as e:
                    print(f"   ⚠️  Error al migrar registro: {e}")
                    continue
            
            # Commit después de cada tabla
            try:
                postgres_db.commit()
                print(f"   ✅ {migrated_count} registros migrados")
                total_migrated += migrated_count
            except Exception as e:
                print(f"   ❌ Error al hacer commit: {e}")
                postgres_db.rollback()
        
        print("\n" + "="*70)
        print(f"✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print(f"📊 Total de registros migrados: {total_migrated}")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        postgres_db.rollback()
        raise
    finally:
        sqlite_db.close()
        postgres_db.close()

def verify_migration():
    """Verifica que los datos se migraron correctamente"""
    print("\n🔍 Verificando migración...")
    
    postgres_db = PostgresSession()
    
    try:
        models = [
            ("Organizaciones", Organization),
            ("Usuarios", User),
            ("Categorías", Category),
            ("Proveedores", Supplier),
            ("Clientes", Client),
            ("Productos", Product),
            ("Cotizaciones", Quotation),
            ("Ventas", Sale),
            ("Alquileres", Rental),
            ("Movimientos", InventoryMovement),
        ]
        
        print("\n📊 Resumen de datos en PostgreSQL:")
        print("-" * 50)
        
        for name, model in models:
            try:
                count = postgres_db.query(model).count()
                print(f"   {name}: {count} registros")
            except Exception as e:
                print(f"   {name}: Error al contar - {e}")
        
        print("-" * 50)
        
    finally:
        postgres_db.close()

if __name__ == "__main__":
    print("\n🚀 Script de Migración SQLite → PostgreSQL")
    print("="*70)
    
    try:
        migrate_data()
        verify_migration()
        
        print("\n✅ Proceso completado exitosamente!")
        print("💡 Ahora puedes desplegar tu aplicación en Railway")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Migración cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        sys.exit(1)
