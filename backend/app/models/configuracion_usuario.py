from app import db

class ConfiguracionUsuario(db.Model):
    __tablename__ = 'configuracion_usuario'
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    idioma = db.Column(db.String(10), default='es')
    tema = db.Column(db.String(20), default='sistema')
    notificaciones_email = db.Column(db.Boolean, default=True)
    notificaciones_push = db.Column(db.Boolean, default=True)
    perfil_publico = db.Column(db.Boolean, default=False)