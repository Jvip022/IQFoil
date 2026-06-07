# backend/app/services/video_service.py
from app.models.video import Video
from app.models.progreso_video import ProgresoVideo
from app import db

class VideoService:
    @staticmethod
    def get_all():
        return Video.query.all()

    @staticmethod
    def create(titulo, url, descripcion, duracion_segundos):
        video = Video(titulo=titulo, url=url, descripcion=descripcion, duracion_segundos=duracion_segundos)
        db.session.add(video)
        db.session.commit()
        return video

    @staticmethod
    def update_progress(video_id, usuario_id, progreso):
        prog = ProgresoVideo.query.filter_by(video_id=video_id, usuario_id=usuario_id).first()
        if not prog:
            prog = ProgresoVideo(video_id=video_id, usuario_id=usuario_id, progreso=progreso)
            db.session.add(prog)
        else:
            prog.progreso = max(prog.progreso, progreso)
        db.session.commit()
        return prog

    @staticmethod
    def get_progress(video_id, usuario_id):
        prog = ProgresoVideo.query.filter_by(video_id=video_id, usuario_id=usuario_id).first()
        return prog.progreso if prog else 0