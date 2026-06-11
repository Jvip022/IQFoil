from app import create_app, db
from app.models import usuario, rol
from flask import send_from_directory
import os

app = create_app()

# Configuraciones
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ruta para servir archivos subidos (IMPORTANTE: debe ir ANTES de las blueprints)
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)