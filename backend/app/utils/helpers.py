# backend/app/utils/helpers.py
import re
import uuid
from datetime import datetime
import os
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename

def generate_id(prefix=""):
    """Genera un ID único con prefijo opcional"""
    unique = str(uuid.uuid4()).replace("-", "")[:16]
    return f"{prefix}{unique}" if prefix else unique

def format_datetime(dt: datetime, fmt="%Y-%m-%d %H:%M:%S"):
    """Formatea datetime a string"""
    return dt.strftime(fmt) if dt else None

def sanitize_string(text: str) -> str:
    """Limpia un string: quita espacios extra, convierte a minúsculas opcional"""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extrae texto de un archivo PDF"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception:
        return ""

def get_file_extension(filename: str) -> str:
    """Obtiene la extensión de un archivo en minúsculas"""
    return os.path.splitext(filename)[1].lower().lstrip('.')

def is_image_file(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'}

def is_video_file(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in {'mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv'}

def is_document_file(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'}

def secure_filename_custom(filename: str) -> str:
    """Versión segura de nombre de archivo manteniendo extensión"""
    name, ext = os.path.splitext(filename)
    safe_name = secure_filename(name)
    return f"{safe_name}{ext}" if safe_name else filename