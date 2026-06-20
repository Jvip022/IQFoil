# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Evita redirección 308 por trailing slash
    app.url_map.strict_slashes = False

    # Configuración CORS
    CORS(app,
         origins=["http://localhost:4200"],
         supports_credentials=True,
         allow_headers=["Authorization", "Content-Type", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Importar y registrar blueprints
    from .routes import blueprints
    for bp in blueprints:
        app.register_blueprint(bp)

    return app