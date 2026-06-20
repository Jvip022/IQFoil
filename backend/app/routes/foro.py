from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.foro import Foro
from app.models.hilo import Hilo
from app.models.mensaje import Mensaje
from app.models.usuario import Usuario

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
    hilos = Hilo.query.order_by(Hilo.fecha_creacion.desc()).all()
    result = []
    for h in hilos:
        num_respuestas = Mensaje.query.filter_by(hilo_id=h.id).count()
        result.append({
            'id': h.id,
            'titulo': h.titulo,
            'autor': h.autor.nombre if h.autor else 'Anónimo',
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
    return jsonify({'id': nuevo_hilo.id, 'message': 'Hilo creado'}), 201

@bp.route('/hilos/<int:hilo_id>', methods=['GET'])
@jwt_required()
def get_hilo(hilo_id):
    hilo = Hilo.query.get_or_404(hilo_id)
    hilo.vistas += 1
    db.session.commit()
    return jsonify({
        'id': hilo.id,
        'foroId': hilo.foro_id,
        'titulo': hilo.titulo,
        'contenido': hilo.contenido,
        'autor': hilo.autor.nombre,
        'fechaCreacion': hilo.fecha_creacion.isoformat(),
        'ultimaRespuesta': hilo.ultima_respuesta.isoformat() if hilo.ultima_respuesta else None,
        'respuestas': Mensaje.query.filter_by(hilo_id=hilo.id).count(),
        'vistas': hilo.vistas
    })

@bp.route('/hilos/<int:hilo_id>/mensajes', methods=['GET'])
@jwt_required()
def get_mensajes(hilo_id):
    mensajes = Mensaje.query.filter_by(hilo_id=hilo_id).order_by(Mensaje.fecha).all()
    return jsonify([{
        'id': m.id,
        'autor': m.autor.nombre,
        'contenido': m.contenido,
        'fecha': m.fecha.isoformat()
    } for m in mensajes])

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
    return jsonify({'id': nuevo_mensaje.id, 'message': 'Respuesta enviada'}), 201

# ==================== NUEVO ENDPOINT: ELIMINAR HILO ====================
@bp.route('/hilos/<int:hilo_id>', methods=['DELETE'])
@jwt_required()
def eliminar_hilo(hilo_id):
    """Elimina un hilo y todos sus mensajes asociados (cascade)"""
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    # Solo admin o entrenador pueden eliminar hilos
    if not user or user.rol_id not in [1, 2]:
        return jsonify({'error': 'No autorizado'}), 403

    hilo = Hilo.query.get_or_404(hilo_id)
    db.session.delete(hilo)
    db.session.commit()
    return jsonify({'message': 'Hilo eliminado correctamente'}), 200