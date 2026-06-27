from app import db

class ExamenTeorico(db.Model):
    __tablename__ = 'examen_teorico'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    nivel = db.Column(db.String(20), nullable=False)  # principiante, intermedio, avanzado
    tiempo_limite_minutos = db.Column(db.Integer, nullable=False, default=30)
    puntaje_aprobacion = db.Column(db.Integer, nullable=False, default=60)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=db.func.now())
    creado_por = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)

    # Relación con preguntas (cascada)
    preguntas = db.relationship('Pregunta', backref='examen', cascade='all, delete-orphan')

    def to_dict(self, include_preguntas=False):
        data = {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'nivel': self.nivel,
            'tiempoLimiteMinutos': self.tiempo_limite_minutos,
            'puntajeAprobacion': self.puntaje_aprobacion,
            'activo': self.activo,
            'fechaCreacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
        if include_preguntas:
            data['preguntas'] = [p.to_dict() for p in self.preguntas]
        return data