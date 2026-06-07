# backend/app/services/comunidad_service.py
from app.models.mentoria import Mentoria
from app.models.evento import Evento
from app.models.mensaje_privado import MensajePrivado
from app import db

class ComunidadService:
    @staticmethod
    def get_mentorias():
        return Mentoria.query.all()

    @staticmethod
    def solicitar_mentoria(usuario_id, mentor_id, tema):
        mentoria = Mentoria(usuario_id=usuario_id, mentor_id=mentor_id, tema=tema, estado='pendiente')
        db.session.add(mentoria)
        db.session.commit()
        return mentoria

    @staticmethod
    def get_eventos():
        return Evento.query.order_by(Evento.fecha_inicio).all()

    @staticmethod
    def enviar_mensaje_privado(remitente_id, destinatario_id, contenido):
        msg = MensajePrivado(remitente_id=remitente_id, destinatario_id=destinatario_id, contenido=contenido)
        db.session.add(msg)
        db.session.commit()
        return msg