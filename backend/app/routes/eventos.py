from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.evento import Evento
from app.models.usuario import Usuario
from app.models.participante_evento import ParticipanteEvento
from datetime import datetime

bp = Blueprint('eventos_crud', __name__, url_prefix='/api/eventos')

def is_admin_or_coach():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    return user and user.rol_id in [1, 2]

@bp.route('/', methods=['GET'])
@jwt_required()
def get_eventos():
    eventos = Evento.query.order_by(Evento.fecha_inicio).all()
    return jsonify([{
        'id': e.id,
        'titulo': e.titulo,
        'descripcion': e.descripcion,
        'fechaInicio': e.fecha_inicio.isoformat(),
        'fechaFin': e.fecha_fin.isoformat() if e.fecha_fin else None,
        'lugar': e.lugar,
        'tipo': e.tipo,
        'organizador': e.organizador_id,
        'contacto': None,
        'activo': e.publico
    } for e in eventos])

@bp.route('/', methods=['POST'])
@jwt_required()
def crear_evento():
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    nuevo = Evento(
        titulo=data['titulo'],
        descripcion=data.get('descripcion', ''),
        fecha_inicio=data['fechaInicio'],
        fecha_fin=data.get('fechaFin'),
        lugar=data.get('lugar'),
        tipo=data.get('tipo'),
        organizador_id=data.get('organizador_id'),
        max_participantes=data.get('max_participantes'),
        imagen_url=data.get('imagenUrl'),
        publico=data.get('activo', True)
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'id': nuevo.id, 'titulo': nuevo.titulo}), 201

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_evento(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    ev = Evento.query.get_or_404(id)
    data = request.get_json()
    ev.titulo = data.get('titulo', ev.titulo)
    ev.descripcion = data.get('descripcion', ev.descripcion)
    ev.fecha_inicio = data.get('fechaInicio', ev.fecha_inicio)
    ev.fecha_fin = data.get('fechaFin', ev.fecha_fin)
    ev.lugar = data.get('lugar', ev.lugar)
    ev.tipo = data.get('tipo', ev.tipo)
    ev.organizador_id = data.get('organizador_id', ev.organizador_id)
    ev.max_participantes = data.get('max_participantes', ev.max_participantes)
    ev.imagen_url = data.get('imagenUrl', ev.imagen_url)
    ev.publico = data.get('activo', ev.publico)
    db.session.commit()
    return jsonify({'message': 'Evento actualizado'})

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_evento(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    ev = Evento.query.get_or_404(id)
    db.session.delete(ev)
    db.session.commit()
    return jsonify({'message': 'Evento eliminado'})

# ==================== NUEVO ENDPOINT PARA EVENTOS PRÓXIMOS ====================
@bp.route('/proximos/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_upcoming_events(usuario_id):
    """Obtiene eventos próximos para un usuario"""
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)
    if current_user_id != usuario_id and (not user or user.rol_id not in [1, 2]):
        return jsonify({'error': 'No autorizado'}), 403

    hoy = datetime.now()
    eventos = Evento.query.filter(
        Evento.publico == True,
        Evento.fecha_inicio >= hoy
    ).order_by(Evento.fecha_inicio).limit(5).all()
    
    inscritos = ParticipanteEvento.query.filter_by(usuario_id=usuario_id).all()
    ids_inscritos = [p.evento_id for p in inscritos]
    eventos_inscritos = Evento.query.filter(
        Evento.id.in_(ids_inscritos),
        Evento.fecha_inicio >= hoy
    ).order_by(Evento.fecha_inicio).all()
    
    todos = {e.id: e for e in eventos}
    for e in eventos_inscritos:
        todos[e.id] = e
    
    result = []
    for e in sorted(todos.values(), key=lambda x: x.fecha_inicio)[:5]:
        result.append({
            'id': e.id,
            'titulo': e.titulo,
            'fecha': e.fecha_inicio.isoformat(),
            'lugar': e.lugar or 'Por definir',
            'tipo': e.tipo or 'evento'
        })
    return jsonify(result)

# ==================== INSCRIPCIÓN A EVENTOS ====================
@bp.route('/<int:id>/inscribirse', methods=['POST'])
@jwt_required()
def inscribirse_evento(id):
    """Inscribe al usuario autenticado en un evento"""
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    evento = Evento.query.get_or_404(id)
    if not evento.publico:
        return jsonify({'error': 'El evento no está disponible para inscripción'}), 400

    # Verificar si ya está inscrito
    ya_inscrito = ParticipanteEvento.query.filter_by(evento_id=id, usuario_id=user_id).first()
    if ya_inscrito:
        return jsonify({'error': 'Ya estás inscrito en este evento'}), 400

    # Verificar límite de participantes
    if evento.max_participantes:
        inscritos = ParticipanteEvento.query.filter_by(evento_id=id).count()
        if inscritos >= evento.max_participantes:
            return jsonify({'error': 'El evento ya ha alcanzado el número máximo de participantes'}), 400

    # Inscribir
    inscripcion = ParticipanteEvento(evento_id=id, usuario_id=user_id, fecha_inscripcion=datetime.now())
    db.session.add(inscripcion)
    db.session.commit()

    return jsonify({'message': 'Inscripción realizada con éxito'}), 201