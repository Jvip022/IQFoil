# backend/app/services/documento_service.py
from app.models.documento import Documento
from app import db
import os
from werkzeug.utils import secure_filename

class DocumentoService:
    @staticmethod
    def get_all():
        return Documento.query.order_by(Documento.fecha_subida.desc()).all()

    @staticmethod
    def create(titulo, descripcion, tipo, archivo, autor_id, upload_folder='uploads/documentos'):
        from .documento_service import allowed_file
        if not allowed_file(archivo.filename):
            raise ValueError("Tipo de archivo no permitido")
        filename = secure_filename(archivo.filename)
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        archivo.save(filepath)
        doc = Documento(
            titulo=titulo,
            descripcion=descripcion,
            tipo=tipo,
            url_archivo=filepath,
            tamano_bytes=os.path.getsize(filepath),
            autor_id=autor_id,
            version=1,
            aprobado=False
        )
        db.session.add(doc)
        db.session.commit()
        return doc

    @staticmethod
    def update(id, data):
        doc = Documento.query.get_or_404(id)
        doc.titulo = data.get('titulo', doc.titulo)
        doc.descripcion = data.get('descripcion', doc.descripcion)
        doc.tipo = data.get('tipo', doc.tipo)
        doc.version += 1
        db.session.commit()
        return doc

    @staticmethod
    def delete(id):
        doc = Documento.query.get_or_404(id)
        if os.path.exists(doc.url_archivo):
            os.remove(doc.url_archivo)
        db.session.delete(doc)
        db.session.commit()
        return True

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'webm'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS