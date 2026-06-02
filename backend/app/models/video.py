from app import db

class VideoTutorial(db.Model):
    __tablename__ = 'video_tutorial'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    url_video = db.Column(db.Text, nullable=False)
    duracion_seg = db.Column(db.Integer, nullable=False)
    nivel = db.Column(db.String(20), nullable=False)
    thumbnail_url = db.Column(db.Text)
    fecha_publicacion = db.Column(db.DateTime, default=db.func.now())
    activo = db.Column(db.Boolean, default=True)