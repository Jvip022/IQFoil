from app import db

class Documento(db.Model):
    __tablename__ = 'documento'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    tipo = db.Column(db.String(20), nullable=False)
    url_archivo = db.Column(db.Text, nullable=False)
    tamano_bytes = db.Column(db.BigInteger)
    autor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    fecha_subida = db.Column(db.DateTime, default=db.func.now())
    version = db.Column(db.Integer, default=1)
    aprobado = db.Column(db.Boolean, default=False)