from app import db

class SolicitudCambioEntrenador(db.Model):
    __tablename__ = 'solicitud_cambio_entrenador'
    id = db.Column(db.Integer, primary_key=True)
    atleta_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    entrenador_actual_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    entrenador_deseado_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, aprobada, rechazada
    comentario = db.Column(db.Text)
    fecha_solicitud = db.Column(db.DateTime, default=db.func.now())
    fecha_resolucion = db.Column(db.DateTime, nullable=True)

    atleta = db.relationship('Usuario', foreign_keys=[atleta_id])
    entrenador_actual = db.relationship('Usuario', foreign_keys=[entrenador_actual_id])
    entrenador_deseado = db.relationship('Usuario', foreign_keys=[entrenador_deseado_id])