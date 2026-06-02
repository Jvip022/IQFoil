from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.usuario import Usuario
from ..models.foro import Foro, Hilo, Mensaje

bp = Blueprint('foro', __name__)

@bp.route('/', methods=['GET'])
def get_foros():
    foros = Foro.query.order_by(Foro.orden).all()
    return jsonify([{
        'id': f.id,
        'titulo': f.titulo,
        'descripcion': f.descripcion,
        'totalHilos': f.hilos.count(),
        'ultimaActividad': f.hilos.order_by(Hilo.ultima_respuesta.desc()).first().ultima_respuesta if f.hilos.first() else None
    } for f in foros])

@bp.route('/hilos', methods=['GET'])
@jwt_required()
def get_hilos():
    foro_id = request.args.get('foroId', type=int)
    query = Hilo.query.filter_by(activo=True)
    if foro_id:
        query = query.filter_by(foro_id=foro_id)
    hilos = query.order_by(Hilo.ultima_respuesta.desc()).all()
    return jsonify([{
        'id': h.id,
        'foroId': h.foro_id,
        'titulo': h.titulo,
        'autor': h.autor.nombre,
        'fechaCreacion': h.fecha_creacion.isoformat(),
        'ultimaRespuesta': h.ultima_respuesta.isoformat(),
        'respuestas': h.respuestas,
        'vistas': h.vistas
    } for h in hilos])

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
    return jsonify({'id': nuevo_hilo.id, 'mensaje': 'Hilo creado'}), 201

@bp.route('/hilos/<int:hilo_id>', methods=['GET'])
@jwt_required()
def get_hilo(hilo_id):
    hilo = Hilo.query.get_or_404(hilo_id)
    # Incrementar vistas
    hilo.vistas += 1
    db.session.commit()
    return jsonify({
        'id': hilo.id,
        'foroId': hilo.foro_id,
        'titulo': hilo.titulo,
        'contenido': hilo.contenido,
        'autor': hilo.autor.nombre,
        'fechaCreacion': hilo.fecha_creacion.isoformat(),
        'ultimaRespuesta': hilo.ultima_respuesta.isoformat(),
        'respuestas': hilo.respuestas,
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
    # Actualizar hilo
    hilo = Hilo.query.get(data['hiloId'])
    hilo.respuestas += 1
    hilo.ultima_respuesta = db.func.now()
    db.session.add(nuevo_mensaje)
    db.session.commit()
    return jsonify({'id': nuevo_mensaje.id, 'mensaje': 'Respuesta enviada'}), 201