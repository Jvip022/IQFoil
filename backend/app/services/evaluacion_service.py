# backend/app/services/evaluacion_service.py
from app.models.evaluacion import Evaluacion
from app.models.rubrica import Rubrica
from app.models.puntuacion_evaluacion import PuntuacionEvaluacion
from app import db

class EvaluacionService:
    @staticmethod
    def get_all():
        return Evaluacion.query.all()

    @staticmethod
    def create(titulo, descripcion, tipo, creador_id):
        evaluacion = Evaluacion(
            titulo=titulo,
            descripcion=descripcion,
            tipo=tipo,
            creador_id=creador_id
        )
        db.session.add(evaluacion)
        db.session.commit()
        return evaluacion

    @staticmethod
    def submit_score(evaluacion_id, usuario_id, puntaje, comentarios=None):
        punt = PuntuacionEvaluacion(
            evaluacion_id=evaluacion_id,
            usuario_id=usuario_id,
            puntaje=puntaje,
            comentarios=comentarios
        )
        db.session.add(punt)
        db.session.commit()
        return punt

    @staticmethod
    def get_results(evaluacion_id):
        return PuntuacionEvaluacion.query.filter_by(evaluacion_id=evaluacion_id).all()