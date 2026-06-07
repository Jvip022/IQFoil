# backend/app/routes/usuarios.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.utils.response import success_response, error_response
from app.utils.decorators import handle_errors

bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

# Decorador para permitir OPTIONS sin JWT
def optional_jwt_for_options(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
        return jwt_required()(fn)(*args, **kwargs)
    return wrapper

@bp.route('/perfil', methods=['GET', 'OPTIONS'])
@optional_jwt_for_options
@handle_errors()
def get_perfil():
    """Obtener perfil del usuario autenticado"""
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return error_response("Usuario no encontrado", 404)
    # Obtener nombre del rol si existe la relación
    rol_nombre = usuario.rol.nombre if usuario.rol else 'usuario'
    return success_response({
        'uid': usuario.id,
        'nombre': usuario.nombre,
        'email': usuario.email,
        'roles': [rol_nombre],
        'avatar': usuario.avatar
    })

@bp.route('/perfil', methods=['PUT', 'OPTIONS'])
@optional_jwt_for_options
@handle_errors()
def actualizar_perfil():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    usuario = Usuario.query.get_or_404(user_id)
    data = request.get_json()
    if 'nombre' in data:
        usuario.nombre = data['nombre']
    if 'email' in data:
        usuario.email = data['email']
    db.session.commit()
    return success_response({'mensaje': 'Perfil actualizado'})

@bp.route('/preferencias', methods=['GET', 'OPTIONS'])
@optional_jwt_for_options
def get_preferencias():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    # Suponiendo que tienes un campo preferencias (JSON)
    preferencias = getattr(usuario, 'preferencias', {'idioma': 'es', 'notificacionesEmail': True, 'tema': 'claro'})
    return success_response(preferencias)

@bp.route('/preferencias', methods=['PUT', 'OPTIONS'])
@optional_jwt_for_options
def actualizar_preferencias():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    usuario = Usuario.query.get_or_404(user_id)
    data = request.get_json()
    # Guardar preferencias (ejemplo: columna JSON)
    usuario.preferencias = data  # Asegúrate de tener esta columna
    db.session.commit()
    return success_response(data)

@bp.route('/avatar', methods=['POST', 'OPTIONS'])
@optional_jwt_for_options
def subir_avatar():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    archivo = request.files.get('avatar')
    if not archivo:
        return error_response("No se envió archivo", 400)
    # Guardar avatar (lógica simplificada)
    from werkzeug.utils import secure_filename
    import os
    filename = secure_filename(f"avatar_{user_id}.jpg")
    upload_dir = 'uploads/avatares'
    os.makedirs(upload_dir, exist_ok=True)
    path = os.path.join(upload_dir, filename)
    archivo.save(path)
    # Actualizar URL en el usuario
    usuario = Usuario.query.get(user_id)
    usuario.avatar = f"/{path}"
    db.session.commit()
    return success_response({'url': usuario.avatar})

@bp.route('/cambiar-password', methods=['POST', 'OPTIONS'])
@optional_jwt_for_options
@handle_errors()
def cambiar_password():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    data = request.get_json()
    old_pass = data.get('oldPass')
    new_pass = data.get('newPass')
    usuario = Usuario.query.get(user_id)
    from werkzeug.security import check_password_hash, generate_password_hash
    if not check_password_hash(usuario.password_hash, old_pass):
        return error_response("Contraseña actual incorrecta", 400)
    usuario.password_hash = generate_password_hash(new_pass)
    db.session.commit()
    return success_response({'mensaje': 'Contraseña cambiada'})