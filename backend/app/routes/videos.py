from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import traceback
from app import db
from app.models.video import VideoTutorial
from app.models.progreso_video import ProgresoVideo
from app.models.usuario import Usuario

bp = Blueprint('videos', __name__, url_prefix='/api/videos')

ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'ogg', 'mov'}

def allowed_video(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

@bp.route('/modulos', methods=['GET'])
@jwt_required()
def get_modulos():
    try:
        videos = VideoTutorial.query.order_by(VideoTutorial.fecha_publicacion).all()
        base_url = request.host_url.rstrip('/')
        modulos = [{
            'id': '1',
            'titulo': 'Todos los videos',
            'videos': [{
                'id': v.id,
                'titulo': v.titulo,
                'descripcion': v.descripcion,
                'url': f"{base_url}/{v.url_video}",
                'duracion': v.duracion_seg,
                'nivel': v.nivel,
                'completado': False,
                'progreso': 0
            } for v in videos],
            'completado': False
        }]
        return jsonify(modulos)
    except Exception as e:
        print("Error en get_modulos:", traceback.format_exc())
        return jsonify({'error': 'Error interno'}), 500

@bp.route('/progreso', methods=['POST'])
@jwt_required()
def actualizar_progreso():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        video_id = data.get('videoId')
        progreso = data.get('progreso')
        if not video_id or progreso is None:
            return jsonify({'error': 'Faltan datos'}), 400
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
    except Exception as e:
        print("Error en actualizar_progreso:", traceback.format_exc())
        return jsonify({'error': 'Error interno'}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def subir_video():
    try:
        user_id = get_jwt_identity()
        usuario = Usuario.query.get(user_id)
        if not usuario or usuario.rol_id not in [1, 2]:
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

        relative_path = os.path.join('uploads', 'videos', filename).replace('\\', '/')

        nuevo_video = VideoTutorial(
            titulo=titulo,
            descripcion=descripcion,
            url_video=relative_path,
            duracion_seg=duracion or 0,
            nivel=nivel,
            fecha_publicacion=db.func.now()
        )
        db.session.add(nuevo_video)
        db.session.commit()

        base_url = request.host_url.rstrip('/')
        return jsonify({
            'id': str(nuevo_video.id),
            'titulo': nuevo_video.titulo,
            'descripcion': nuevo_video.descripcion,
            'url': f"{base_url}/{relative_path}",
            'duracion': nuevo_video.duracion_seg,
            'nivel': nuevo_video.nivel,
            'progreso': 0,
            'completado': False
        }), 201
    except Exception as e:
        print("Error en subir_video:", traceback.format_exc())
        return jsonify({'error': 'Error interno del servidor'}), 500



@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_video(id):
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    if not usuario or usuario.rol_id not in [1, 2]:
        return jsonify({'error': 'No autorizado'}), 403

    video = VideoTutorial.query.get_or_404(id)
    # Eliminar el archivo físico si existe
    if video.url_video:
        full_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), video.url_video)
        if os.path.exists(full_path):
            os.remove(full_path)
    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Video eliminado correctamente'}), 200