-- ======================================================
-- Schema para IQFOIL-CUBA (PostgreSQL)
-- Autor: Joel Rodriguez Yanes
-- Descripción: Creación de tablas para la plataforma educativa
-- ======================================================

-- Extensión para UUID (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- Tabla: rol
-- ======================================================
CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- ======================================================
-- Tabla: usuario
-- ======================================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    rol_id INT NOT NULL REFERENCES rol(id),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol ON usuario(rol_id);

-- ======================================================
-- Tabla: video_tutorial
-- ======================================================
CREATE TABLE video_tutorial (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    url_video TEXT NOT NULL,
    duracion_seg INT NOT NULL CHECK (duracion_seg > 0),
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('principiante','intermedio','avanzado')),
    thumbnail_url TEXT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_video_nivel ON video_tutorial(nivel);
CREATE INDEX idx_video_fecha ON video_tutorial(fecha_publicacion);

-- ======================================================
-- Tabla: progreso_video
-- ======================================================
CREATE TABLE progreso_video (
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE,
    video_id INT REFERENCES video_tutorial(id) ON DELETE CASCADE,
    progreso INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    completado BOOLEAN DEFAULT FALSE,
    ultima_visualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, video_id)
);

CREATE INDEX idx_progreso_usuario ON progreso_video(usuario_id);
CREATE INDEX idx_progreso_completado ON progreso_video(completado);

-- ======================================================
-- Tabla: rubrica
-- ======================================================
CREATE TABLE rubrica (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    creador_id INT REFERENCES usuario(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- Tabla: criterio
-- ======================================================
CREATE TABLE criterio (
    id SERIAL PRIMARY KEY,
    rubrica_id INT NOT NULL REFERENCES rubrica(id) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    puntuacion_maxima INT NOT NULL CHECK (puntuacion_maxima > 0)
);

CREATE INDEX idx_criterio_rubrica ON criterio(rubrica_id);

-- ======================================================
-- Tabla: evaluacion
-- ======================================================
CREATE TABLE evaluacion (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    evaluador_id INT REFERENCES usuario(id) ON DELETE SET NULL,
    rubrica_id INT NOT NULL REFERENCES rubrica(id),
    video_url TEXT,
    fecha_entrega TIMESTAMP,
    fecha_evaluacion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','evaluado')),
    comentarios TEXT,
    puntuacion_total INT
);

CREATE INDEX idx_evaluacion_usuario ON evaluacion(usuario_id);
CREATE INDEX idx_evaluacion_evaluador ON evaluacion(evaluador_id);
CREATE INDEX idx_evaluacion_estado ON evaluacion(estado);

-- ======================================================
-- Tabla: puntuacion_evaluacion
-- ======================================================
CREATE TABLE puntuacion_evaluacion (
    evaluacion_id INT REFERENCES evaluacion(id) ON DELETE CASCADE,
    criterio_id INT REFERENCES criterio(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion >= 0),
    PRIMARY KEY (evaluacion_id, criterio_id)
);

-- ======================================================
-- Tabla: documento
-- ======================================================
CREATE TABLE documento (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('pdf','word','excel','imagen','video','otro')),
    url_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    autor_id INT REFERENCES usuario(id) ON DELETE SET NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    aprobado BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_documento_tipo ON documento(tipo);
CREATE INDEX idx_documento_fecha ON documento(fecha_subida);

-- ======================================================
-- Tabla: foro (categorías)
-- ======================================================
CREATE TABLE foro (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT DEFAULT 0
);

-- ======================================================
-- Tabla: hilo
-- ======================================================
CREATE TABLE hilo (
    id SERIAL PRIMARY KEY,
    foro_id INT NOT NULL REFERENCES foro(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    autor_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_respuesta TIMESTAMP,
    contenido TEXT NOT NULL,
    respuestas INT DEFAULT 0,
    vistas INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_hilo_foro ON hilo(foro_id);
CREATE INDEX idx_hilo_fecha ON hilo(fecha_creacion);

-- ======================================================
-- Tabla: mensaje
-- ======================================================
CREATE TABLE mensaje (
    id SERIAL PRIMARY KEY,
    hilo_id INT NOT NULL REFERENCES hilo(id) ON DELETE CASCADE,
    autor_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensaje_hilo ON mensaje(hilo_id);

-- ======================================================
-- Tabla: conversacion (mensajes privados)
-- ======================================================
CREATE TABLE conversacion (
    id SERIAL PRIMARY KEY,
    usuario1_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    usuario2_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    ultimo_mensaje TEXT,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (usuario1_id < usuario2_id)
);

CREATE UNIQUE INDEX idx_conversacion_unicos ON conversacion(usuario1_id, usuario2_id);

-- ======================================================
-- Tabla: mensaje_privado
-- ======================================================
CREATE TABLE mensaje_privado (
    id SERIAL PRIMARY KEY,
    conversacion_id INT NOT NULL REFERENCES conversacion(id) ON DELETE CASCADE,
    remitente_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_mp_conversacion ON mensaje_privado(conversacion_id);
CREATE INDEX idx_mp_fecha ON mensaje_privado(fecha);

-- ======================================================
-- Tabla: evento (calendario)
-- ======================================================
CREATE TABLE evento (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    lugar VARCHAR(255),
    tipo VARCHAR(30) CHECK (tipo IN ('regata','entrenamiento','reunion','social')),
    organizador_id INT REFERENCES usuario(id) ON DELETE SET NULL,
    max_participantes INT,
    imagen_url TEXT,
    publico BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_evento_fecha ON evento(fecha_inicio);

-- ======================================================
-- Tabla: participante_evento
-- ======================================================
CREATE TABLE participante_evento (
    evento_id INT REFERENCES evento(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evento_id, usuario_id)
);

-- ======================================================
-- Tabla: insignia
-- ======================================================
CREATE TABLE insignia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    categoria VARCHAR(50),
    color VARCHAR(20),
    requisitos TEXT
);

-- ======================================================
-- Tabla: usuario_insignia
-- ======================================================
CREATE TABLE usuario_insignia (
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE,
    insignia_id INT REFERENCES insignia(id) ON DELETE CASCADE,
    fecha_obtenida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, insignia_id)
);

-- ======================================================
-- Tabla: mentoria
-- ======================================================
CREATE TABLE mentoria (
    id SERIAL PRIMARY KEY,
    mentor_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    aprendiz_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    area VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','activa','completada')),
    fecha_inicio TIMESTAMP,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (mentor_id, aprendiz_id)
);

-- ======================================================
-- Tabla: configuracion_usuario
-- ======================================================
CREATE TABLE configuracion_usuario (
    usuario_id INT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    idioma VARCHAR(10) DEFAULT 'es',
    tema VARCHAR(20) DEFAULT 'sistema' CHECK (tema IN ('claro','oscuro','sistema')),
    notificaciones_email BOOLEAN DEFAULT TRUE,
    notificaciones_push BOOLEAN DEFAULT TRUE,
    perfil_publico BOOLEAN DEFAULT FALSE
);

-- ======================================================
-- Tabla: log_actividad (para métricas en PostgreSQL opcional)
-- ======================================================
CREATE TABLE log_actividad (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuario(id) ON DELETE SET NULL,
    accion VARCHAR(100),
    detalles JSONB,
    ip VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_usuario ON log_actividad(usuario_id);
CREATE INDEX idx_log_fecha ON log_actividad(fecha);