# backend/app/routes/usuarios.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.progreso_video import ProgresoVideo
from app.models.video import VideoTutorial
from app.models.usuario_insignia import UsuarioInsignia
from app.models.evaluacion import Evaluacion
from app.models.solicitud_cambio_entrenador import SolicitudCambioEntrenador  # ← AGREGADO
from app.models.respuesta_usuario import RespuestaUsuario  # ← AGREGADO
from app.utils.response import success_response, error_response
from app.utils.decorators import handle_errors
from datetime import datetime, timedelta
from sqlalchemy import func, extract

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


# ============================================================
# PERFIL Y PREFERENCIAS
# ============================================================

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
    usuario.preferencias = data
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
    from werkzeug.utils import secure_filename
    import os
    filename = secure_filename(f"avatar_{user_id}.jpg")
    upload_dir = 'uploads/avatares'
    os.makedirs(upload_dir, exist_ok=True)
    path = os.path.join(upload_dir, filename)
    archivo.save(path)
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


# ============================================================
# PROGRESO DEL USUARIO
# ============================================================

@bp.route('/progreso/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_progreso_usuario(usuario_id):
    """Obtiene el progreso del usuario: videos vistos, insignias, etc."""
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)
    if current_user_id != usuario_id and (not user or user.rol_id not in [1, 2]):
        return jsonify({'error': 'No autorizado'}), 403

    # Videos completados
    progresos = ProgresoVideo.query.filter_by(usuario_id=usuario_id, completado=True).count()
    total_videos = VideoTutorial.query.count()

    # Insignias obtenidas
    insignias = UsuarioInsignia.query.filter_by(usuario_id=usuario_id).count()

    # Evaluaciones realizadas
    evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario_id, estado='evaluado').count()

    # Evolución (últimos 6 meses)
    evolucion = []
    for i in range(6):
        mes = datetime.now() - timedelta(days=30*i)
        completados_mes = ProgresoVideo.query.filter(
            ProgresoVideo.usuario_id == usuario_id,
            ProgresoVideo.completado == True,
            extract('year', ProgresoVideo.ultima_visualizacion) == mes.year,
            extract('month', ProgresoVideo.ultima_visualizacion) == mes.month
        ).count()
        evolucion.append({
            'fecha': mes.strftime('%b'),
            'valor': completados_mes
        })

    return jsonify({
        'globalProgress': (progresos / total_videos * 100) if total_videos else 0,
        'videosVistos': progresos,
        'videosTotales': total_videos,
        'evaluacionesCompletadas': evaluaciones,
        'insignias': insignias,
        'evolucion': evolucion[::-1]  # orden cronológico
    })


# ============================================================
# EXAMEN TEÓRICO (inicio)
# ============================================================

@bp.route('/teoricas/iniciar', methods=['POST', 'OPTIONS'])
@optional_jwt_for_options  # ← CORREGIDO: permite OPTIONS sin JWT
def iniciar_examen_teorico():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    examen_id = data.get('examenId')
    user_id = get_jwt_identity()
    # Verificar si ya hay un intento en curso
    existente = RespuestaUsuario.query.filter_by(
        examen_id=examen_id,
        usuario_id=user_id,
        estado='en_curso'
    ).first()
    if existente:
        return jsonify({'id': existente.id}), 200
    nuevo = RespuestaUsuario(
        examen_id=examen_id,
        usuario_id=user_id,
        respuestas={},
        estado='en_curso'
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'id': nuevo.id}), 201


# ============================================================
# ATLETAS Y CAMBIOS DE ENTRENADOR
# ============================================================

@bp.route('/atletas', methods=['GET'])
@jwt_required()
def get_atletas():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if user.rol_id not in [1, 2]:  # admin o entrenador
        return jsonify({'error': 'No autorizado'}), 403
    atletas = Usuario.query.filter_by(entrenador_id=user_id).all()
    return jsonify([{'id': u.id, 'nombre': u.nombre, 'email': u.email} for u in atletas])


@bp.route('/solicitar-cambio-entrenador', methods=['POST'])
@jwt_required()
def solicitar_cambio_entrenador():
    user_id = get_jwt_identity()
    data = request.get_json()
    nuevo_entrenador_id = data.get('nuevoEntrenadorId')
    comentario = data.get('comentario', '')

    atleta = Usuario.query.get(user_id)
    if atleta.rol_id != 3:  # solo atletas
        return jsonify({'error': 'Solo los atletas pueden solicitar cambio'}), 403

    # Verificar que el nuevo entrenador existe y es entrenador
    nuevo_ent = Usuario.query.get(nuevo_entrenador_id)
    if not nuevo_ent or nuevo_ent.rol_id != 2:
        return jsonify({'error': 'El usuario seleccionado no es un entrenador válido'}), 400

    # Evitar duplicados pendientes
    existente = SolicitudCambioEntrenador.query.filter_by(
        atleta_id=user_id,
        estado='pendiente'
    ).first()
    if existente:
        return jsonify({'error': 'Ya tienes una solicitud pendiente'}), 400

    solicitud = SolicitudCambioEntrenador(
        atleta_id=user_id,
        entrenador_actual_id=atleta.entrenador_id,
        entrenador_deseado_id=nuevo_entrenador_id,
        comentario=comentario
    )
    db.session.add(solicitud)
    db.session.commit()

    return jsonify({'message': 'Solicitud enviada correctamente'}), 201


@bp.route('/solicitudes-cambio', methods=['GET'])
@jwt_required()
def get_solicitudes_cambio():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if user.rol_id not in [1, 2]:  # solo admin o entrenador
        return jsonify({'error': 'No autorizado'}), 403

    query = SolicitudCambioEntrenador.query.filter_by(estado='pendiente')
    if user.rol_id == 2:  # entrenador: ver solicitudes donde es entrenador actual o deseado
        query = query.filter(
            (SolicitudCambioEntrenador.entrenador_actual_id == user_id) |
            (SolicitudCambioEntrenador.entrenador_deseado_id == user_id)
        )
    solicitudes = query.all()
    return jsonify([{
        'id': s.id,
        'atleta': s.atleta.nombre,
        'entrenadorActual': s.entrenador_actual.nombre if s.entrenador_actual else 'Ninguno',
        'entrenadorDeseado': s.entrenador_deseado.nombre,
        'comentario': s.comentario,
        'fecha': s.fecha_solicitud.isoformat()
    } for s in solicitudes])


@bp.route('/solicitudes-cambio/<int:solicitud_id>', methods=['PUT'])
@jwt_required()
def resolver_solicitud_cambio(solicitud_id):
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    data = request.get_json()
    accion = data.get('accion')  # 'aprobar' o 'rechazar'

    solicitud = SolicitudCambioEntrenador.query.get_or_404(solicitud_id)
    if solicitud.estado != 'pendiente':
        return jsonify({'error': 'Esta solicitud ya fue resuelta'}), 400

    # Verificar permisos: admin o entrenador involucrado
    if user.rol_id != 1 and user.id not in [solicitud.entrenador_actual_id, solicitud.entrenador_deseado_id]:
        return jsonify({'error': 'No autorizado'}), 403

    if accion == 'aprobar':
        atleta = Usuario.query.get(solicitud.atleta_id)
        atleta.entrenador_id = solicitud.entrenador_deseado_id
        solicitud.estado = 'aprobada'
        db.session.commit()
        return jsonify({'message': 'Solicitud aprobada y asignación actualizada'}), 200
    else:
        solicitud.estado = 'rechazada'
        db.session.commit()
        return jsonify({'message': 'Solicitud rechazada'}), 200