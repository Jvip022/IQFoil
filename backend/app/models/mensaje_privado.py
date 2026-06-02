from app import db

class MensajePrivado(db.Model):
    __tablename__ = 'mensaje_privado'
    id = db.Column(db.Integer, primary_key=True)
    conversacion_id = db.Column(db.Integer, db.ForeignKey('conversacion.id'), nullable=False)
    remitente_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=db.func.now())
    leido = db.Column(db.Boolean, default=False)