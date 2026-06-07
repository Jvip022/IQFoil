# backend/app/utils/decorators.py
from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import time
from .response import error_response

def handle_errors(default_message="Error interno del servidor"):
    """Decorator para manejar excepciones en rutas"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
            except PermissionError as e:
                return jsonify({"error": str(e)}), 403
            except Exception as e:
                current_app.logger.error(f"Error en {f.__name__}: {str(e)}")
                return jsonify({"error": default_message}), 500
        return wrapper
    return decorator

def require_roles(roles):
    """Decorator para verificar roles del usuario (requiere JWT)"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                # Necesitas tener un servicio para obtener roles del usuario
                from app.services.usuario_service import UsuarioService  # import dinámico para evitar circular
                user_roles = UsuarioService.get_user_roles(user_id)
                if not any(role in user_roles for role in roles):
                    return error_response("No tienes permiso para realizar esta acción", 403)
                return f(*args, **kwargs)
            except Exception:
                return error_response("Token inválido o expirado", 401)
        return wrapper
    return decorator

def log_activity(activity_type):
    """Decorator para registrar actividad del usuario"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity() or None
                result = f(*args, **kwargs)
                # Aquí podrías guardar en DB el log
                current_app.logger.info(f"User {user_id} performed {activity_type}")
                return result
            except Exception as e:
                current_app.logger.warning(f"Log activity error: {e}")
                return f(*args, **kwargs)
        return wrapper
    return decorator

def rate_limit(limit_per_minute=30):
    """Decorator simple de rate limiting en memoria (no persistente)"""
    requests = {}
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            client_ip = request.remote_addr
            now = time.time()
            window = 60  # segundos
            if client_ip in requests:
                # Filtrar peticiones fuera de la ventana
                requests[client_ip] = [t for t in requests[client_ip] if now - t < window]
                if len(requests[client_ip]) >= limit_per_minute:
                    return error_response("Demasiadas solicitudes, intente más tarde", 429)
                requests[client_ip].append(now)
            else:
                requests[client_ip] = [now]
            return f(*args, **kwargs)
        return wrapper
    return decorator