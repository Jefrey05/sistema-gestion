"""
Script para inicializar la base de datos PostgreSQL en producción
Uso: railway run python backend/init_db_postgres.py
"""
import os
import sys

# Agregar el directorio app al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models_extended import (
    User, Client, Category, Supplier, Product, 
    Quotation, QuotationItem, Sale, SaleItem, Rental, InventoryMovement
)
from app.models_organization import Organization
from app.auth import get_password_hash
from datetime import datetime, timedelta
import random

def init_database():
    """Crea las tablas y datos iniciales en PostgreSQL"""
    print("\n" + "="*70)
    print("🔧 INICIALIZANDO BASE DE DATOS POSTGRESQL")
    print("="*70 + "\n")
    
    print("📋 Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas\n")
    
    db = SessionLocal()
    
    try:
        # Verificar si ya existen datos
        existing_user = db.query(User).first()
        if existing_user:
            print("⚠️  La base de datos ya contiene datos.")
            response = input("¿Deseas agregar datos de ejemplo de todas formas? (s/n): ")
            if response.lower() != 's':
                print("❌ Operación cancelada")
                return
        
        print("🏢 Creando organización por defecto...")
        # Crear organización por defecto
        default_org = Organization(
            name="Mi Empresa",
            slug="mi-empresa",
            email="admin@miempresa.com",
            phone="809-555-0000",
            is_active=True,
            subscription_plan="free",
            max_users=10
        )
        db.add(default_org)
        db.commit()
        print(f"✅ Organización creada: {default_org.name} (ID: {default_org.id})\n")
        
        print("👤 Creando usuarios...")
        # Crear usuarios con diferentes roles
        users = [
            User(
                email="admin@empresa.com",
                username="admin",
                full_name="Administrador del Sistema",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
                phone="809-555-0001",
                organization_id=default_org.id
            ),
            User(
                email="vendedor@empresa.com",
                username="vendedor",
                full_name="Juan Pérez - Vendedor",
                hashed_password=get_password_hash("vendedor123"),
                role="vendedor",
                is_active=True,
                phone="809-555-0002",
                organization_id=default_org.id
            ),
            User(
                email="almacen@empresa.com",
                username="almacen",
                full_name="María García - Almacén",
                hashed_password=get_password_hash("almacen123"),
                role="almacen",
                is_active=True,
                phone="809-555-0003",
                organization_id=default_org.id
            ),
        ]
        for user in users:
            db.add(user)
        db.commit()
        print(f"✅ {len(users)} usuarios creados\n")
        
        print("📁 Creando categorías...")
        categories = [
            Category(name="Equipos Quirúrgicos", description="Equipos médicos para cirugías", organization_id=default_org.id),
            Category(name="Instrumental Médico", description="Instrumentos médicos diversos", organization_id=default_org.id),
            Category(name="Equipos de Diagnóstico", description="Equipos para diagnóstico médico", organization_id=default_org.id),
            Category(name="Consumibles", description="Productos de un solo uso", organization_id=default_org.id),
            Category(name="Mobiliario Médico", description="Muebles y mobiliario para hospitales", organization_id=default_org.id),
        ]
        for cat in categories:
            db.add(cat)
        db.commit()
        print(f"✅ {len(categories)} categorías creadas\n")
        
        print("🚚 Creando proveedores...")
        suppliers = [
            Supplier(
                name="MedEquip Internacional",
                contact_name="Roberto Silva",
                email="ventas@medequip.com",
                phone="809-555-2001",
                address="Zona Industrial, Santo Domingo",
                rnc="101-55555-5",
                payment_terms="30 días",
                organization_id=default_org.id
            ),
            Supplier(
                name="Suministros Médicos RD",
                contact_name="Laura Pérez",
                email="info@suministrosmedicos.com",
                phone="809-555-2002",
                address="Av. 27 de Febrero, Santo Domingo",
                rnc="101-66666-6",
                payment_terms="15 días",
                organization_id=default_org.id
            ),
        ]
        for supplier in suppliers:
            db.add(supplier)
        db.commit()
        print(f"✅ {len(suppliers)} proveedores creados\n")
        
        print("👥 Creando clientes...")
        clients = [
            Client(
                name="Hospital General",
                client_type="hospital",
                status="activo",
                rnc="101-12345-6",
                email="compras@hospitalgeneral.com",
                phone="809-555-1001",
                address="Av. Principal #123",
                city="Santo Domingo",
                contact_person="Dr. Carlos Rodríguez",
                credit_limit=50000,
                credit_days=30,
                is_recurrent=True,
                organization_id=default_org.id
            ),
            Client(
                name="Dr. Ana Martínez",
                client_type="medico",
                status="activo",
                rnc="001-23456-7",
                email="ana.martinez@email.com",
                phone="809-555-1002",
                mobile="829-555-1002",
                address="Consultorio Médico, Calle 5 #45",
                city="Santiago",
                is_recurrent=True,
                organization_id=default_org.id
            ),
            Client(
                name="Clínica Santa María",
                client_type="empresa",
                status="activo",
                rnc="101-34567-8",
                email="admin@clinicasantamaria.com",
                phone="809-555-1003",
                address="Av. Independencia #789",
                city="Santo Domingo",
                contact_person="Lic. Pedro Gómez",
                credit_limit=30000,
                credit_days=15,
                is_recurrent=True,
                organization_id=default_org.id
            ),
        ]
        for client in clients:
            db.add(client)
        db.commit()
        print(f"✅ {len(clients)} clientes creados\n")
        
        print("📦 Creando productos...")
        products = [
            Product(
                sku="EQ-001",
                name="Monitor de Signos Vitales",
                description="Monitor multiparamétrico para signos vitales",
                product_type="ambos",
                category_id=1,
                supplier_id=1,
                price=15000,
                rental_price_daily=500,
                rental_price_weekly=3000,
                rental_price_monthly=10000,
                cost=12000,
                stock=5,
                stock_available=3,
                min_stock=2,
                location="Almacén A-1",
                warranty_months=24,
                is_active=True,
                organization_id=default_org.id
            ),
            Product(
                sku="EQ-002",
                name="Desfibrilador Portátil",
                description="Desfibrilador automático externo (DEA)",
                product_type="venta",
                category_id=1,
                supplier_id=1,
                price=25000,
                cost=20000,
                stock=3,
                stock_available=3,
                min_stock=1,
                location="Almacén A-2",
                warranty_months=36,
                is_active=True,
                organization_id=default_org.id
            ),
            Product(
                sku="INS-001",
                name="Set de Instrumental Quirúrgico",
                description="Set completo de 25 piezas para cirugía general",
                product_type="venta",
                category_id=2,
                supplier_id=2,
                price=8500,
                cost=6500,
                stock=10,
                stock_available=10,
                min_stock=3,
                location="Almacén B-1",
                warranty_months=12,
                is_active=True,
                organization_id=default_org.id
            ),
            Product(
                sku="EQ-003",
                name="Cama Hospitalaria Eléctrica",
                description="Cama eléctrica de 3 posiciones con barandas",
                product_type="alquiler",
                category_id=5,
                supplier_id=1,
                price=35000,
                rental_price_daily=300,
                rental_price_weekly=1800,
                rental_price_monthly=6000,
                cost=28000,
                stock=8,
                stock_available=6,
                min_stock=2,
                location="Almacén C-1",
                warranty_months=24,
                is_active=True,
                organization_id=default_org.id
            ),
        ]
        for product in products:
            db.add(product)
        db.commit()
        print(f"✅ {len(products)} productos creados\n")
        
        print("\n" + "="*70)
        print("✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE")
        print("="*70)
        print("\n📊 RESUMEN:")
        print(f"   🏢 Organización: {default_org.name}")
        print(f"   👤 Usuarios: {len(users)}")
        print(f"   👥 Clientes: {len(clients)}")
        print(f"   📁 Categorías: {len(categories)}")
        print(f"   🚚 Proveedores: {len(suppliers)}")
        print(f"   📦 Productos: {len(products)}")
        print("\n🔑 CREDENCIALES DE ACCESO:")
        print("   Usuario: admin")
        print("   Contraseña: admin123")
        print("\n🚀 El sistema está listo para usar!")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error al inicializar la base de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        init_database()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        sys.exit(1)
