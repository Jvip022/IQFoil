-- ======================================================
-- Datos de prueba para IQFOIL-CUBA (PostgreSQL)
-- Autor: Joel Rodriguez Yanes
-- Descripción: Inserta datos iniciales para desarrollo
-- ======================================================

-- Insertar roles
INSERT INTO rol (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('entrenador', 'Entrenador o evaluador'),
('atleta', 'Usuario atleta');

-- Insertar usuarios de ejemplo
-- Nota: La contraseña de todos estos usuarios es '123456' (hash generado con bcrypt)
INSERT INTO usuario (email, password_hash, nombre, rol_id, activo) VALUES
('admin@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Administrador', 1, true),
('entrenador@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Carlos Gómez', 2, true),
('atleta1@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'Juan Pérez', 3, true),
('atleta2@iqfoil.cu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq', 'María García', 3, true);

-- Configuración por defecto para cada usuario (se ejecuta tras insertar usuarios)
DO $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT id FROM usuario LOOP
        INSERT INTO configuracion_usuario (usuario_id) VALUES (u.id);
    END LOOP;
END $$;

-- Insertar videos tutoriales
INSERT INTO video_tutorial (titulo, descripcion, url_video, duracion_seg, nivel, thumbnail_url) VALUES
('Introducción al foil', 'Conceptos básicos del foil', 'https://example.com/video1.mp4', 360, 'principiante', 'https://example.com/thumb1.jpg'),
('Técnica de virada', 'Aprende a virar correctamente', 'https://example.com/video2.mp4', 480, 'intermedio', 'https://example.com/thumb2.jpg'),
('Navegación con viento fuerte', 'Consejos para condiciones extremas', 'https://example.com/video3.mp4', 600, 'avanzado', 'https://example.com/thumb3.jpg');

-- Insertar rúbrica de ejemplo
INSERT INTO rubrica (titulo, descripcion) VALUES
('Técnica de virada', 'Evaluación de la maniobra de virada');

-- Insertar criterios para esa rúbrica
WITH rub AS (SELECT id FROM rubrica WHERE titulo = 'Técnica de virada')
INSERT INTO criterio (rubrica_id, descripcion, puntuacion_maxima)
SELECT rub.id, descripcion, puntuacion
FROM rub, (VALUES
    ('Posición del cuerpo', 5),
    ('Timming', 5),
    ('Coordinación', 5)
) AS v(descripcion, puntuacion);

-- Insertar foros
INSERT INTO foro (titulo, descripcion) VALUES
('Reglamento', 'Dudas sobre las reglas de competición'),
('Técnica', 'Consejos y preguntas sobre técnica'),
('Material', 'Equipamiento y embarcaciones');

-- Insertar algunos hilos de ejemplo
DO $$
DECLARE
    v_foro_id INT;
    v_autor_id INT;
BEGIN
    SELECT id INTO v_foro_id FROM foro WHERE titulo = 'Reglamento';
    SELECT id INTO v_autor_id FROM usuario WHERE email = 'atleta1@iqfoil.cu';
    INSERT INTO hilo (foro_id, titulo, autor_id, contenido) VALUES
        (v_foro_id, '¿Cómo se penaliza un fuera de línea?', v_autor_id, 'En una regata, ¿cuándo se considera fuera de línea?');
    -- Insertar una respuesta
    INSERT INTO mensaje (hilo_id, autor_id, contenido)
    SELECT id, (SELECT id FROM usuario WHERE email = 'entrenador@iqfoil.cu'), 'Depende de la situación, según la regla 42...'
    FROM hilo WHERE foro_id = v_foro_id AND titulo = '¿Cómo se penaliza un fuera de línea?';
END $$;

-- Insertar documentos
INSERT INTO documento (titulo, descripcion, tipo, url_archivo, tamano_bytes, autor_id, aprobado) VALUES
('Reglamento 2025', 'Versión oficial del reglamento', 'pdf', '/docs/reglamento2025.pdf', 2500000, (SELECT id FROM usuario WHERE email = 'admin@iqfoil.cu'), true),
('Plan de entrenamiento básico', 'Guía para principiantes', 'pdf', '/docs/plan_entrenamiento.pdf', 1800000, (SELECT id FROM usuario WHERE email = 'entrenador@iqfoil.cu'), true);

-- Insertar insignias
INSERT INTO insignia (nombre, descripcion, icono, categoria) VALUES
('Principiante', 'Primer video completado', '🌱', 'logro'),
('Navegante', '10 horas de navegación', '⛵', 'logro'),
('Estratega', 'Participación en 5 regatas', '🏆', 'competencia');

-- Insertar eventos
INSERT INTO evento (titulo, descripcion, fecha_inicio, lugar, tipo, max_participantes, organizador_id) VALUES
('Regata de primavera', 'Competición anual', '2025-05-15 10:00:00', 'Club Náutico', 'regata', 50, (SELECT id FROM usuario WHERE email = 'admin@iqfoil.cu')),
('Entrenamiento de foil', 'Sesión práctica', '2025-06-10 16:00:00', 'Puerto Deportivo', 'entrenamiento', 20, (SELECT id FROM usuario WHERE email = 'entrenador@iqfoil.cu'));

-- Asignar insignias a algunos usuarios (ejemplo)
DO $$
DECLARE
    u_id INT;
    i_id INT;
BEGIN
    SELECT id INTO u_id FROM usuario WHERE email = 'atleta1@iqfoil.cu';
    SELECT id INTO i_id FROM insignia WHERE nombre = 'Principiante';
    INSERT INTO usuario_insignia (usuario_id, insignia_id) VALUES (u_id, i_id);
END $$;