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

    # Verificar que el video existe
    video = VideoTutorial.query.get(video_id)
    if not video:
        return jsonify({'error': 'Video no encontrado'}), 404

    prog = ProgresoVideo.query.filter_by(usuario_id=user_id, video_id=video_id).first()
    if not prog:
        prog = ProgresoVideo(usuario_id=user_id, video_id=video_id)
        db.session.add(prog)
    prog.progreso = min(100, max(0, progreso))
    prog.completado = (prog.progreso >= 100)
    db.session.commit()
    return jsonify({'message': 'Progreso actualizado'})

import os
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'ogg', 'mov'}

def allowed_video(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

@bp.route('/', methods=['POST'])
@jwt_required()
def subir_video():
    user_id = get_jwt_identity()
    # Solo administradores o entrenadores pueden subir
    usuario = Usuario.query.get(user_id)
    if not usuario or usuario.rol_id not in [1, 2]:  # admin o entrenador
        return jsonify({'error': 'No autorizado'}), 403

    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    nivel = request.form.get('nivel')
    duracion = request.form.get('duracion_segundos', type=int)
    archivo = request.files.get('archivo')

    if not titulo or not archivo or not nivel:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    if not allowed_video(archivo.filename):
        return jsonify({'error': 'Formato de video no permitido'}), 400

    filename = secure_filename(archivo.filename)
    upload_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'videos')
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    archivo.save(filepath)

    # Guardar en BD
    nuevo_video = VideoTutorial(
        titulo=titulo,
        descripcion=descripcion,
        url_video=filepath,  # o una URL pública si usas CDN
        duracion_seg=duracion or 0,
        nivel=nivel,
        fecha_publicacion=db.func.now()
    )
    db.session.add(nuevo_video)
    db.session.commit()
    return jsonify({'id': nuevo_video.id, 'titulo': nuevo_video.titulo, 'url': nuevo_video.url_video}), 201