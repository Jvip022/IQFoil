from app import db

class PuntuacionEvaluacion(db.Model):
    __tablename__ = 'puntuacion_evaluacion'
    evaluacion_id = db.Column(db.Integer, db.ForeignKey('evaluacion.id'), primary_key=True)
    criterio_id = db.Column(db.Integer, db.ForeignKey('criterio.id'), primary_key=True)
    puntuacion = db.Column(db.Integer, nullable=False)