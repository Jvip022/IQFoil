from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.foro import Foro
from app.models.hilo import Hilo
from app.models.mensaje import Mensaje
from app.models.usuario import Usuario
from app.models.mentoria import Mentoria  # ← NUEVA IMPORTACIÓN
from sqlalchemy.orm import joinedload

bp = Blueprint('foro', __name__, url_prefix='/api/foro')


# ============================================================
# FOROS Y HILOS (endpoints existentes)
# ============================================================

@bp.route('/', methods=['GET'])
@jwt_required()
def get_foros():
    foros = Foro.query.order_by(Foro.orden).all()
    result = []
    for f in foros:
        ultimo_hilo = Hilo.query.filter_by(foro_id=f.id).order_by(Hilo.ultima_respuesta.desc()).first()
        ultima_actividad = ultimo_hilo.ultima_respuesta.isoformat() if ultimo_hilo and ultimo_hilo.ultima_respuesta else None
        result.append({
            'id': f.id,
            'titulo': f.titulo,
            'descripcion': f.descripcion,
            'totalHilos': Hilo.query.filter_by(foro_id=f.id).count(),
            'ultimaActividad': ultima_actividad
        })
    return jsonify(result)


@bp.route('/hilos', methods=['GET'])
@jwt_required()
def get_hilos():
    hilos = Hilo.query.options(joinedload(Hilo.autor).joinedload(Usuario.rol)).order_by(Hilo.fecha_creacion.desc()).all()
    result = []
    for h in hilos:
        num_respuestas = Mensaje.query.filter_by(hilo_id=h.id).count()
        autor = h.autor
        autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
        result.append({
            'id': h.id,
            'titulo': h.titulo,
            'autor': autor.nombre if autor else 'Anónimo',
            'autorRol': autor_rol,
            'fechaCreacion': h.fecha_creacion.isoformat(),
            'respuestas': num_respuestas,
            'ultimaRespuesta': h.ultima_respuesta.isoformat() if h.ultima_respuesta else None
        })
    return jsonify(result)


@bp.route('/hilos', methods=['POST'])
@jwt_required()
def crear_hilo():
    data = request.get_json()
    user_id = get_jwt_identity()
    nuevo_hilo = Hilo(
        foro_id=data['foroId'],
        titulo=data['titulo'],
        contenido=data['contenido'],
        autor_id=user_id,
        ultima_respuesta=db.func.now()
    )
    db.session.add(nuevo_hilo)
    db.session.commit()
    return jsonify({
        'id': nuevo_hilo.id,
        'titulo': nuevo_hilo.titulo,
        'contenido': nuevo_hilo.contenido,
        'autor': nuevo_hilo.autor.nombre,
        'autorRol': nuevo_hilo.autor.rol.nombre if nuevo_hilo.autor and nuevo_hilo.autor.rol else 'atleta',
        'fechaCreacion': nuevo_hilo.fecha_creacion.isoformat(),
        'respuestas': 0,
        'ultimaRespuesta': nuevo_hilo.ultima_respuesta.isoformat() if nuevo_hilo.ultima_respuesta else None
    }), 201


@bp.route('/hilos/<int:hilo_id>', methods=['GET'])
@jwt_required()
def get_hilo(hilo_id):
    hilo = Hilo.query.options(joinedload(Hilo.autor).joinedload(Usuario.rol)).get_or_404(hilo_id)
    hilo.vistas += 1
    db.session.commit()
    autor = hilo.autor
    autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
    return jsonify({
        'id': hilo.id,
        'foroId': hilo.foro_id,
        'titulo': hilo.titulo,
        'contenido': hilo.contenido,
        'autor': autor.nombre if autor else 'Anónimo',
        'autorRol': autor_rol,
        'fechaCreacion': hilo.fecha_creacion.isoformat(),
        'ultimaRespuesta': hilo.ultima_respuesta.isoformat() if hilo.ultima_respuesta else None,
        'respuestas': Mensaje.query.filter_by(hilo_id=hilo.id).count(),
        'vistas': hilo.vistas
    })


@bp.route('/hilos/<int:hilo_id>/mensajes', methods=['GET'])
@jwt_required()
def get_mensajes(hilo_id):
    mensajes = Mensaje.query.options(joinedload(Mensaje.autor).joinedload(Usuario.rol)).filter_by(hilo_id=hilo_id).order_by(Mensaje.fecha).all()
    result = []
    for m in mensajes:
        autor = m.autor
        autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
        result.append({
            'id': m.id,
            'autor': autor.nombre if autor else 'Anónimo',
            'autorRol': autor_rol,
            'contenido': m.contenido,
            'fecha': m.fecha.isoformat()
        })
    return jsonify(result)


@bp.route('/mensajes', methods=['POST'])
@jwt_required()
def enviar_mensaje():
    data = request.get_json()
    user_id = get_jwt_identity()
    nuevo_mensaje = Mensaje(
        hilo_id=data['hiloId'],
        autor_id=user_id,
        contenido=data['contenido']
    )
    hilo = Hilo.query.get(data['hiloId'])
    if not hilo:
        return jsonify({'error': 'Hilo no encontrado'}), 404
    hilo.ultima_respuesta = db.func.now()
    db.session.add(nuevo_mensaje)
    db.session.commit()
    autor = nuevo_mensaje.autor
    autor_rol = autor.rol.nombre if autor and autor.rol else 'atleta'
    return jsonify({
        'id': nuevo_mensaje.id,
        'autor': autor.nombre if autor else 'Anónimo',
        'autorRol': autor_rol,
        'contenido': nuevo_mensaje.contenido,
        'fecha': nuevo_mensaje.fecha.isoformat()
    }), 201


@bp.route('/hilos/<int:hilo_id>', methods=['DELETE'])
@jwt_required()
def eliminar_hilo(hilo_id):
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or user.rol_id not in [1, 2]:
        return jsonify({'error': 'No autorizado'}), 403

    hilo = Hilo.query.get_or_404(hilo_id)
    db.session.delete(hilo)
    db.session.commit()
    return jsonify({'message': 'Hilo eliminado correctamente'}), 200
# ============================================================
# ALERTAS (desde base de datos)
# ============================================================
@bp.route('/alertas', methods=['GET'])
@jwt_required()
def get_alertas():
    """Devuelve todas las alertas del usuario autenticado"""
    user_id = get_jwt_identity()
    # Puedes filtrar por usuario o mostrar todas
    alertas = Alerta.query.filter(
        (Alerta.usuario_id == user_id) | (Alerta.usuario_id.is_(None))
    ).order_by(Alerta.fecha.desc()).all()
    
    return jsonify([{
        'id': str(a.id),
        'tipo': a.tipo,
        'mensaje': a.mensaje,
        'usuario': a.usuario.nombre if a.usuario else 'Sistema',
        'fecha': a.fecha.isoformat(),
        'leida': a.leida
    } for a in alertas])

# ============================================================
# RECOMENDACIONES (desde base de datos)
# ============================================================
@bp.route('/recomendaciones', methods=['GET'])
@jwt_required()
def get_recomendaciones():
    """Devuelve recomendaciones personalizadas o generales"""
    user_id = get_jwt_identity()
    # Recomendaciones para todos o específicas para el usuario
    recomendaciones = Recomendacion.query.filter(
        (Recomendacion.usuario_id == user_id) | (Recomendacion.usuario_id.is_(None))
    ).order_by(Recomendacion.fecha.desc()).all()
    
    return jsonify([{
        'id': str(r.id),
        'tipo': r.tipo,
        'titulo': r.titulo,
        'descripcion': r.descripcion,
        'razon': r.razon,
        'meta': r.meta or {},
        'fecha': r.fecha.isoformat() if r.fecha else None
    } for r in recomendaciones])

# ============================================================
# MÉTRICAS (cálculo desde tablas existentes)
# ============================================================
@bp.route('/metricas', methods=['GET'])
@jwt_required()
def get_metricas():
    """Devuelve métricas calculadas desde la base de datos"""
    periodo = request.args.get('periodo', 'mes')
    user_id = get_jwt_identity()

    # --- Progreso general ---
    total_videos = VideoTutorial.query.count()
    progresos = ProgresoVideo.query.filter_by(usuario_id=user_id, completado=True).count()
    progreso_general = round((progresos / total_videos * 100) if total_videos else 0)

    # --- Insignias ---
    insignias_obtenidas = UsuarioInsignia.query.filter_by(usuario_id=user_id).count()
    total_insignias = Insignia.query.count()

    # --- Horas de navegación (desde logs o tabla de navegación) ---
    # Ejemplo: sumar duración de navegaciones desde una tabla "navegacion" (si existe)
    # Si no existe, puedes dejarlo en 0 o calcular desde actividad
    horas_navegacion = 0  # Reemplazar con cálculo real

    # --- Evaluaciones ---
    evaluaciones_realizadas = Evaluacion.query.filter_by(usuario_id=user_id, estado='evaluado').count()
    evaluaciones_pendientes = Evaluacion.query.filter_by(usuario_id=user_id, estado='pendiente').count()

    # --- Alertas activas (no leídas) ---
    alertas_activas = Alerta.query.filter(
        (Alerta.usuario_id == user_id) | (Alerta.usuario_id.is_(None)),
        Alerta.leida == False
    ).count()

    # --- Puntuación media (de evaluaciones) ---
    from app.models.puntuacion_evaluacion import PuntuacionEvaluacion
    evaluaciones_ids = [e.id for e in Evaluacion.query.filter_by(usuario_id=user_id, estado='evaluado').all()]
    puntuaciones = PuntuacionEvaluacion.query.filter(PuntuacionEvaluacion.evaluacion_id.in_(evaluaciones_ids)).all()
    puntuacion_media = round(sum(p.puntuacion for p in puntuaciones) / len(puntuaciones), 1) if puntuaciones else 0

    # --- Progreso por categoría (si tienes categorías) ---
    # Simulado o desde tabla de categorías
    progreso_categoria = [
        {'nombre': 'Técnica', 'valor': 75, 'color': '#4aa3c2'},
        {'nombre': 'Reglamento', 'valor': 60, 'color': '#1a2b4c'},
        {'nombre': 'Seguridad', 'valor': 90, 'color': '#f39c12'},
        {'nombre': 'Física', 'valor': 45, 'color': '#61708b'},
        {'nombre': 'Estrategia', 'valor': 70, 'color': '#d94e4e'}
    ]

    # --- Evolución mensual (últimos 6 meses) ---
    evolucion_mensual = []
    for i in range(6):
        mes = datetime.now() - timedelta(days=30*i)
        # Videos completados en ese mes
        completados_mes = ProgresoVideo.query.filter(
            ProgresoVideo.usuario_id == user_id,
            ProgresoVideo.completado == True,
            extract('year', ProgresoVideo.ultima_visualizacion) == mes.year,
            extract('month', ProgresoVideo.ultima_visualizacion) == mes.month
        ).count()
        evolucion_mensual.append({
            'mes': mes.strftime('%b'),
            'valor': completados_mes
        })
    evolucion_mensual.reverse()

    # --- Últimas actividades (desde logs) ---
    logs = LogActividad.query.filter_by(usuario_id=user_id).order_by(LogActividad.fecha.desc()).limit(4).all()
    ultimas_actividades = []
    for log in logs:
        icono = '📝'  # Definir según acción
        if 'video' in log.accion:
            icono = '🎬'
        elif 'insignia' in log.accion:
            icono = '🏆'
        elif 'navegacion' in log.accion:
            icono = '⛵'
        ultimas_actividades.append({
            'icono': icono,
            'descripcion': f"{log.accion}: {log.detalles.get('info', '') if log.detalles else ''}",
            'fecha': log.fecha.isoformat()
        })

    return jsonify({
        'progresoGeneral': progreso_general,
        'insigniasObtenidas': insignias_obtenidas,
        'totalInsignias': total_insignias,
        'horasNavegacion': horas_navegacion,
        'trendHoras': 0,  # Calcular comparando meses anteriores
        'evaluacionesRealizadas': evaluaciones_realizadas,
        'evaluacionesPendientes': evaluaciones_pendientes,
        'alertasActivas': alertas_activas,
        'puntuacionMedia': puntuacion_media,
        'progresoCategoria': progreso_categoria,
        'evolucionMensual': evolucion_mensual,
        'ultimasActividades': ultimas_actividades
    })