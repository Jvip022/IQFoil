# backend/app/services/admin_service.py
from app.models.usuario import Usuario
from app.models.rol import Rol
from app import db

class AdminService:
    @staticmethod
    def get_all_users():
        return Usuario.query.all()

    @staticmethod
    def change_user_role(user_id, new_rol_id):
        user = Usuario.query.get_or_404(user_id)
        user.rol_id = new_rol_id
        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        user = Usuario.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return True

    @staticmethod
    def get_roles():
        return Rol.query.all()