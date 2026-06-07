from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.insignia import Insignia
from app.models.usuario_insignia import UsuarioInsignia
from app.models.usuario import Usuario

bp = Blueprint('talentos', __name__, url_prefix='/api/talentos')

@bp.route('/insignias', methods=['GET'])
@jwt_required()
def get_insignias():
    user_id = get_jwt_identity()
    insignias = Insignia.query.all()
    user_insignias = [ui.insignia_id for ui in UsuarioInsignia.query.filter_by(usuario_id=user_id).all()]
    return jsonify([{
        'id': i.id,
        'nombre': i.nombre,
        'descripcion': i.descripcion,
        'icono': i.icono,
        'categoria': i.categoria,
        'color': i.color,
        'obtenida': i.id in user_insignias,
        'fechaObtenida': next((ui.fecha_obtenida.isoformat() for ui in UsuarioInsignia.query.filter_by(usuario_id=user_id, insignia_id=i.id).first()), None)
    } for i in insignias])

@bp.route('/alertas', methods=['GET'])
@jwt_required()
def get_alertas():
    # Simulación de alertas (puedes crear una tabla Alertas)
    alertas = [
        {'id': '1', 'tipo': 'nuevo-talento', 'mensaje': 'María Pérez ha completado el nivel avanzado', 'usuario': 'María', 'fecha': '2025-06-01T10:00:00', 'leida': False}
    ]
    return jsonify(alertas)

@bp.route('/recomendaciones', methods=['GET'])
@jwt_required()
def get_recomendaciones():
    # Simulación de recomendaciones
    recomendaciones = [
        {'id': '1', 'tipo': 'curso', 'titulo': 'Técnicas de foils', 'descripcion': 'Perfecciona tus habilidades', 'razon': 'Basado en tu progreso'}
    ]
    return jsonify(recomendaciones)