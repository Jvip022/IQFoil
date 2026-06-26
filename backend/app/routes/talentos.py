from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.insignia import Insignia
from app.models.usuario_insignia import UsuarioInsignia
from app.models.usuario import Usuario
from app.models.evaluacion import Evaluacion          # ← importación necesaria
from app.models.progreso_video import ProgresoVideo   # ← importación necesaria
from app.models.video import VideoTutorial            # ← importación necesaria
from app.models.mentoria import Mentoria              # ← importación necesaria

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
        'fechaObtenida': next((ui.fecha_obtenida.isoformat() for ui in UsuarioInsignia.query.filter_by(usuario_id=user_id, insignia_id=i.id)), None)
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

# ==================== NUEVOS ENDPOINTS PARA DASHBOARD ====================

@bp.route('/insignias/usuario/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_user_badges(usuario_id):
    """Obtiene las insignias obtenidas por un usuario"""
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)
    if current_user_id != usuario_id and (not user or user.rol_id not in [1, 2]):
        return jsonify({'error': 'No autorizado'}), 403
    
    insignias = UsuarioInsignia.query.filter_by(usuario_id=usuario_id).all()
    result = []
    for ui in insignias:
        ins = Insignia.query.get(ui.insignia_id)
        if ins:
            result.append({
                'id': ins.id,
                'nombre': ins.nombre,
                'icono': ins.icono,
                'categoria': ins.categoria,
                'fechaObtenida': ui.fecha_obtenida.isoformat() if ui.fecha_obtenida else None
            })
    return jsonify(result)

@bp.route('/mentor/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_mentor(usuario_id):
    """Obtiene el mentor asignado a un atleta"""
    mentoria = Mentoria.query.filter_by(aprendiz_id=usuario_id, estado='activa').first()
    if not mentoria:
        return jsonify(None)
    mentor = Usuario.query.get(mentoria.mentor_id)
    if not mentor:
        return jsonify(None)
    return jsonify({
        'nombre': mentor.nombre,
        'email': mentor.email,
        'contacto': mentor.email
    })

@bp.route('/atletas/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_atletas_coach(usuario_id):
    """Obtiene los atletas a cargo de un entrenador"""
    mentorias = Mentoria.query.filter_by(mentor_id=usuario_id, estado='activa').all()
    result = []
    for m in mentorias:
        atleta = Usuario.query.get(m.aprendiz_id)
        if atleta:
            progresos = ProgresoVideo.query.filter_by(usuario_id=atleta.id, completado=True).count()
            total_videos = VideoTutorial.query.count()
            progreso = round((progresos / total_videos * 100) if total_videos else 0)
            result.append({
                'id': atleta.id,
                'nombre': atleta.nombre,
                'progreso': progreso
            })
    return jsonify(result)

@bp.route('/evaluaciones-pendientes/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_pending_evaluations(usuario_id):
    """Obtiene evaluaciones pendientes para un entrenador"""
    current_user_id = get_jwt_identity()
    if current_user_id != usuario_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    evaluaciones = Evaluacion.query.filter_by(
        evaluador_id=usuario_id,
        estado='pendiente'
    ).all()
    
    result = []
    for ev in evaluaciones:
        atleta = Usuario.query.get(ev.usuario_id)
        result.append({
            'id': ev.id,
            'titulo': ev.titulo,
            'atleta': atleta.nombre if atleta else 'Desconocido',
            'fecha': ev.fecha_entrega.isoformat() if ev.fecha_entrega else None
        })
    return jsonify(result)