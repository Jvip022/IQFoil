from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.foro import Foro
from app.models.hilo import Hilo
from app.models.mensaje import Mensaje
from app.models.usuario import Usuario
from sqlalchemy.orm import joinedload  # ← importación necesaria

bp = Blueprint('foro', __name__, url_prefix='/api/foro')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_foros():
    foros = Foro.query.order_by(Foro.orden).all()
    result = []
    for f in foros:
        ultimo_hilo = Hilo.query.filter_by(foro_id=f.id).order_by(Hilo.ultima_respuesta.desc()).first()
        ultima_actividad = ultimo_hilo.ultima_respuesta.isoformat() if ultimo_hilo and ultimo_hilo.ultima_respuesta else None
        result.append({
            'id': f.id,
            'titulo': f.titulo,
            'descripcion': f.descripcion,
            'totalHilos': Hilo.query.filter_by(foro_id=f.id).count(),
            'ultimaActividad': ultima_actividad
        })
    return jsonify(result)

@bp.route('/hilos', methods=['GET'])
@jwt_required()
def get_hilos():
    # Cargar el autor y su rol de una vez
    hilos = Hilo.query.options(joinedload(Hilo.autor).joinedload(Usuario.rol)).order_by(Hilo.fecha_creacion.desc()).all()
    result = []
    for h in hilos:
        num_respuestas = Mensaje.query.filter_by(hilo_id=h.id).count()
        autor = h.autor
        autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
        result.append({
            'id': h.id,
            'titulo': h.titulo,
            'autor': autor.nombre if autor else 'Anónimo',
            'autorRol': autor_rol,
            'fechaCreacion': h.fecha_creacion.isoformat(),
            'respuestas': num_respuestas,
            'ultimaRespuesta': h.ultima_respuesta.isoformat() if h.ultima_respuesta else None
        })
    return jsonify(result)

@bp.route('/hilos', methods=['POST'])
@jwt_required()
def crear_hilo():
    data = request.get_json()
    user_id = get_jwt_identity()
    nuevo_hilo = Hilo(
        foro_id=data['foroId'],
        titulo=data['titulo'],
        contenido=data['contenido'],
        autor_id=user_id,
        ultima_respuesta=db.func.now()
    )
    db.session.add(nuevo_hilo)
    db.session.commit()
    # Opcional: devolver el hilo creado con el autor y rol para actualizar el frontend
    return jsonify({
        'id': nuevo_hilo.id,
        'titulo': nuevo_hilo.titulo,
        'contenido': nuevo_hilo.contenido,
        'autor': nuevo_hilo.autor.nombre,
        'autorRol': nuevo_hilo.autor.rol.nombre if nuevo_hilo.autor and nuevo_hilo.autor.rol else 'atleta',
        'fechaCreacion': nuevo_hilo.fecha_creacion.isoformat(),
        'respuestas': 0,
        'ultimaRespuesta': nuevo_hilo.ultima_respuesta.isoformat() if nuevo_hilo.ultima_respuesta else None
    }), 201

@bp.route('/hilos/<int:hilo_id>', methods=['GET'])
@jwt_required()
def get_hilo(hilo_id):
    # Cargar el hilo con el autor y su rol
    hilo = Hilo.query.options(joinedload(Hilo.autor).joinedload(Usuario.rol)).get_or_404(hilo_id)
    hilo.vistas += 1
    db.session.commit()
    autor = hilo.autor
    autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
    return jsonify({
        'id': hilo.id,
        'foroId': hilo.foro_id,
        'titulo': hilo.titulo,
        'contenido': hilo.contenido,
        'autor': autor.nombre if autor else 'Anónimo',
        'autorRol': autor_rol,
        'fechaCreacion': hilo.fecha_creacion.isoformat(),
        'ultimaRespuesta': hilo.ultima_respuesta.isoformat() if hilo.ultima_respuesta else None,
        'respuestas': Mensaje.query.filter_by(hilo_id=hilo.id).count(),
        'vistas': hilo.vistas
    })

@bp.route('/hilos/<int:hilo_id>/mensajes', methods=['GET'])
@jwt_required()
def get_mensajes(hilo_id):
    # Cargar mensajes con autor y rol
    mensajes = Mensaje.query.options(joinedload(Mensaje.autor).joinedload(Usuario.rol)).filter_by(hilo_id=hilo_id).order_by(Mensaje.fecha).all()
    result = []
    for m in mensajes:
        autor = m.autor
        autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
        result.append({
            'id': m.id,
            'autor': autor.nombre if autor else 'Anónimo',
            'autorRol': autor_rol,
            'contenido': m.contenido,
            'fecha': m.fecha.isoformat()
        })
    return jsonify(result)

@bp.route('/mensajes', methods=['POST'])
@jwt_required()
def enviar_mensaje():
    data = request.get_json()
    user_id = get_jwt_identity()
    nuevo_mensaje = Mensaje(
        hilo_id=data['hiloId'],
        autor_id=user_id,
        contenido=data['contenido']
    )
    hilo = Hilo.query.get(data['hiloId'])
    if not hilo:
        return jsonify({'error': 'Hilo no encontrado'}), 404
    hilo.ultima_respuesta = db.func.now()
    db.session.add(nuevo_mensaje)
    db.session.commit()
    # Devolver el mensaje con el autor y rol para actualizar el frontend
    autor = nuevo_mensaje.autor
    autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
    return jsonify({
        'id': nuevo_mensaje.id,
        'autor': autor.nombre if autor else 'Anónimo',
        'autorRol': autor_rol,
        'contenido': nuevo_mensaje.contenido,
        'fecha': nuevo_mensaje.fecha.isoformat()
    }), 201

# ==================== ENDPOINT: ELIMINAR HILO ====================
@bp.route('/hilos/<int:hilo_id>', methods=['DELETE'])
@jwt_required()
def eliminar_hilo(hilo_id):
    """Elimina un hilo y todos sus mensajes asociados (cascade)"""
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or user.rol_id not in [1, 2]:
        return jsonify({'error': 'No autorizado'}), 403

    hilo = Hilo.query.get_or_404(hilo_id)
    db.session.delete(hilo)
    db.session.commit()
    return jsonify({'message': 'Hilo eliminado correctamente'}), 200