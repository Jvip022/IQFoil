from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app import db
from app.models.documento import Documento
from app.models.usuario import Usuario

bp = Blueprint('documentos', __name__, url_prefix='/api/documentos')

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Decorador que responde directamente a OPTIONS sin ejecutar la función
def handle_options(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
        return jwt_required()(fn)(*args, **kwargs)
    return wrapper

@bp.route('/', methods=['GET', 'OPTIONS'])
@handle_options
def get_documentos():
    documentos = Documento.query.order_by(Documento.fecha_subida.desc()).all()
    return jsonify([{
        'id': d.id,
        'titulo': d.titulo,
        'descripcion': d.descripcion,
        'tipo': d.tipo,
        'archivoUrl': d.url_archivo,
        'fechaSubida': d.fecha_subida.isoformat(),
        'tamano': d.tamano_bytes,
        'autor': Usuario.query.get(d.autor_id).nombre if d.autor_id else 'Anónimo',
        'version': d.version
    } for d in documentos])

@bp.route('/', methods=['POST', 'OPTIONS'])
@handle_options
def subir_documento():
    user_id = get_jwt_identity()
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    tipo = request.form.get('tipo')
    archivo = request.files.get('archivo')

    if not titulo or not archivo or not tipo:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    if not allowed_file(archivo.filename):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400

    filename = secure_filename(archivo.filename)
    upload_dir = 'uploads/documentos'
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    archivo.save(filepath)

    nuevo_doc = Documento(
        titulo=titulo,
        descripcion=descripcion,
        tipo=tipo,
        url_archivo=filepath,
        tamano_bytes=os.path.getsize(filepath),
        autor_id=user_id,
        version=1,
        aprobado=False
    )
    db.session.add(nuevo_doc)
    db.session.commit()

    return jsonify({
        'id': nuevo_doc.id,
        'titulo': nuevo_doc.titulo,
        'descripcion': nuevo_doc.descripcion,
        'tipo': nuevo_doc.tipo,
        'archivoUrl': nuevo_doc.url_archivo,
        'fechaSubida': nuevo_doc.fecha_subida.isoformat(),
        'tamano': nuevo_doc.tamano_bytes,
        'autor': Usuario.query.get(nuevo_doc.autor_id).nombre
    }), 201

@bp.route('/<int:id>', methods=['PUT', 'OPTIONS'])
@handle_options
def actualizar_documento(id):
    doc = Documento.query.get_or_404(id)
    data = request.get_json()
    doc.titulo = data.get('titulo', doc.titulo)
    doc.descripcion = data.get('descripcion', doc.descripcion)
    doc.tipo = data.get('tipo', doc.tipo)
    doc.version = doc.version + 1
    db.session.commit()
    return jsonify({'message': 'Documento actualizado'})

@bp.route('/<int:id>', methods=['DELETE', 'OPTIONS'])
@handle_options
def eliminar_documento(id):
    doc = Documento.query.get_or_404(id)
    if os.path.exists(doc.url_archivo):
        os.remove(doc.url_archivo)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Documento eliminado'})