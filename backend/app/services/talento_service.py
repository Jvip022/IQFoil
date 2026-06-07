# backend/app/services/talento_service.py
from app.models.insignia import Insignia
from app.models.usuario_insignia import UsuarioInsignia
from app.models.log_actividad import LogActividad
from app import db

class TalentoService:
    @staticmethod
    def get_user_badges(user_id):
        return UsuarioInsignia.query.filter_by(usuario_id=user_id).all()

    @staticmethod
    def award_badge(user_id, insignia_id):
        exists = UsuarioInsignia.query.filter_by(usuario_id=user_id, insignia_id=insignia_id).first()
        if not exists:
            ui = UsuarioInsignia(usuario_id=user_id, insignia_id=insignia_id)
            db.session.add(ui)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_recommendations(user_id):
        # Lógica simple: sugerir insignias no obtenidas
        obtained = [ui.insignia_id for ui in UsuarioInsignia.query.filter_by(usuario_id=user_id).all()]
        all_insignias = Insignia.query.all()
        recommendations = [i for i in all_insignias if i.id not in obtained]
        return recommendations