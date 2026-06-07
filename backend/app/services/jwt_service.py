# backend/app/services/jwt_service.py
from flask_jwt_extended import create_access_token, decode_token
from datetime import timedelta
from flask import current_app

class JWTAuthService:
    @staticmethod
    def generate_token(user_id, expires_delta=None):
        if expires_delta is None:
            expires_delta = timedelta(hours=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 24))
        token = create_access_token(identity=str(user_id), expires_delta=expires_delta)
        return token

    @staticmethod
    def decode_token(token):
        try:
            decoded = decode_token(token)
            return decoded.get('sub')
        except Exception:
            return None