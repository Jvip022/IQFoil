from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.evento import Evento
from app.models.usuario import Usuario

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
        'organizador': e.organizador_id,  # Se devuelve el ID del organizador
        'contacto': None,  # No hay campo contacto en el modelo, se puede omitir
        'activo': e.publico   # Usamos publico como activo
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
        organizador_id=data.get('organizador_id'),  # Usamos el ID del usuario
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