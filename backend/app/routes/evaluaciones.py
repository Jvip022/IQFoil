from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.evaluacion import Evaluacion
from app.models.rubrica import Rubrica
from app.models.criterio import Criterio
from app.models.puntuacion_evaluacion import PuntuacionEvaluacion
from app.models.usuario import Usuario
from app.models.examen_teorico import ExamenTeorico
from app.models.pregunta import Pregunta
from app.models.respuesta_usuario import RespuestaUsuario
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime

bp = Blueprint('evaluaciones', __name__, url_prefix='/api/evaluaciones')

# ==================== EVALUACIÓN PRÁCTICA ====================

@bp.route('/', methods=['GET'])
@jwt_required()
def get_evaluaciones():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if user.rol_id == 1 or user.rol_id == 2:  # admin o entrenador
        evaluaciones = Evaluacion.query.all()
    else:
        evaluaciones = Evaluacion.query.filter_by(usuario_id=user_id).all()
    return jsonify([{
        'id': e.id,
        'titulo': e.titulo,
        'usuarioId': e.usuario_id,
        'rubricaId': e.rubrica_id,
        'fecha': e.fecha_entrega.isoformat() if e.fecha_entrega else None,
        'estado': e.estado,
        'puntuacionTotal': e.puntuacion_total
    } for e in evaluaciones])

@bp.route('/rubricas', methods=['GET'])
@jwt_required()
def get_rubricas():
    rubricas = Rubrica.query.all()
    return jsonify([{
        'id': r.id,
        'titulo': r.titulo,
        'descripcion': r.descripcion,
        'criterios': [{
            'id': c.id,
            'descripcion': c.descripcion,
            'puntuacionMaxima': c.puntuacion_maxima
        } for c in r.criterios]
    } for r in rubricas])

@bp.route('/rubricas/<int:id>', methods=['GET'])
@jwt_required()
def get_rubrica(id):
    rubrica = Rubrica.query.get_or_404(id)
    return jsonify({
        'id': rubrica.id,
        'titulo': rubrica.titulo,
        'descripcion': rubrica.descripcion,
        'criterios': [{
            'id': c.id,
            'descripcion': c.descripcion,
            'puntuacionMaxima': c.puntuacion_maxima
        } for c in rubrica.criterios]
    })

@bp.route('/videos-pendientes', methods=['GET'])
@jwt_required()
def videos_pendientes():
    pendientes = Evaluacion.query.filter_by(estado='pendiente').all()
    return jsonify([{
        'id': e.id,
        'titulo': e.titulo,
        'usuarioId': e.usuario_id,
        'fechaSubida': e.fecha_entrega.isoformat()
    } for e in pendientes])

@bp.route('/evaluar/<int:id>', methods=['POST'])
@jwt_required()
def guardar_evaluacion(id):
    data = request.get_json()
    evaluacion = Evaluacion.query.get_or_404(id)
    evaluacion.estado = 'evaluado'
    evaluacion.puntuacion_total = data.get('puntuacionTotal')
    evaluacion.comentarios = data.get('comentarios')
    for p in data.get('puntuaciones', []):
        punt = PuntuacionEvaluacion.query.filter_by(
            evaluacion_id=evaluacion.id,
            criterio_id=p['criterioId']
        ).first()
        if not punt:
            punt = PuntuacionEvaluacion(evaluacion_id=evaluacion.id, criterio_id=p['criterioId'])
            db.session.add(punt)
        punt.puntuacion = p['puntuacion']
    db.session.commit()
    return jsonify({'message': 'Evaluación guardada'})

# ==================== EVALUACIÓN TEÓRICA ====================

@bp.route('/teoricas/examenes', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_examenes_teoricos():
    if request.method == 'OPTIONS':
        return '', 200
    examenes = ExamenTeorico.query.filter_by(activo=True).all()
    return jsonify([e.to_dict() for e in examenes]), 200

@bp.route('/teoricas/examenes/<int:id>', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_examen_teorico(id):
    if request.method == 'OPTIONS':
        return '', 200
    examen = ExamenTeorico.query.get_or_404(id)
    if not examen.activo:
        return jsonify({'error': 'Examen no disponible'}), 404
    return jsonify(examen.to_dict(include_preguntas=True)), 200

@bp.route('/teoricas/examenes/<int:id>/enviar', methods=['POST', 'OPTIONS'])
@jwt_required()
def enviar_examen_teorico(id):
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    data = request.get_json()
    respuestas = data.get('respuestas', {})

    examen = ExamenTeorico.query.get_or_404(id)
    preguntas = examen.preguntas

    puntaje_total = 0
    puntaje_maximo = sum(p.puntaje for p in preguntas) if preguntas else 0

    for p in preguntas:
        respuesta_usuario = respuestas.get(str(p.id))
        if respuesta_usuario is None:
            continue
        correcta = p.respuesta_correcta
        if p.tipo == 'opcion_unica':
            if respuesta_usuario == correcta:
                puntaje_total += p.puntaje
        elif p.tipo == 'verdadero_falso':
            if respuesta_usuario == correcta:
                puntaje_total += p.puntaje
        elif p.tipo == 'opcion_multiple':
            if isinstance(respuesta_usuario, list) and sorted(respuesta_usuario) == sorted(correcta):
                puntaje_total += p.puntaje
        # Para texto_corto no se evalúa automáticamente

    porcentaje = (puntaje_total / puntaje_maximo * 100) if puntaje_maximo else 0
    aprobado = porcentaje >= examen.puntaje_aprobacion

    respuesta = RespuestaUsuario(
        examen_id=id,
        usuario_id=user_id,
        respuestas=respuestas,
        fecha_envio=db.func.now(),
        puntaje_obtenido=puntaje_total,
        porcentaje=porcentaje,
        aprobado=aprobado,
        estado='finalizado'
    )
    db.session.add(respuesta)
    db.session.commit()

    return jsonify({
        'puntaje': round(porcentaje, 1),
        'aprobado': aprobado,
        'puntajeObtenido': puntaje_total,
        'puntajeMaximo': puntaje_maximo
    }), 200

@bp.route('/teoricas/resultados', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_resultados_teoricos():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    resultados = RespuestaUsuario.query.filter_by(usuario_id=user_id).order_by(RespuestaUsuario.fecha_envio.desc()).all()
    return jsonify([{
        'id': r.id,
        'examenId': r.examen_id,
        'fecha': r.fecha_envio.isoformat() if r.fecha_envio else None,
        'puntaje': r.porcentaje,
        'aprobado': r.aprobado
    } for r in resultados]), 200


# ==================== OBTENER UNA EVALUACIÓN POR ID ====================
@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_evaluacion(id):
    """Obtiene una evaluación con sus puntuaciones y comentarios"""
    evaluacion = Evaluacion.query.get_or_404(id)
    
    # Obtener puntuaciones
    puntuaciones = []
    for p in PuntuacionEvaluacion.query.filter_by(evaluacion_id=evaluacion.id).all():
        puntuaciones.append({
            'criterioId': str(p.criterio_id),
            'puntuacion': p.puntuacion
        })
    
    return jsonify({
        'id': evaluacion.id,
        'titulo': evaluacion.titulo,
        'usuarioId': evaluacion.usuario_id,
        'rubricaId': evaluacion.rubrica_id,
        'fecha': evaluacion.fecha_entrega.isoformat() if evaluacion.fecha_entrega else None,
        'estado': evaluacion.estado,
        'puntuacionTotal': evaluacion.puntuacion_total,
        'comentarios': evaluacion.comentarios,
        'puntuaciones': puntuaciones,
        'video_url': evaluacion.video_url
    }), 200
@bp.route('/videos', methods=['POST'])
@jwt_required()
def subir_video_practica():
    """Sube un video de práctica y crea una evaluación pendiente"""
    user_id = get_jwt_identity()
    
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    rubrica_id = request.form.get('rubricaId')
    archivo = request.files.get('archivo')
    
    if not titulo or not rubrica_id or not archivo:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400
    
    # Validar extensión de video
    ALLOWED_EXTENSIONS = {'mp4', 'webm', 'ogg', 'mov', 'avi'}
    if '.' in archivo.filename:
        ext = archivo.filename.rsplit('.', 1)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({'error': 'Formato de video no permitido'}), 400
    
    # Guardar archivo
    filename = secure_filename(f"{user_id}_{datetime.now().timestamp()}_{archivo.filename}")
    upload_folder = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'videos_practica')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    archivo.save(filepath)
    
    # Crear evaluación pendiente
    evaluacion = Evaluacion(
        titulo=titulo,
        usuario_id=user_id,
        rubrica_id=rubrica_id,
        video_url=filepath,
        fecha_entrega=datetime.now(),
        estado='pendiente',
        comentarios=descripcion
    )
    db.session.add(evaluacion)
    db.session.commit()
    
    return jsonify({
        'id': evaluacion.id,
        'titulo': evaluacion.titulo,
        'message': 'Video subido correctamente'
    }), 201