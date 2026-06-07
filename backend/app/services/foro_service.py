# backend/app/services/foro_service.py
from app.models.hilo import Hilo
from app.models.mensaje import Mensaje
from app import db

class ForoService:
    @staticmethod
    def get_all_threads():
        return Hilo.query.order_by(Hilo.fecha_creacion.desc()).all()

    @staticmethod
    def create_thread(titulo, contenido, autor_id, categoria='general'):
        hilo = Hilo(titulo=titulo, autor_id=autor_id, categoria=categoria)
        db.session.add(hilo)
        db.session.flush()
        mensaje = Mensaje(contenido=contenido, autor_id=autor_id, hilo_id=hilo.id)
        db.session.add(mensaje)
        db.session.commit()
        return hilo

    @staticmethod
    def add_message(hilo_id, contenido, autor_id):
        mensaje = Mensaje(contenido=contenido, autor_id=autor_id, hilo_id=hilo_id)
        db.session.add(mensaje)
        db.session.commit()
        return mensaje

    @staticmethod
    def get_messages(hilo_id):
        return Mensaje.query.filter_by(hilo_id=hilo_id).order_by(Mensaje.fecha_creacion).all()