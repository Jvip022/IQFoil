from app import create_app, db
from app.models import (
    Usuario, Rol, VideoTutorial, ProgresoVideo,
    Evaluacion, PuntuacionEvaluacion, Rubrica, Criterio,
    Insignia, UsuarioInsignia, LogActividad,
    Documento, Evento, Curso
)
from datetime import datetime, timedelta
import random

# ============================================
# FUNCIONES (sin cambios, las mismas de antes)
# ============================================
def ensure_roles():
    roles = [
        {'id': 1, 'nombre': 'admin', 'descripcion': 'Administrador'},
        {'id': 2, 'nombre': 'entrenador', 'descripcion': 'Entrenador'},
        {'id': 3, 'nombre': 'atleta', 'descripcion': 'Atleta'}
    ]
    for r in roles:
        if not Rol.query.get(r['id']):
            db.session.add(Rol(**r))
    db.session.commit()
    print("✅ Roles asegurados")

def ensure_users():
    usuarios_data = [
        {'id': 6, 'email': 'atleta4@iqfoil.cu', 'nombre': 'Luis Fernández', 'rol_id': 3, 'provincia': 'Camagüey'},
        {'id': 7, 'email': 'atleta5@iqfoil.cu', 'nombre': 'Ana Torres', 'rol_id': 3, 'provincia': 'Santiago de Cuba'},
        {'id': 8, 'email': 'atleta6@iqfoil.cu', 'nombre': 'José Ramírez', 'rol_id': 3, 'provincia': 'Holguín'},
        {'id': 9, 'email': 'atleta7@iqfoil.cu', 'nombre': 'Marta Díaz', 'rol_id': 3, 'provincia': 'Villa Clara'},
        {'id': 10, 'email': 'atleta8@iqfoil.cu', 'nombre': 'Roberto Mena', 'rol_id': 3, 'provincia': 'La Habana'},
    ]
    for u_data in usuarios_data:
        if not Usuario.query.get(u_data['id']):
            u = Usuario(
                id=u_data['id'],
                email=u_data['email'],
                nombre=u_data['nombre'],
                rol_id=u_data['rol_id'],
                provincia=u_data['provincia'],
                activo=True,
                preferencias={'tema': 'claro', 'idioma': 'es', 'notificacionesEmail': True}
            )
            u.set_password('123456')
            db.session.add(u)
    db.session.commit()
    print(f"✅ {len(usuarios_data)} usuarios añadidos")

def ensure_videos():
    videos = [
        {'id': 10, 'titulo': 'Técnica de salida', 'descripcion': 'Salida en regata', 'url_video': 'uploads/videos/salida.mp4', 'duracion_seg': 300, 'nivel': 'principiante'},
        {'id': 11, 'titulo': 'Virada en ceñida', 'descripcion': 'Virada en ceñida', 'url_video': 'uploads/videos/virada_ceñida.mp4', 'duracion_seg': 450, 'nivel': 'intermedio'},
        {'id': 12, 'titulo': 'Trasluchada', 'descripcion': 'Trasluchada en popa', 'url_video': 'uploads/videos/trasluchada.mp4', 'duracion_seg': 600, 'nivel': 'avanzado'},
    ]
    for v_data in videos:
        if not VideoTutorial.query.get(v_data['id']):
            db.session.add(VideoTutorial(**v_data))
    db.session.commit()
    print("✅ Videos asegurados")

def create_progreso_videos():
    atletas = Usuario.query.filter_by(rol_id=3).all()
    videos = VideoTutorial.query.all()
    for atleta in atletas:
        for video in videos:
            progreso = random.choice([0, 30, 50, 70, 100])
            completado = progreso == 100
            dias_atras = random.randint(0, 180)
            fecha = datetime.now() - timedelta(days=dias_atras)
            existing = ProgresoVideo.query.filter_by(usuario_id=atleta.id, video_id=video.id).first()
            if not existing:
                pv = ProgresoVideo(
                    usuario_id=atleta.id,
                    video_id=video.id,
                    progreso=progreso,
                    completado=completado,
                    ultima_visualizacion=fecha
                )
                db.session.add(pv)
    db.session.commit()
    print("✅ Progreso de videos creado")

def ensure_rubrica():
    rubrica = Rubrica.query.get(1)
    if not rubrica:
        rubrica = Rubrica(id=1, titulo='Técnica de virada', descripcion='Evaluación de virada', creador_id=1)
        db.session.add(rubrica)
        db.session.commit()
        criterios = [
            {'id': 1, 'rubrica_id': 1, 'descripcion': 'Posición del cuerpo', 'puntuacion_maxima': 5},
            {'id': 2, 'rubrica_id': 1, 'descripcion': 'Timming', 'puntuacion_maxima': 5},
            {'id': 3, 'rubrica_id': 1, 'descripcion': 'Coordinación', 'puntuacion_maxima': 5},
        ]
        for c in criterios:
            if not Criterio.query.get(c['id']):
                db.session.add(Criterio(**c))
        db.session.commit()
    print("✅ Rúbrica asegurada")

def create_evaluaciones():
    atletas = Usuario.query.filter_by(rol_id=3).all()
    rubrica = Rubrica.query.get(1)
    if not rubrica:
        print("❌ No hay rúbrica, ejecuta ensure_rubrica primero")
        return
    for atleta in atletas:
        num_eval = random.randint(2, 4)
        for _ in range(num_eval):
            fecha = datetime.now() - timedelta(days=random.randint(0, 180))
            total = random.randint(5, 15)
            evaluacion = Evaluacion(
                titulo=f"Evaluación de {atleta.nombre}",
                usuario_id=atleta.id,
                evaluador_id=2,
                rubrica_id=rubrica.id,
                video_url=f"https://example.com/videos/{atleta.id}_{int(datetime.now().timestamp())}.mp4",
                fecha_entrega=fecha,
                fecha_evaluacion=fecha + timedelta(days=random.randint(1, 5)),
                estado=random.choice(['pendiente', 'evaluado']),
                comentarios=f"Comentario de prueba para {atleta.nombre}",
                puntuacion_total=total
            )
            db.session.add(evaluacion)
            db.session.flush()
            for criterio in rubrica.criterios:
                punt = random.randint(0, criterio.puntuacion_maxima)
                pe = PuntuacionEvaluacion(evaluacion_id=evaluacion.id, criterio_id=criterio.id, puntuacion=punt)
                db.session.add(pe)
    db.session.commit()
    print("✅ Evaluaciones creadas")

def ensure_insignias():
    insignias = [
        {'id': 1, 'nombre': 'Principiante', 'descripcion': 'Primer video completado', 'icono': '🌱', 'categoria': 'logro', 'color': '#4caf50', 'requisitos': 'Completar 1 video'},
        {'id': 2, 'nombre': 'Navegante', 'descripcion': '10 horas de navegación', 'icono': '⛵', 'categoria': 'logro', 'color': '#2196f3', 'requisitos': '10 horas navegadas'},
        {'id': 3, 'nombre': 'Estratega', 'descripcion': 'Participación en 5 regatas', 'icono': '🏆', 'categoria': 'competencia', 'color': '#ff9800', 'requisitos': '5 regatas'},
    ]
    for i in insignias:
        if not Insignia.query.get(i['id']):
            db.session.add(Insignia(**i))
    db.session.commit()
    print("✅ Insignias aseguradas")

def assign_insignias():
    atletas = Usuario.query.filter_by(rol_id=3).all()
    insignias = Insignia.query.all()
    for atleta in atletas:
        num = random.randint(1, 2)
        selected = random.sample(insignias, min(num, len(insignias)))
        for ins in selected:
            if not UsuarioInsignia.query.filter_by(usuario_id=atleta.id, insignia_id=ins.id).first():
                ui = UsuarioInsignia(
                    usuario_id=atleta.id,
                    insignia_id=ins.id,
                    fecha_obtenida=datetime.now() - timedelta(days=random.randint(0, 180))
                )
                db.session.add(ui)
    db.session.commit()
    print("✅ Insignias asignadas")

def create_logs():
    usuarios = Usuario.query.all()
    acciones = ['login', 'ver_video', 'completar_video', 'subir_documento', 'crear_hilo', 'responder_hilo']
    for usuario in usuarios:
        num_logs = random.randint(5, 15)
        for _ in range(num_logs):
            fecha = datetime.now() - timedelta(days=random.randint(0, 180))
            accion = random.choice(acciones)
            detalles = {'info': f'Acción {accion}'}
            ip = f"192.168.1.{random.randint(1,255)}"
            log = LogActividad(
                usuario_id=usuario.id,
                accion=accion,
                detalles=detalles,
                ip=ip,
                fecha=fecha
            )
            db.session.add(log)
    db.session.commit()
    print("✅ Logs de actividad creados")

def ensure_documentos():
    docs = [
        {'id': 10, 'titulo': 'Reglamento 2025', 'descripcion': 'Nuevo reglamento', 'tipo': 'pdf', 'url_archivo': 'documentos/reglamento2025.pdf', 'tamano_bytes': 2500000, 'autor_id': 1, 'version': 1, 'aprobado': True},
        {'id': 11, 'titulo': 'Plan de entrenamiento avanzado', 'descripcion': 'Plan para atletas de alto rendimiento', 'tipo': 'pdf', 'url_archivo': 'documentos/plan_avanzado.pdf', 'tamano_bytes': 1800000, 'autor_id': 2, 'version': 1, 'aprobado': True},
    ]
    for d in docs:
        if not Documento.query.get(d['id']):
            db.session.add(Documento(**d))
    db.session.commit()
    print("✅ Documentos asegurados")

def ensure_eventos():
    eventos = [
        {'id': 10, 'titulo': 'Regata de otoño', 'descripcion': 'Regata de otoño', 'fecha_inicio': datetime.now() + timedelta(days=30), 'lugar': 'Club Náutico', 'tipo': 'regata', 'organizador_id': 1, 'publico': True},
        {'id': 11, 'titulo': 'Entrenamiento de foil', 'descripcion': 'Entrenamiento de foil', 'fecha_inicio': datetime.now() + timedelta(days=15), 'lugar': 'Puerto Deportivo', 'tipo': 'entrenamiento', 'organizador_id': 2, 'publico': True},
    ]
    for e in eventos:
        if not Evento.query.get(e['id']):
            db.session.add(Evento(**e))
    db.session.commit()
    print("✅ Eventos asegurados")

# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================
def run_all():
    app = create_app()
    with app.app_context():
        print("🚀 Iniciando seed de datos de prueba para reportes...")
        ensure_roles()
        ensure_users()
        ensure_videos()
        create_progreso_videos()
        ensure_rubrica()
        create_evaluaciones()
        ensure_insignias()
        assign_insignias()
        create_logs()
        ensure_documentos()
        ensure_eventos()
        print("🎉 ¡Datos de prueba para reportes creados exitosamente!")

if __name__ == "__main__":
    run_all()