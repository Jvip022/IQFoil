from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('rol.id'), default=3)
    activo = db.Column(db.Boolean, default=True)
    avatar = db.Column(db.String(255), nullable=True)
    preferencias = db.Column(db.JSON, nullable=True, default={'idioma': 'es', 'notificacionesEmail': True, 'tema': 'claro'})
    
    provincia = db.Column(db.String(100), nullable=True)
    ultimo_acceso = db.Column(db.DateTime, nullable=True)
    fecha_registro = db.Column(db.DateTime, default=db.func.now())

    rol = db.relationship('Rol', backref='usuarios')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='bcrypt')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)