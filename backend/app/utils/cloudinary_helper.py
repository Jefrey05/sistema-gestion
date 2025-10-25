"""
Utilidad para subir imágenes a Cloudinary
"""
import cloudinary
import cloudinary.uploader
from app.config import settings

# Configurar Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_image(file_content, folder="sistema-gestion", public_id=None):
    """
    Sube una imagen a Cloudinary
    
    Args:
        file_content: Contenido del archivo (bytes)
        folder: Carpeta en Cloudinary donde guardar la imagen
        public_id: ID público de la imagen (opcional)
    
    Returns:
        URL de la imagen subida o None si hay error
    """
    try:
        # Subir imagen a Cloudinary
        result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            public_id=public_id,
            overwrite=True,
            resource_type="image"
        )
        
        # Retornar URL segura
        return result.get('secure_url')
    
    except Exception as e:
        print(f"Error al subir imagen a Cloudinary: {e}")
        return None

def delete_image(public_id):
    """
    Elimina una imagen de Cloudinary
    
    Args:
        public_id: ID público de la imagen a eliminar
    
    Returns:
        True si se eliminó correctamente, False si hubo error
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error al eliminar imagen de Cloudinary: {e}")
        return False
