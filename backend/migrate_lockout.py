import os
from sqlalchemy import text
import sys

# Añadir el directorio actual al path para que pueda importar 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def add_lockout_columns():
    with engine.connect() as conn:
        try:
            # Añadir failed_login_attempts
            print("Añadiendo columna 'failed_login_attempts' a la tabla 'users'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;"))
            print("OK")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicada" in str(e).lower():
                print("La columna 'failed_login_attempts' ya existe.")
            else:
                print(f"Error: {e}")
                
        try:
            # Añadir locked_until
            print("Añadiendo columna 'locked_until' a la tabla 'users'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;"))
            print("OK")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicada" in str(e).lower():
                print("La columna 'locked_until' ya existe.")
            else:
                print(f"Error: {e}")

        conn.commit()
        print("¡Migración completada exitosamente!")

if __name__ == "__main__":
    add_lockout_columns()
