from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.insignia import Insignia
from app.models.usuario_insignia import UsuarioInsignia
from app.models.usuario import Usuario
from app.models.evaluacion import Evaluacion
from app.models.progreso_video import ProgresoVideo
from app.models.video import VideoTutorial
from app.models.mentoria import Mentoria
from datetime import datetime, timedelta  
from app.models.alerta import Alerta
from app.models.recomendacion import Recomendacion

bp = Blueprint('talentos', __name__, url_prefix='/api/talentos')


# ============================================================
# INSIGNIAS (existente)
# ============================================================
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


# ============================================================
# ALERTAS (mejorado con más datos mock)
# ============================================================
@bp.route('/alertas', methods=['GET'])
@jwt_required()
def get_alertas():
    """Devuelve alertas simuladas (puedes reemplazar por una tabla real)"""
    alertas = [
        {
            'id': '1',
            'tipo': 'nuevo-talento',
            'mensaje': 'María Pérez ha completado el nivel avanzado de foil con un 95% de puntuación.',
            'usuario': 'María Pérez',
            'fecha': (datetime.now() - timedelta(hours=2)).isoformat(),
            'leida': False
        },
        {
            'id': '2',
            'tipo': 'logro-destacado',
            'mensaje': 'Juan Martínez obtuvo la insignia "Navegante Experto" después de 10 horas de navegación.',
            'usuario': 'Juan Martínez',
            'fecha': (datetime.now() - timedelta(days=1)).isoformat(),
            'leida': False
        },
        {
            'id': '3',
            'tipo': 'recomendacion',
            'mensaje': 'Se recomienda a Ana García para el programa de alto rendimiento por su progreso excepcional.',
            'usuario': 'Ana García',
            'fecha': (datetime.now() - timedelta(days=3)).isoformat(),
            'leida': True
        },
        {
            'id': '4',
            'tipo': 'nuevo-talento',
            'mensaje': 'Carlos López ha completado 5 videos de técnica y muestra un progreso del 80%.',
            'usuario': 'Carlos López',
            'fecha': (datetime.now() - timedelta(hours=12)).isoformat(),
            'leida': False
        }
    ]
    return jsonify(alertas)


# ============================================================
# RECOMENDACIONES (mejorado con más datos mock)
# ============================================================
@bp.route('/recomendaciones', methods=['GET'])
@jwt_required()
def get_recomendaciones():
    """Devuelve recomendaciones simuladas (puedes reemplazar por lógica real)"""
    recomendaciones = [
        {
            'id': '1',
            'tipo': 'curso',
            'titulo': 'Técnicas de foils avanzadas',
            'descripcion': 'Domina las técnicas de foil en condiciones de viento fuerte y olas.',
            'razon': 'Has completado el nivel intermedio con un 85% de progreso.',
            'meta': {'duracion': '6 módulos', 'nivel': 'Avanzado'}
        },
        {
            'id': '2',
            'tipo': 'mentoria',
            'titulo': 'Mentoría con Carlos Sainz',
            'descripcion': 'Sesiones personalizadas para mejorar tu estrategia de regata.',
            'razon': 'Has participado en 3 regatas y tu puntuación ha mejorado un 20%.',
            'meta': {'duracion': '4 sesiones', 'nivel': 'Todos los niveles'}
        },
        {
            'id': '3',
            'tipo': 'evento',
            'titulo': 'Regata Nacional de Foil 2025',
            'descripcion': 'Participa en la competición nacional y pon a prueba tus habilidades.',
            'razon': 'Tu rendimiento en las últimas regatas te sitúa en el top 10 regional.',
            'meta': {'duracion': '3 días', 'nivel': 'Competitivo'}
        }
    ]
    return jsonify(recomendaciones)


# ============================================================
# NUEVO ENDPOINT: MÉTRICAS (para el panel de métricas)
# ============================================================
@bp.route('/metricas', methods=['GET'])
@jwt_required()
def get_metricas():
    """Devuelve métricas para el panel de talentos según período"""
    periodo = request.args.get('periodo', 'mes')
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)

    # --- Cálculos reales (o simulados si no hay datos) ---

    # Progreso general
    total_videos = VideoTutorial.query.count()
    progresos = ProgresoVideo.query.filter_by(usuario_id=user_id, completado=True).count()
    progreso_general = round((progresos / total_videos * 100) if total_videos else 0)

    # Insignias
    insignias_obtenidas = UsuarioInsignia.query.filter_by(usuario_id=user_id).count()
    total_insignias = Insignia.query.count()

    # Horas de navegación (simulado - puedes calcularlo desde logs o tabla de navegación)
    # Por ahora usamos un valor mock que varía según el período
    base_horas = 245
    if periodo == 'semana':
        horas_navegacion = round(base_horas * 0.3)
    elif periodo == 'trimestre':
        horas_navegacion = round(base_horas * 1.2)
    elif periodo == 'año':
        horas_navegacion = round(base_horas * 1.8)
    elif periodo == 'todo':
        horas_navegacion = round(base_horas * 2.5)
    else:  # mes
        horas_navegacion = base_horas

    trend_horas = 12  # tendencia positiva

    # Evaluaciones
    evaluaciones_realizadas = Evaluacion.query.filter_by(usuario_id=user_id, estado='evaluado').count()
    evaluaciones_pendientes = Evaluacion.query.filter_by(usuario_id=user_id, estado='pendiente').count()

    # Alertas activas (simulado)
    alertas_activas = 2

    # Puntuación media (simulado)
    puntuacion_media = 8.4

    # Progreso por categoría (simulado - puedes obtenerlo de una tabla de categorías)
    progreso_categoria = [
        {'nombre': 'Técnica', 'valor': 75, 'color': '#4aa3c2'},
        {'nombre': 'Reglamento', 'valor': 60, 'color': '#1a2b4c'},
        {'nombre': 'Seguridad', 'valor': 90, 'color': '#f39c12'},
        {'nombre': 'Física', 'valor': 45, 'color': '#61708b'},
        {'nombre': 'Estrategia', 'valor': 70, 'color': '#d94e4e'}
    ]

    # Evolución mensual (simulado o real si tienes datos)
    # Si tienes datos de progreso por mes, puedes consultarlos; usamos mock por ahora
    evolucion_mensual = [
        {'mes': 'Ene', 'valor': 45},
        {'mes': 'Feb', 'valor': 52},
        {'mes': 'Mar', 'valor': 58},
        {'mes': 'Abr', 'valor': 63},
        {'mes': 'May', 'valor': 70},
        {'mes': 'Jun', 'valor': 68}
    ]

    # Últimas actividades (simulado)
    ultimas_actividades = [
        {'icono': '🏆', 'descripcion': 'Insignia "Estratega" obtenida', 'fecha': (datetime.now() - timedelta(days=2)).isoformat()},
        {'icono': '📝', 'descripcion': 'Evaluación de técnica completada', 'fecha': (datetime.now() - timedelta(days=5)).isoformat()},
        {'icono': '⛵', 'descripcion': 'Navegación de 4 horas registrada', 'fecha': (datetime.now() - timedelta(days=7)).isoformat()},
        {'icono': '🔔', 'descripcion': 'Nueva alerta: talento detectado', 'fecha': (datetime.now() - timedelta(days=9)).isoformat()}
    ]

    return jsonify({
        'progresoGeneral': progreso_general,
        'insigniasObtenidas': insignias_obtenidas,
        'totalInsignias': total_insignias,
        'horasNavegacion': horas_navegacion,
        'trendHoras': trend_horas,
        'evaluacionesRealizadas': evaluaciones_realizadas,
        'evaluacionesPendientes': evaluaciones_pendientes,
        'alertasActivas': alertas_activas,
        'puntuacionMedia': puntuacion_media,
        'progresoCategoria': progreso_categoria,
        'evolucionMensual': evolucion_mensual,
        'ultimasActividades': ultimas_actividades
    })


# ============================================================
# OTROS ENDPOINTS PARA DASHBOARD (existentes)
# ============================================================

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