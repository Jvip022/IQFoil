from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.log_actividad import LogActividad  
from datetime import datetime

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

    # Actualizar último acceso
    user.ultimo_acceso = datetime.now()

    # 🔥 REGISTRAR LOG DE ACTIVIDAD
    log = LogActividad(
        usuario_id=user.id,
        accion='login',
        detalles={'email': user.email, 'nombre': user.nombre},
        ip=request.remote_addr
    )
    db.session.add(log)

    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'nombre': user.nombre,
            'rol_id': user.rol_id,
            'provincia': user.provincia
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
        'avatarUrl': user.avatar,
        'rol_id': user.rol_id,
        'provincia': user.provincia
    })