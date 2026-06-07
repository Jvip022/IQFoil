# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Evita redirección 308 por trailing slash
    app.url_map.strict_slashes = False

    # Configuración CORS completa para desarrollo con Angular
    CORS(app,
         origins=["http://localhost:4200"],
         supports_credentials=True,
         allow_headers=["Authorization", "Content-Type", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    db.init_app(app)
    jwt.init_app(app)

    # Importar y registrar blueprints (debe existir una lista 'blueprints' en routes/__init__.py)
    from .routes import blueprints
    for bp in blueprints:
        app.register_blueprint(bp)

    return app