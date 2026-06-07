from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.documento import Documento
from app.models.video import VideoTutorial

bp = Blueprint('busqueda', __name__, url_prefix='/api/busqueda')

@bp.route('/', methods=['GET'])
@jwt_required()
def buscar():
    q = request.args.get('q', '')
    if not q:
        return jsonify({'resultados': []})
    q_lower = q.lower()
    # Búsqueda en documentos
    docs = Documento.query.filter(
        (Documento.titulo.ilike(f'%{q}%')) | (Documento.descripcion.ilike(f'%{q}%'))
    ).limit(10).all()
    # Búsqueda en videos
    videos = VideoTutorial.query.filter(
        (VideoTutorial.titulo.ilike(f'%{q}%')) | (VideoTutorial.descripcion.ilike(f'%{q}%'))
    ).limit(10).all()
    resultados = []
    for d in docs:
        resultados.append({
            'tipo': 'documento',
            'id': d.id,
            'titulo': d.titulo,
            'descripcion': d.descripcion,
            'url': d.url_archivo
        })
    for v in videos:
        resultados.append({
            'tipo': 'video',
            'id': v.id,
            'titulo': v.titulo,
            'descripcion': v.descripcion,
            'url': v.url_video
        })
    return jsonify({'resultados': resultados})