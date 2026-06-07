# backend/app/utils/validators.py
import re

def validate_email(email: str) -> bool:
    """Valida formato de email básico"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password_strength(password: str) -> tuple:
    """
    Valida fuerza de contraseña.
    Retorna (bool, mensaje)
    """
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "Debe contener al menos una mayúscula"
    if not re.search(r'[a-z]', password):
        return False, "Debe contener al menos una minúscula"
    if not re.search(r'\d', password):
        return False, "Debe contener al menos un número"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Debe contener al menos un carácter especial"
    return True, "Contraseña segura"

def validate_url(url: str) -> bool:
    """Valida URL básica http/https"""
    pattern = r'^https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    return bool(re.match(pattern, url))

def validate_file_size(size_bytes: int, max_mb: int = 50) -> bool:
    """Valida tamaño de archivo en MB"""
    max_bytes = max_mb * 1024 * 1024
    return size_bytes <= max_bytes

def validate_allowed_extension(filename: str, allowed_extensions: set) -> bool:
    """Valida si la extensión del archivo está permitida"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in allowed_extensions

def validate_non_empty_string(value: str, field_name: str) -> tuple:
    if not value or not value.strip():
        return False, f"{field_name} no puede estar vacío"
    return True, ""