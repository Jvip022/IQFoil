from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.insignia import Insignia
from app.models.usuario import Usuario

bp = Blueprint('insignias', __name__, url_prefix='/api/insignias')

def is_admin_or_coach():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    return user and user.rol_id in [1, 2]

@bp.route('/', methods=['GET'])
@jwt_required()
def get_insignias():
    insignias = Insignia.query.all()
    return jsonify([{
        'id': i.id,
        'nombre': i.nombre,
        'descripcion': i.descripcion,
        'icono': i.icono,
        'categoria': i.categoria,
        'color': i.color,
        'requisitos': i.requisitos
    } for i in insignias])

@bp.route('/', methods=['POST'])
@jwt_required()
def crear_insignia():
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    nueva = Insignia(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        icono=data.get('icono', '🏅'),
        categoria=data.get('categoria'),
        color=data.get('color'),
        requisitos=data.get('requisitos')
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify({
        'id': nueva.id,
        'nombre': nueva.nombre,
        'descripcion': nueva.descripcion,
        'icono': nueva.icono,
        'categoria': nueva.categoria,
        'color': nueva.color,
        'requisitos': nueva.requisitos
    }), 201

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_insignia(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    ins = Insignia.query.get_or_404(id)
    data = request.get_json()
    ins.nombre = data.get('nombre', ins.nombre)
    ins.descripcion = data.get('descripcion', ins.descripcion)
    ins.icono = data.get('icono', ins.icono)
    ins.categoria = data.get('categoria', ins.categoria)
    ins.color = data.get('color', ins.color)
    ins.requisitos = data.get('requisitos', ins.requisitos)
    db.session.commit()
    return jsonify({'id': ins.id, 'nombre': ins.nombre, 'message': 'Insignia actualizada'})

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_insignia(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    ins = Insignia.query.get_or_404(id)
    db.session.delete(ins)
    db.session.commit()
    return jsonify({'message': 'Insignia eliminada'})