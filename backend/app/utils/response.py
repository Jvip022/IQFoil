# backend/app/utils/response.py
from flask import jsonify

def success_response(data=None, message="Success", status=200):
    """Respuesta estándar de éxito"""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status

def error_response(message="Error", status=400, errors=None):
    """Respuesta estándar de error"""
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status

def validation_error_response(errors):
    """Respuesta para errores de validación"""
    return error_response("Error de validación", status=422, errors=errors)

def created_response(data=None, message="Created"):
    """Respuesta para recursos creados (201)"""
    return success_response(data, message, status=201)

def no_content_response():
    """Respuesta sin contenido (204)"""
    return "", 204

def paginated_response(items, page, per_page, total, **extra):
    """Respuesta paginada"""
    return jsonify({
        "success": True,
        "data": items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page if per_page else 1
        },
        **extra
    }), 200