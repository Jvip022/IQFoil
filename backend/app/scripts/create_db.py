from app import create_app, db
from app.models.usuario import Rol, Usuario, ConfiguracionUsuario
from app.models.video import VideoTutorial
from app.models.rubrica import Rubrica, Criterio
from app.models.foro import Foro, Hilo, Mensaje
from app.models.documento import Documento
from app.models.insignia import Insignia
from app.models.evento import Evento
from app.models.mentoria import Mentoria

app = create_app()
with app.app_context():
    db.create_all()
    print("Tablas creadas correctamente")