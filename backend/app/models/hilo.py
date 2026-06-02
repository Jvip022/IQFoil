from app import db

class Hilo(db.Model):
    __tablename__ = 'hilo'
    id = db.Column(db.Integer, primary_key=True)
    foro_id = db.Column(db.Integer, db.ForeignKey('foro.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    autor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=db.func.now())
    ultima_respuesta = db.Column(db.DateTime)
    contenido = db.Column(db.Text, nullable=False)
    respuestas = db.Column(db.Integer, default=0)
    vistas = db.Column(db.Integer, default=0)
    activo = db.Column(db.Boolean, default=True)

    foro = db.relationship('Foro', backref='hilos')
    autor = db.relationship('Usuario', backref='hilos_creados')