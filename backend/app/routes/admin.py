from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.video import VideoTutorial
from app.models.documento import Documento
from app.models.hilo import Hilo

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def estadisticas():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if user.rol_id != 1:
        return jsonify({'error': 'No autorizado'}), 403
    stats = {
        'usuariosTotales': Usuario.query.count(),
        'usuariosActivosMes': Usuario.query.filter(Usuario.ultimo_acceso > 'now() - interval 30 days').count(),
        'contenidosPublicados': VideoTutorial.query.filter_by(activo=True).count(),
        'evaluacionesRealizadas': 0,  # ajusta según tu modelo
        'documentosSubidos': Documento.query.count(),
        'eventosProximos': 0
    }
    return jsonify(stats)

@bp.route('/usuarios', methods=['GET'])
@jwt_required()
def listar_usuarios():
    user = Usuario.query.get(get_jwt_identity())
    if user.rol_id != 1:
        return jsonify({'error': 'No autorizado'}), 403
    usuarios = Usuario.query.all()
    return jsonify([{
        'id': u.id,
        'email': u.email,
        'nombre': u.nombre,
        'rol_id': u.rol_id,
        'activo': u.activo,
        'ultimoAcceso': u.ultimo_acceso.isoformat() if u.ultimo_acceso else None
    } for u in usuarios])

@bp.route('/usuarios/<int:id>/bloquear', methods=['PUT'])
@jwt_required()
def toggle_bloquear(id):
    user = Usuario.query.get(get_jwt_identity())
    if user.rol_id != 1:
        return jsonify({'error': 'No autorizado'}), 403
    target = Usuario.query.get_or_404(id)
    target.activo = not target.activo
    db.session.commit()
    return jsonify({'message': f'Usuario {"bloqueado" if not target.activo else "desbloqueado"}'})