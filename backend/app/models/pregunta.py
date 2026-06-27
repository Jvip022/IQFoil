from app import db

class Pregunta(db.Model):
    __tablename__ = 'pregunta'

    id = db.Column(db.Integer, primary_key=True)
    examen_id = db.Column(db.Integer, db.ForeignKey('examen_teorico.id'), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # opcion_unica, verdadero_falso, opcion_multiple, texto_corto
    opciones = db.Column(db.JSON)  # array de strings para opcion_unica/multiple
    respuesta_correcta = db.Column(db.JSON, nullable=False)  # puede ser string, boolean, array
    puntaje = db.Column(db.Integer, nullable=False, default=1)
    explicacion = db.Column(db.Text)
    nivel = db.Column(db.String(20))
    categoria = db.Column(db.String(50))
    orden = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'texto': self.texto,
            'tipo': self.tipo,
            'opciones': self.opciones,
            'puntaje': self.puntaje,
            'explicacion': self.explicacion,
            'nivel': self.nivel,
            'categoria': self.categoria,
            'orden': self.orden
            # No incluir respuesta_correcta por seguridad
        }