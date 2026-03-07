"""
Utilidad para generar slugs únicos para organizaciones
"""
import re
from sqlalchemy.orm import Session
from ..models_organization import Organization


def slugify(text: str) -> str:
    """
    Convierte un texto en un slug válido
    """
    # Convertir a minúsculas
    text = text.lower()
    
    # Reemplazar espacios y caracteres especiales con guiones
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    
    # Eliminar guiones al inicio y final
    text = text.strip('-')
    
    return text


def generate_unique_slug(db: Session, name: str, max_length: int = 50) -> str:
    """
    Genera un slug único para una organización
    Si el slug ya existe, agrega un número al final
    """
    base_slug = slugify(name)[:max_length]
    slug = base_slug
    counter = 1
    
    # Verificar si el slug ya existe
    while db.query(Organization).filter(Organization.slug == slug).first():
        # Agregar número al final
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug
