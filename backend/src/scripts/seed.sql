INSERT INTO usuario (email, password_hash, nombre, rol_id) VALUES
('admin@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Administrador', 1),
('entrenador@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Carlos Gómez', 2),
('atleta1@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Juan Pérez', 3);

INSERT INTO video_tutorial (titulo, descripcion, url_video, duracion_seg, nivel) VALUES
('Introducción al foil', 'Conceptos básicos del foil', 'https://example.com/video1.mp4', 360, 'principiante'),
('Técnica de virada', 'Aprende a virar correctamente', 'https://example.com/video2.mp4', 480, 'intermedio');

INSERT INTO rubrica (titulo, descripcion) VALUES ('Técnica de virada', 'Evaluación de virada');
INSERT INTO criterio (rubrica_id, descripcion, puntuacion_maxima) VALUES
(1, 'Posición del cuerpo', 5),
(1, 'Timming', 5),
(1, 'Coordinación', 5);

INSERT INTO foro (titulo, descripcion) VALUES
('Reglamento', 'Dudas sobre reglas'),
('Técnica', 'Consejos técnicos'),
('Material', 'Equipamiento');

INSERT INTO insignia (nombre, icono, categoria) VALUES
('Principiante', '🌱', 'logro'),
('Navegante', '⛵', 'logro'),
('Estratega', '🏆', 'competencia');
