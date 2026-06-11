from app import db
from datetime import datetime

class Curso(db.Model):
    __tablename__ = 'curso'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    nivel = db.Column(db.String(50))  # principiante, intermedio, avanzado
    imagen_url = db.Column(db.String(500))
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'nivel': self.nivel,
            'imagenUrl': self.imagen_url,
            'activo': self.activo,
            'fechaCreacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }