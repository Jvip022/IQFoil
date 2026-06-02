from app import db

class Evaluacion(db.Model):
    __tablename__ = 'evaluacion'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    evaluador_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    rubrica_id = db.Column(db.Integer, db.ForeignKey('rubrica.id'), nullable=False)
    video_url = db.Column(db.Text)
    fecha_entrega = db.Column(db.DateTime)
    fecha_evaluacion = db.Column(db.DateTime)
    estado = db.Column(db.String(20), default='pendiente')
    comentarios = db.Column(db.Text)
    puntuacion_total = db.Column(db.Integer)