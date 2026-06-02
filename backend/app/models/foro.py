from app import db

class Foro(db.Model):
    __tablename__ = 'foro'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    orden = db.Column(db.Integer, default=0)