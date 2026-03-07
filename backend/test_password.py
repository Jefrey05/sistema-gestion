"""
Script para probar el hash de contraseñas
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from app.auth import get_password_hash, verify_password

def test_password():
    print("=" * 60)
    print("🔐 Test de Hash de Contraseñas")
    print("=" * 60)
    
    # Contraseña de prueba
    password = "Test123!"
    
    print(f"\n1️⃣ Contraseña original: {password}")
    
    # Generar hash
    hashed = get_password_hash(password)
    print(f"\n2️⃣ Hash generado:")
    print(f"   {hashed}")
    
    # Verificar contraseña correcta
    is_valid = verify_password(password, hashed)
    print(f"\n3️⃣ Verificación con contraseña correcta: {'✅ VÁLIDA' if is_valid else '❌ INVÁLIDA'}")
    
    # Verificar contraseña incorrecta
    is_invalid = verify_password("WrongPassword", hashed)
    print(f"\n4️⃣ Verificación con contraseña incorrecta: {'❌ VÁLIDA (ERROR!)' if is_invalid else '✅ INVÁLIDA (Correcto)'}")
    
    print("\n" + "=" * 60)
    
    if is_valid and not is_invalid:
        print("✅ Sistema de contraseñas funcionando correctamente")
    else:
        print("❌ ERROR: Sistema de contraseñas tiene problemas")
    
    print("=" * 60)

if __name__ == "__main__":
    test_password()
