from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.curso import Curso
from app.models.usuario import Usuario

bp = Blueprint('cursos', __name__, url_prefix='/api/cursos')

def is_admin_or_coach():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    return user and user.rol_id in [1, 2]

@bp.route('/', methods=['GET'])
@jwt_required()
def get_cursos():
    cursos = Curso.query.order_by(Curso.fecha_creacion.desc()).all()
    return jsonify([c.to_dict() for c in cursos])

@bp.route('/', methods=['POST'])
@jwt_required()
def crear_curso():
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    nuevo = Curso(
        titulo=data['titulo'],
        descripcion=data.get('descripcion', ''),
        nivel=data.get('nivel'),
        imagen_url=data.get('imagenUrl'),
        activo=data.get('activo', True)
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict()), 201

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_curso(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    curso = Curso.query.get_or_404(id)
    data = request.get_json()
    curso.titulo = data.get('titulo', curso.titulo)
    curso.descripcion = data.get('descripcion', curso.descripcion)
    curso.nivel = data.get('nivel', curso.nivel)
    curso.imagen_url = data.get('imagenUrl', curso.imagen_url)
    curso.activo = data.get('activo', curso.activo)
    db.session.commit()
    return jsonify(curso.to_dict())

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_curso(id):
    if not is_admin_or_coach():
        return jsonify({'error': 'No autorizado'}), 403
    curso = Curso.query.get_or_404(id)
    db.session.delete(curso)
    db.session.commit()
    return jsonify({'message': 'Curso eliminado'})