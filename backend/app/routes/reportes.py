from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.progreso_video import ProgresoVideo
from app.models.evaluacion import Evaluacion
from app.models.puntuacion_evaluacion import PuntuacionEvaluacion
from app.models.documento import Documento
from app.models.insignia import Insignia
from app.models.usuario_insignia import UsuarioInsignia
from app.models.log_actividad import LogActividad
from datetime import datetime, timedelta
from sqlalchemy import func, extract

bp = Blueprint('reportes', __name__, url_prefix='/api/reportes')

def is_entrenador_o_admin(user_id):
    user = Usuario.query.get(user_id)
    return user and user.rol_id in [1, 2]  # 1=admin, 2=entrenador

def is_admin(user_id):
    user = Usuario.query.get(user_id)
    return user and user.rol_id == 1

# ==================== UC-54: Reporte progreso individual ====================
@bp.route('/progreso-individual/<int:usuario_id>', methods=['GET'])
@jwt_required()
def reporte_progreso_individual(usuario_id):
    current_user_id = get_jwt_identity()
    current_user = Usuario.query.get(current_user_id)
    # Solo el mismo usuario, entrenador o admin pueden ver
    if current_user_id != usuario_id and not is_entrenador_o_admin(current_user_id):
        return jsonify({'error': 'No autorizado'}), 403

    # Videos vistos y progreso
    progresos = ProgresoVideo.query.filter_by(usuario_id=usuario_id).all()
    total_videos = db.session.query(func.count(VideoTutorial.id)).scalar()
    videos_completados = sum(1 for p in progresos if p.completado)
    progreso_global = (videos_completados / total_videos * 100) if total_videos else 0

    # Evaluaciones realizadas
    evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario_id).all()
    evaluaciones_ids = [e.id for e in evaluaciones]
    puntuaciones = PuntuacionEvaluacion.query.filter(PuntuacionEvaluacion.evaluacion_id.in_(evaluaciones_ids)).all()
    nota_promedio = sum(p.puntuacion for p in puntuaciones) / len(puntuaciones) if puntuaciones else 0

    # Insignias obtenidas
    insignias = db.session.query(Insignia).join(UsuarioInsignia).filter(UsuarioInsignia.usuario_id == usuario_id).all()
    lista_insignias = [{'id': i.id, 'nombre': i.nombre, 'fecha': ui.fecha_obtenida.isoformat()} for i, ui in zip(insignias, UsuarioInsignia.query.filter_by(usuario_id=usuario_id).all())]

    # Evolución temporal (últimos 6 meses)
    evolucion = []
    for i in range(6):
        mes = datetime.now() - timedelta(days=30*i)
        # Contar videos completados en ese mes
        completados_mes = ProgresoVideo.query.filter(
            ProgresoVideo.usuario_id == usuario_id,
            ProgresoVideo.completado == True,
            extract('year', ProgresoVideo.ultimo_acceso) == mes.year,
            extract('month', ProgresoVideo.ultimo_acceso) == mes.month
        ).count()
        evolucion.append({
            'mes': mes.strftime('%b %Y'),
            'videos_completados': completados_mes,
            'puntuacion_promedio': 0  # se puede calcular con evaluaciones
        })

    return jsonify({
        'usuario_id': usuario_id,
        'nombre': Usuario.query.get(usuario_id).nombre,
        'progreso_global': round(progreso_global, 1),
        'videos_vistos': videos_completados,
        'total_videos': total_videos,
        'evaluaciones_realizadas': len(evaluaciones),
        'nota_promedio': round(nota_promedio, 1),
        'insignias': lista_insignias,
        'evolucion': evolucion
    })

# ==================== UC-55: Reporte comparativo provincial ====================
@bp.route('/comparativo-provincial', methods=['GET'])
@jwt_required()
def reporte_comparativo_provincial():
    current_user_id = get_jwt_identity()
    if not is_entrenador_o_admin(current_user_id):
        return jsonify({'error': 'Solo entrenadores o administradores'}), 403

    # Asumiendo que los usuarios tienen un campo 'provincia' (no está en modelo, se puede añadir). Por ahora, simulamos agrupación por rol.
    # Para demo, agrupamos por rol_id (atleta, entrenador, admin) pero ideal sería provincia.
    # Como el modelo no tiene provincia, se puede obtener desde una relación o agregar columna. Para simplificar, agrupamos por usuario.
    usuarios = Usuario.query.all()
    reporte = []
    for u in usuarios:
        progresos = ProgresoVideo.query.filter_by(usuario_id=u.id).all()
        videos_completados = sum(1 for p in progresos if p.completado)
        total_videos = db.session.query(func.count(VideoTutorial.id)).scalar()
        progreso = (videos_completados / total_videos * 100) if total_videos else 0
        # Evaluaciones
        evaluaciones = Evaluacion.query.filter_by(usuario_id=u.id).count()
        reporte.append({
            'usuario_id': u.id,
            'nombre': u.nombre,
            'provincia': getattr(u, 'provincia', 'Sin asignar'),  # campo hipotético
            'progreso_global': round(progreso, 1),
            'evaluaciones': evaluaciones
        })
    # Ordenar por provincia
    reporte.sort(key=lambda x: x['provincia'])
    return jsonify(reporte)

# ==================== UC-56: Reporte talentos ====================
@bp.route('/talentos', methods=['GET'])
@jwt_required()
def reporte_talentos():
    current_user_id = get_jwt_identity()
    if not is_entrenador_o_admin(current_user_id):
        return jsonify({'error': 'No autorizado'}), 403

    # Criterio de talento: usuarios con alto progreso y muchas insignias
    usuarios = Usuario.query.all()
    talentos = []
    for u in usuarios:
        progresos = ProgresoVideo.query.filter_by(usuario_id=u.id).all()
        completados = sum(1 for p in progresos if p.completado)
        total_videos = db.session.query(func.count(VideoTutorial.id)).scalar()
        progreso = (completados / total_videos * 100) if total_videos else 0
        insignias = UsuarioInsignia.query.filter_by(usuario_id=u.id).count()
        evaluaciones = Evaluacion.query.filter_by(usuario_id=u.id).count()
        puntuaciones = []
        for ev in Evaluacion.query.filter_by(usuario_id=u.id).all():
            punt = PuntuacionEvaluacion.query.filter_by(evaluacion_id=ev.id).all()
            puntuaciones.extend([p.puntuacion for p in punt])
        nota_promedio = sum(puntuaciones) / len(puntuaciones) if puntuaciones else 0

        # Score de talento (ponderación)
        score = (progreso * 0.4) + (insignias * 10) + (nota_promedio * 0.3)
        if score > 50:  # umbral
            talentos.append({
                'usuario_id': u.id,
                'nombre': u.nombre,
                'progreso': round(progreso, 1),
                'insignias': insignias,
                'nota_promedio': round(nota_promedio, 1),
                'score': round(score, 1)
            })
    talentos.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(talentos)

# ==================== UC-57: Reporte uso plataforma ====================
@bp.route('/uso-plataforma', methods=['GET'])
@jwt_required()
def reporte_uso_plataforma():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({'error': 'Solo administradores'}), 403

    # Estadísticas generales
    total_usuarios = Usuario.query.count()
    usuarios_activos_mes = Usuario.query.filter(Usuario.ultimo_acceso > datetime.now() - timedelta(days=30)).count()
    total_videos = db.session.query(func.count(VideoTutorial.id)).scalar()
    reproducciones_totales = ProgresoVideo.query.count()  # cada registro es una reproducción
    documentos_subidos = Documento.query.count()
    evaluaciones_realizadas = Evaluacion.query.count()

    # Uso por mes (últimos 12 meses)
    uso_mensual = []
    for i in range(12):
        mes = datetime.now() - timedelta(days=30*i)
        inicios_mes = LogActividad.query.filter(
            extract('year', LogActividad.fecha) == mes.year,
            extract('month', LogActividad.fecha) == mes.month
        ).count()
        uso_mensual.append({
            'mes': mes.strftime('%b %Y'),
            'actividades': inicios_mes
        })

    return jsonify({
        'usuarios_totales': total_usuarios,
        'usuarios_activos_mes': usuarios_activos_mes,
        'total_videos': total_videos,
        'reproducciones_totales': reproducciones_totales,
        'documentos_subidos': documentos_subidos,
        'evaluaciones_realizadas': evaluaciones_realizadas,
        'uso_mensual': uso_mensual[::-1]  # orden cronológico
    })

# ==================== UC-58: Reporte documentos desactualizados ====================
@bp.route('/documentos-desactualizados', methods=['GET'])
@jwt_required()
def reporte_documentos_desactualizados():
    current_user_id = get_jwt_identity()
    if not is_admin(current_user_id):
        return jsonify({'error': 'Solo administradores'}), 403

    # Documentos que no se han actualizado en más de 6 meses
    fecha_limite = datetime.now() - timedelta(days=180)
    documentos_antiguos = Documento.query.filter(Documento.fecha_subida < fecha_limite).all()
    resultado = []
    for d in documentos_antiguos:
        resultado.append({
            'id': d.id,
            'titulo': d.titulo,
            'tipo': d.tipo,
            'fecha_subida': d.fecha_subida.isoformat(),
            'dias_antiguo': (datetime.now() - d.fecha_subida).days,
            'autor': Usuario.query.get(d.autor_id).nombre if d.autor_id else 'Anónimo'
        })
    return jsonify(resultado)