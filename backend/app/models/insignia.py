from app import db

class Insignia(db.Model):
    __tablename__ = 'insignia'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    icono = db.Column(db.String(50))
    categoria = db.Column(db.String(50))
    color = db.Column(db.String(20))
    requisitos = db.Column(db.Text)