from app import db

class Recomendacion(db.Model):
    __tablename__ = 'recomendaciones'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    razon = db.Column(db.Text)
    meta = db.Column(db.JSON)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    fecha = db.Column(db.DateTime, default=db.func.now())

    usuario = db.relationship('Usuario', backref='recomendaciones')