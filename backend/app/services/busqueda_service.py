# backend/app/services/busqueda_service.py
from app.models.documento import Documento
from app.models.video import Video
from app.models.hilo import Hilo
from app.models.usuario import Usuario

class BusquedaService:
    @staticmethod
    def search(query):
        results = {
            'documentos': Documento.query.filter(Documento.titulo.contains(query) | Documento.descripcion.contains(query)).all(),
            'videos': Video.query.filter(Video.titulo.contains(query) | Video.descripcion.contains(query)).all(),
            'hilos': Hilo.query.filter(Hilo.titulo.contains(query)).all(),
            'usuarios': Usuario.query.filter(Usuario.nombre.contains(query) | Usuario.email.contains(query)).all()
        }
        # Convertir a dicts
        return {k: [r.to_dict() for r in v] for k, v in results.items() if v}