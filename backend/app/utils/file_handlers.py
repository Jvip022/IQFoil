# backend/app/utils/file_handlers.py
import os
import shutil
from werkzeug.utils import secure_filename
from flask import current_app
from .helpers import secure_filename_custom

ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'webm'
}

def allowed_file(filename: str, allowed_extensions: set = None) -> bool:
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_upload_file(file, subfolder: str = "", filename: str = None) -> str:
    """
    Guarda un archivo subido en el directorio de uploads.
    Retorna la ruta relativa guardada.
    """
    if not file or not file.filename:
        raise ValueError("No se proporcionó archivo")

    original_filename = filename or secure_filename_custom(file.filename)
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    target_dir = os.path.join(upload_folder, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    safe_name = secure_filename(original_filename)
    filepath = os.path.join(target_dir, safe_name)

    # Si ya existe, agregar un sufijo único
    counter = 1
    name, ext = os.path.splitext(safe_name)
    while os.path.exists(filepath):
        new_name = f"{name}_{counter}{ext}"
        filepath = os.path.join(target_dir, new_name)
        counter += 1

    file.save(filepath)
    return filepath

def delete_file(filepath: str) -> bool:
    """Elimina un archivo si existe"""
    if filepath and os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False

def get_file_size(filepath: str) -> int:
    """Retorna tamaño en bytes"""
    return os.path.getsize(filepath) if os.path.exists(filepath) else 0

def get_mime_type(filepath: str) -> str:
    """Obtiene el tipo MIME (básico)"""
    ext = os.path.splitext(filepath)[1].lower()
    mime_map = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.mp4': 'video/mp4',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return mime_map.get(ext, 'application/octet-stream')

def copy_file(src: str, dst: str) -> bool:
    """Copia un archivo"""
    try:
        shutil.copy2(src, dst)
        return True
    except Exception:
        return False