from app import db

class Mensaje(db.Model):
    __tablename__ = 'mensaje'
    id = db.Column(db.Integer, primary_key=True)
    hilo_id = db.Column(db.Integer, db.ForeignKey('hilo.id'), nullable=False)
    autor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=db.func.now())

    hilo = db.relationship('Hilo', backref='mensajes')
    autor = db.relationship('Usuario', backref='mensajes')