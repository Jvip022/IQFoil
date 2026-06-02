from app import db

class UsuarioInsignia(db.Model):
    __tablename__ = 'usuario_insignia'
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    insignia_id = db.Column(db.Integer, db.ForeignKey('insignia.id'), primary_key=True)
    fecha_obtenida = db.Column(db.DateTime, default=db.func.now())