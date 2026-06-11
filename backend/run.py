from app import create_app, db
from app.models import usuario, rol
from flask import send_from_directory
import os

app = create_app()

# Obtener la ruta absoluta del backend
backend_dir = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(backend_dir, 'uploads')

app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Crear la carpeta de uploads si no existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ruta para servir archivos estáticos (debe ir ANTES de app.run)
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)