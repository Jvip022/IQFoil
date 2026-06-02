from app import db

class ParticipanteEvento(db.Model):
    __tablename__ = 'participante_evento'
    evento_id = db.Column(db.Integer, db.ForeignKey('evento.id'), primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    fecha_inscripcion = db.Column(db.DateTime, default=db.func.now())