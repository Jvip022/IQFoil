from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.video import VideoTutorial
from app.models.progreso_video import ProgresoVideo

bp = Blueprint('videos', __name__, url_prefix='/api/videos')

@bp.route('/modulos', methods=['GET'])
@jwt_required()
def get_modulos():
    videos = VideoTutorial.query.order_by(VideoTutorial.fecha_publicacion).all()
    # Agrupar por algún criterio si existen módulos; por simplicidad devolvemos una lista plana
    modulos = [{
        'id': '1',
        'titulo': 'Todos los videos',
        'videos': [{
            'id': v.id,
            'titulo': v.titulo,
            'descripcion': v.descripcion,
            'url': v.url_video,
            'duracion': v.duracion_seg,
            'nivel': v.nivel,
            'completado': False,
            'progreso': 0
        } for v in videos],
        'completado': False
    }]
    return jsonify(modulos)

@bp.route('/progreso', methods=['POST'])
@jwt_required()
def actualizar_progreso():
    data = request.get_json()
    user_id = get_jwt_identity()
    video_id = data.get('videoId')
    progreso = data.get('progreso')
    if not video_id or progreso is None:
        return jsonify({'error': 'Faltan datos'}), 400
    prog = ProgresoVideo.query.filter_by(usuario_id=user_id, video_id=video_id).first()
    if not prog:
        prog = ProgresoVideo(usuario_id=user_id, video_id=video_id)
        db.session.add(prog)
    prog.progreso = progreso
    if progreso >= 100:
        prog.completado = True
    db.session.commit()
    return jsonify({'message': 'Progreso actualizado'})