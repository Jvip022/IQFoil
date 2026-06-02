from app import db

class Evento(db.Model):
    __tablename__ = 'evento'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    fecha_fin = db.Column(db.DateTime)
    lugar = db.Column(db.String(255))
    tipo = db.Column(db.String(30))
    organizador_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    max_participantes = db.Column(db.Integer)
    imagen_url = db.Column(db.Text)
    publico = db.Column(db.Boolean, default=True)