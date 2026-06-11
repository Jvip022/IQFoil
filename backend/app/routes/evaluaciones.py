from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.evaluacion import Evaluacion
from app.models.rubrica import Rubrica
from app.models.criterio import Criterio
from app.models.puntuacion_evaluacion import PuntuacionEvaluacion
from app.models.usuario import Usuario

bp = Blueprint('evaluaciones', __name__, url_prefix='/api/evaluaciones')

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
    # Asumiendo que hay una tabla de videos de práctica (VideoPractica), usamos Evaluacion como ejemplo
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
    # Guardar puntuaciones por criterio
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
    """Retorna lista de exámenes teóricos activos"""
    if request.method == 'OPTIONS':
        return '', 200
    # Por ahora devolver lista vacía hasta que implementes la lógica real
    return jsonify([]), 200

@bp.route('/teoricas/examenes/<int:id>', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_examen_teorico(id):
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'error': 'No implementado'}), 404

@bp.route('/teoricas/preguntas', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_preguntas_teoricas():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify([]), 200