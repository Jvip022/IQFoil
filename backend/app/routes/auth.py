from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.rol import Rol

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 400
    user = Usuario(email=data['email'], nombre=data['nombre'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Usuario.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'nombre': user.nombre,
            'rol_id': user.rol_id
        }
    })

@bp.route('/perfil', methods=['GET'])
@jwt_required()
def perfil():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify({
        'id': user.id,
        'email': user.email,
        'nombre': user.nombre,
        'avatarUrl': user.avatar,   # antes era avatar_url, ahora avatar
        'rol_id': user.rol_id
    })