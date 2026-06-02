from app import create_app, db
from app.models.usuario import Rol, Usuario
from app.models.video import VideoTutorial
from app.models.rubrica import Rubrica, Criterio
from app.models.foro import Foro
from app.models.insignia import Insignia
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Roles
    roles = ['admin', 'entrenador', 'atleta']
    for r in roles:
        if not Rol.query.filter_by(nombre=r).first():
            db.session.add(Rol(nombre=r, descripcion=f'Rol {r}'))
    db.session.commit()

    # Usuario admin
    if not Usuario.query.filter_by(email='admin@iqfoil.cu').first():
        admin = Usuario(email='admin@iqfoil.cu', password_hash=generate_password_hash('admin123'), nombre='Administrador', rol_id=1)
        db.session.add(admin)
        db.session.commit()
        # Configuración por defecto
        from app.models.usuario import ConfiguracionUsuario
        config = ConfiguracionUsuario(usuario_id=admin.id)
        db.session.add(config)
        db.session.commit()

    # Foros
    foros = ['Reglamento', 'Técnica', 'Material']
    for f in foros:
        if not Foro.query.filter_by(titulo=f).first():
            db.session.add(Foro(titulo=f, descripcion=f'Foro de {f}'))
    db.session.commit()

    # Insignias
    insignias = [
        {'nombre': 'Principiante', 'icono': '🌱', 'categoria': 'logro'},
        {'nombre': 'Navegante', 'icono': '⛵', 'categoria': 'logro'},
        {'nombre': 'Estratega', 'icono': '🏆', 'categoria': 'competencia'}
    ]
    for i in insignias:
        if not Insignia.query.filter_by(nombre=i['nombre']).first():
            db.session.add(Insignia(**i))
    db.session.commit()
    print("Datos iniciales insertados")