from app import db

class Conversacion(db.Model):
    __tablename__ = 'conversacion'
    id = db.Column(db.Integer, primary_key=True)
    usuario1_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario2_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    ultimo_mensaje = db.Column(db.Text)
    ultima_actividad = db.Column(db.DateTime, default=db.func.now())

    __table_args__ = (db.CheckConstraint('usuario1_id < usuario2_id'),)