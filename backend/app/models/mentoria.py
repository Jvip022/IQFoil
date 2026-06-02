from app import db

class Mentoria(db.Model):
    __tablename__ = 'mentoria'
    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    aprendiz_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    area = db.Column(db.String(100))
    estado = db.Column(db.String(20), default='pendiente')
    fecha_inicio = db.Column(db.DateTime)
    fecha_solicitud = db.Column(db.DateTime, default=db.func.now())

    __table_args__ = (db.UniqueConstraint('mentor_id', 'aprendiz_id'),)