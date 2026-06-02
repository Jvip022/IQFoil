from app import db

class ProgresoVideo(db.Model):
    __tablename__ = 'progreso_video'
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    video_id = db.Column(db.Integer, db.ForeignKey('video_tutorial.id'), primary_key=True)
    progreso = db.Column(db.Integer, default=0)
    completado = db.Column(db.Boolean, default=False)
    ultima_visualizacion = db.Column(db.DateTime, default=db.func.now())