from app import db

class RespuestaUsuario(db.Model):
    __tablename__ = 'respuesta_usuario'

    id = db.Column(db.Integer, primary_key=True)
    examen_id = db.Column(db.Integer, db.ForeignKey('examen_teorico.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    respuestas = db.Column(db.JSON, nullable=False)  # {pregunta_id: respuesta}
    fecha_inicio = db.Column(db.DateTime, default=db.func.now())
    fecha_envio = db.Column(db.DateTime)
    puntaje_obtenido = db.Column(db.Integer)
    porcentaje = db.Column(db.Float)
    aprobado = db.Column(db.Boolean)
    estado = db.Column(db.String(20), default='en_curso')  # en_curso, finalizado