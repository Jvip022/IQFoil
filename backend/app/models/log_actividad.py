from app import db

class LogActividad(db.Model):
    __tablename__ = 'log_actividad'
    id = db.Column(db.BigInteger, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    accion = db.Column(db.String(100))
    detalles = db.Column(db.JSON)
    ip = db.Column(db.String(45))
    fecha = db.Column(db.DateTime, default=db.func.now())