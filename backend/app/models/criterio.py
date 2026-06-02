from app import db

class Criterio(db.Model):
    __tablename__ = 'criterio'
    id = db.Column(db.Integer, primary_key=True)
    rubrica_id = db.Column(db.Integer, db.ForeignKey('rubrica.id'), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    puntuacion_maxima = db.Column(db.Integer, nullable=False)

    rubrica = db.relationship('Rubrica', backref='criterios')