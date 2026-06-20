# app/routes/__init__.py
from .auth import bp as auth_bp
from .usuarios import bp as usuarios_bp
from .documentos import bp as documentos_bp
from .videos import bp as videos_bp
from .evaluaciones import bp as evaluaciones_bp
from .foro import bp as foro_bp
from .talentos import bp as talentos_bp
from .admin import bp as admin_bp
from .busqueda import bp as busqueda_bp
from .cursos import bp as cursos_bp           
from .insignias import bp as insignias_bp     
from .eventos import bp as eventos_crud_bp   
from .reportes import bp as reportes_bp      

blueprints = [
    auth_bp,
    usuarios_bp,
    documentos_bp,
    videos_bp,
    evaluaciones_bp,
    foro_bp,
    talentos_bp,
    admin_bp,
    busqueda_bp,
    cursos_bp,
    insignias_bp,
    eventos_crud_bp,
    reportes_bp                          
]