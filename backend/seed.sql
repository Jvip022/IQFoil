-- ============================================================
-- SEED PARA IQFOIL - DATOS INICIALES COMPLETOS
-- ============================================================
-- Ejecutar con: psql -U joel -d iqfoil -f backend/seed.sql
-- ============================================================

-- 1. LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- Descomentar si se quiere empezar desde cero
-- TRUNCATE TABLE configuracion_usuario, participante_evento, usuario_insignia, progreso_video, mensaje, hilo, evento, evaluacion, documento, curso, criterio, rubrica, usuario, rol, foro, insignia, video_tutorial RESTART IDENTITY CASCADE;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO rol (id, nombre, descripcion) VALUES
    (1, 'admin', 'Administrador del sistema'),
    (2, 'entrenador', 'Entrenador o evaluador'),
    (3, 'atleta', 'Usuario atleta')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USUARIOS
-- ============================================================
-- Admin (password: admin123)
INSERT INTO usuario (id, email, password_hash, nombre, rol_id, activo, provincia, preferencias) VALUES
    (1, 'admin@iqfoil.cu', 
     'scrypt:32768:8:1$VT4JiKLKk40tMPFE$3cc794ca61f444d35aad6d1a81e18aef7d3781d741c95eb22ce3120f8c29cd035507f960281bb0be6e8dcaeb09466b92cdc9b6707a2637b757e1d32ed7a43ad7',
     'Administrador', 1, true, 'La Habana', '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}')
ON CONFLICT (id) DO NOTHING;

-- Entrenador (password: 123456)
INSERT INTO usuario (id, email, password_hash, nombre, rol_id, activo, provincia, preferencias) VALUES
    (2, 'entrenador@iqfoil.cu',
     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq',
     'Carlos Gómez', 2, true, 'Santiago de Cuba', '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}')
ON CONFLICT (id) DO NOTHING;

-- Atletas (password: 123456)
INSERT INTO usuario (id, email, password_hash, nombre, rol_id, activo, provincia, preferencias) VALUES
    (3, 'atleta1@iqfoil.cu',
     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq',
     'Juan Pérez', 3, true, 'La Habana', '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}'),
    (4, 'atleta2@iqfoil.cu',
     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq',
     'María García', 3, true, 'Holguín', '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}'),
    (5, 'atleta3@iqfoil.cu',
     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq',
     'Pedro Rodríguez', 3, true, 'Villa Clara', '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CONFIGURACIÓN DE USUARIOS
-- ============================================================
INSERT INTO configuracion_usuario (usuario_id, idioma, tema, notificaciones_email, notificaciones_push, perfil_publico) VALUES
    (1, 'es', 'sistema', true, true, false),
    (2, 'es', 'sistema', true, true, false),
    (3, 'es', 'sistema', true, true, false),
    (4, 'es', 'sistema', true, true, false),
    (5, 'es', 'sistema', true, true, false)
ON CONFLICT (usuario_id) DO NOTHING;

-- ============================================================
-- FOROS
-- ============================================================
INSERT INTO foro (id, titulo, descripcion, orden) VALUES
    (1, 'Reglamento', 'Dudas sobre las reglas de competición', 0),
    (2, 'Técnica', 'Consejos y preguntas sobre técnica', 1),
    (3, 'Material', 'Equipamiento y embarcaciones', 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- HILOS Y MENSAJES
-- ============================================================
INSERT INTO hilo (id, foro_id, titulo, autor_id, fecha_creacion, ultima_respuesta, contenido, respuestas, vistas, activo) VALUES
    (1, 1, '¿Cómo se penaliza un fuera de línea?', 3, '2026-06-01 10:00:00', '2026-06-01 10:30:00', 'En una regata, ¿cuándo se considera fuera de línea?', 0, 0, true),
    (2, 2, 'Mejor técnica para viradas con viento fuerte', 4, '2026-06-02 14:00:00', '2026-06-02 15:00:00', 'Estoy teniendo dificultades para virar cuando el viento es superior a 20 nudos.', 0, 0, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mensaje (id, hilo_id, autor_id, contenido, fecha) VALUES
    (1, 1, 2, 'Según la regla 42, se considera fuera de línea cuando el barco cruza la línea de salida antes de la señal.', '2026-06-01 10:30:00'),
    (2, 2, 2, 'Te recomiendo reducir ligeramente la vela mayor antes de la virada para tener mejor control.', '2026-06-02 15:00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSIGNIAS
-- ============================================================
INSERT INTO insignia (id, nombre, descripcion, icono, categoria, color, requisitos) VALUES
    (1, 'Principiante', 'Primer video completado', '🌱', 'logro', '#4caf50', 'Completar el video "Introducción al foil"'),
    (2, 'Navegante', '10 horas de navegación', '⛵', 'logro', '#2196f3', 'Acumular 10 horas de navegación registrada'),
    (3, 'Estratega', 'Participación en 5 regatas', '🏆', 'competencia', '#ff9800', 'Participar en al menos 5 regatas oficiales')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USUARIO-INSIGNIA (asignar insignia al atleta)
-- ============================================================
INSERT INTO usuario_insignia (usuario_id, insignia_id, fecha_obtenida) VALUES
    (3, 1, '2026-06-01 12:00:00')
ON CONFLICT (usuario_id, insignia_id) DO NOTHING;

-- ============================================================
-- VIDEOS TUTORIALES
-- ============================================================
INSERT INTO video_tutorial (id, titulo, descripcion, url_video, duracion_seg, nivel, thumbnail_url, activo) VALUES
    (1, 'Introducción al foil', 'Conceptos básicos del foil', 'uploads/videos/intro-foil.mp4', 360, 'principiante', 'https://example.com/thumb1.jpg', true),
    (2, 'Técnica de virada', 'Aprende a virar correctamente', 'uploads/videos/virada.mp4', 480, 'intermedio', 'https://example.com/thumb2.jpg', true),
    (3, 'Navegación con viento fuerte', 'Consejos para condiciones extremas', 'uploads/videos/viento-fuerte.mp4', 600, 'avanzado', 'https://example.com/thumb3.jpg', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRESO DE VIDEOS (ejemplo)
-- ============================================================
INSERT INTO progreso_video (usuario_id, video_id, progreso, completado, ultima_visualizacion) VALUES
    (3, 1, 100, true, '2026-06-01 11:00:00')
ON CONFLICT (usuario_id, video_id) DO NOTHING;

-- ============================================================
-- RÚBRICA Y CRITERIOS
-- ============================================================
INSERT INTO rubrica (id, titulo, descripcion, creador_id) VALUES
    (1, 'Técnica de virada', 'Evaluación de la maniobra de virada', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO criterio (id, rubrica_id, descripcion, puntuacion_maxima) VALUES
    (1, 1, 'Posición del cuerpo', 5),
    (2, 1, 'Timming', 5),
    (3, 1, 'Coordinación', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- EVENTOS (ejemplo)
-- ============================================================
INSERT INTO evento (id, titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, organizador_id, max_participantes, publico) VALUES
    (1, 'Regata de primavera', 'Competición anual de primavera', '2026-05-15 10:00:00', '2026-05-16 18:00:00', 'Club Náutico', 'regata', 1, 50, true),
    (2, 'Entrenamiento de foil', 'Sesión práctica de foil', '2026-06-10 16:00:00', '2026-06-10 20:00:00', 'Puerto Deportivo', 'entrenamiento', 2, 20, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DOCUMENTOS (ejemplo)
-- ============================================================
INSERT INTO documento (id, titulo, descripcion, tipo, url_archivo, tamano_bytes, autor_id, fecha_subida, version, aprobado) VALUES
    (1, 'Reglamento 2025', 'Versión oficial del reglamento', 'pdf', 'documentos/reglamento2025.pdf', 2500000, 1, '2026-06-01 12:00:00', 1, true),
    (2, 'Plan de entrenamiento básico', 'Guía para principiantes', 'pdf', 'documentos/plan_entrenamiento.pdf', 1800000, 2, '2026-06-02 12:00:00', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CURSOS (ejemplo)
-- ============================================================
INSERT INTO curso (id, titulo, descripcion, nivel, activo, fecha_creacion) VALUES
    (1, 'Fundamentos de Vela', 'Curso básico de navegación', 'principiante', true, '2026-06-01'),
    (2, 'Técnica Avanzada de Foil', 'Perfeccionamiento de foil', 'avanzado', true, '2026-06-02')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REINICIAR SECUENCIAS
-- ============================================================
SELECT setval('usuario_id_seq', (SELECT max(id) FROM usuario));
SELECT setval('rol_id_seq', (SELECT max(id) FROM rol));
SELECT setval('foro_id_seq', (SELECT max(id) FROM foro));
SELECT setval('hilo_id_seq', (SELECT max(id) FROM hilo));
SELECT setval('mensaje_id_seq', (SELECT max(id) FROM mensaje));
SELECT setval('insignia_id_seq', (SELECT max(id) FROM insignia));
SELECT setval('video_tutorial_id_seq', (SELECT max(id) FROM video_tutorial));
SELECT setval('rubrica_id_seq', (SELECT max(id) FROM rubrica));
SELECT setval('criterio_id_seq', (SELECT max(id) FROM criterio));
SELECT setval('evento_id_seq', (SELECT max(id) FROM evento));
SELECT setval('documento_id_seq', (SELECT max(id) FROM documento));
SELECT setval('curso_id_seq', (SELECT max(id) FROM curso));

-- ============================================================
-- FIN DEL SEED
-- ============================================================