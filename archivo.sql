--
-- PostgreSQL database dump
--

\restrict Kc6YXOv3KZ6PafcYx4r56n0qDKlNodSEGtMbwNVfAAwZctj12mJeVsoB0jbyZ5r

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: configuracion_usuario; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.configuracion_usuario (
    usuario_id integer NOT NULL,
    idioma character varying(10) DEFAULT 'es'::character varying,
    tema character varying(20) DEFAULT 'sistema'::character varying,
    notificaciones_email boolean DEFAULT true,
    notificaciones_push boolean DEFAULT true,
    perfil_publico boolean DEFAULT false,
    CONSTRAINT configuracion_usuario_tema_check CHECK (((tema)::text = ANY ((ARRAY['claro'::character varying, 'oscuro'::character varying, 'sistema'::character varying])::text[])))
);


ALTER TABLE public.configuracion_usuario OWNER TO joel;

--
-- Name: conversacion; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.conversacion (
    id integer NOT NULL,
    usuario1_id integer NOT NULL,
    usuario2_id integer NOT NULL,
    ultimo_mensaje text,
    ultima_actividad timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversacion_check CHECK ((usuario1_id < usuario2_id))
);


ALTER TABLE public.conversacion OWNER TO joel;

--
-- Name: conversacion_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.conversacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversacion_id_seq OWNER TO joel;

--
-- Name: conversacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.conversacion_id_seq OWNED BY public.conversacion.id;


--
-- Name: criterio; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.criterio (
    id integer NOT NULL,
    rubrica_id integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    puntuacion_maxima integer NOT NULL,
    CONSTRAINT criterio_puntuacion_maxima_check CHECK ((puntuacion_maxima > 0))
);


ALTER TABLE public.criterio OWNER TO joel;

--
-- Name: criterio_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.criterio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.criterio_id_seq OWNER TO joel;

--
-- Name: criterio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.criterio_id_seq OWNED BY public.criterio.id;


--
-- Name: curso; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.curso (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    nivel character varying(50),
    imagen_url character varying(500),
    activo boolean,
    fecha_creacion timestamp without time zone
);


ALTER TABLE public.curso OWNER TO joel;

--
-- Name: curso_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.curso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curso_id_seq OWNER TO joel;

--
-- Name: curso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.curso_id_seq OWNED BY public.curso.id;


--
-- Name: documento; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.documento (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    tipo character varying(20) NOT NULL,
    url_archivo text NOT NULL,
    tamano_bytes bigint,
    autor_id integer,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 1,
    aprobado boolean DEFAULT false,
    CONSTRAINT documento_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['pdf'::character varying, 'word'::character varying, 'excel'::character varying, 'imagen'::character varying, 'video'::character varying, 'otro'::character varying])::text[])))
);


ALTER TABLE public.documento OWNER TO joel;

--
-- Name: documento_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.documento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documento_id_seq OWNER TO joel;

--
-- Name: documento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.documento_id_seq OWNED BY public.documento.id;


--
-- Name: evaluacion; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.evaluacion (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    usuario_id integer NOT NULL,
    evaluador_id integer,
    rubrica_id integer NOT NULL,
    video_url text,
    fecha_entrega timestamp without time zone,
    fecha_evaluacion timestamp without time zone,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    comentarios text,
    puntuacion_total integer,
    CONSTRAINT evaluacion_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'evaluado'::character varying])::text[])))
);


ALTER TABLE public.evaluacion OWNER TO joel;

--
-- Name: evaluacion_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.evaluacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_id_seq OWNER TO joel;

--
-- Name: evaluacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.evaluacion_id_seq OWNED BY public.evaluacion.id;


--
-- Name: evento; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.evento (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone,
    lugar character varying(255),
    tipo character varying(30),
    organizador_id integer,
    max_participantes integer,
    imagen_url text,
    publico boolean DEFAULT true,
    CONSTRAINT evento_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['regata'::character varying, 'entrenamiento'::character varying, 'reunion'::character varying, 'social'::character varying])::text[])))
);


ALTER TABLE public.evento OWNER TO joel;

--
-- Name: evento_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.evento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evento_id_seq OWNER TO joel;

--
-- Name: evento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.evento_id_seq OWNED BY public.evento.id;


--
-- Name: examen_teorico; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.examen_teorico (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    nivel character varying(20) NOT NULL,
    tiempo_limite_minutos integer DEFAULT 30 NOT NULL,
    puntaje_aprobacion integer DEFAULT 60 NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    creado_por integer,
    CONSTRAINT examen_teorico_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[])))
);


ALTER TABLE public.examen_teorico OWNER TO joel;

--
-- Name: examen_teorico_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.examen_teorico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.examen_teorico_id_seq OWNER TO joel;

--
-- Name: examen_teorico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.examen_teorico_id_seq OWNED BY public.examen_teorico.id;


--
-- Name: foro; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.foro (
    id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text,
    orden integer DEFAULT 0
);


ALTER TABLE public.foro OWNER TO joel;

--
-- Name: foro_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.foro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.foro_id_seq OWNER TO joel;

--
-- Name: foro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.foro_id_seq OWNED BY public.foro.id;


--
-- Name: hilo; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.hilo (
    id integer NOT NULL,
    foro_id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    autor_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ultima_respuesta timestamp without time zone,
    contenido text NOT NULL,
    respuestas integer DEFAULT 0,
    vistas integer DEFAULT 0,
    activo boolean DEFAULT true
);


ALTER TABLE public.hilo OWNER TO joel;

--
-- Name: hilo_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.hilo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hilo_id_seq OWNER TO joel;

--
-- Name: hilo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.hilo_id_seq OWNED BY public.hilo.id;


--
-- Name: insignia; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.insignia (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    icono character varying(50),
    categoria character varying(50),
    color character varying(20),
    requisitos text
);


ALTER TABLE public.insignia OWNER TO joel;

--
-- Name: insignia_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.insignia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insignia_id_seq OWNER TO joel;

--
-- Name: insignia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.insignia_id_seq OWNED BY public.insignia.id;


--
-- Name: log_actividad; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.log_actividad (
    id bigint NOT NULL,
    usuario_id integer,
    accion character varying(100),
    detalles jsonb,
    ip character varying(45),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.log_actividad OWNER TO joel;

--
-- Name: log_actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.log_actividad_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.log_actividad_id_seq OWNER TO joel;

--
-- Name: log_actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.log_actividad_id_seq OWNED BY public.log_actividad.id;


--
-- Name: mensaje; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.mensaje (
    id integer NOT NULL,
    hilo_id integer NOT NULL,
    autor_id integer NOT NULL,
    contenido text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mensaje OWNER TO joel;

--
-- Name: mensaje_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.mensaje_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensaje_id_seq OWNER TO joel;

--
-- Name: mensaje_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.mensaje_id_seq OWNED BY public.mensaje.id;


--
-- Name: mensaje_privado; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.mensaje_privado (
    id integer NOT NULL,
    conversacion_id integer NOT NULL,
    remitente_id integer NOT NULL,
    contenido text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leido boolean DEFAULT false
);


ALTER TABLE public.mensaje_privado OWNER TO joel;

--
-- Name: mensaje_privado_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.mensaje_privado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensaje_privado_id_seq OWNER TO joel;

--
-- Name: mensaje_privado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.mensaje_privado_id_seq OWNED BY public.mensaje_privado.id;


--
-- Name: mentoria; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.mentoria (
    id integer NOT NULL,
    mentor_id integer NOT NULL,
    aprendiz_id integer NOT NULL,
    area character varying(100),
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    fecha_inicio timestamp without time zone,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mentoria_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'activa'::character varying, 'completada'::character varying])::text[])))
);


ALTER TABLE public.mentoria OWNER TO joel;

--
-- Name: mentoria_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.mentoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mentoria_id_seq OWNER TO joel;

--
-- Name: mentoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.mentoria_id_seq OWNED BY public.mentoria.id;


--
-- Name: participante_evento; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.participante_evento (
    evento_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.participante_evento OWNER TO joel;

--
-- Name: pregunta; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.pregunta (
    id integer NOT NULL,
    examen_id integer NOT NULL,
    texto text NOT NULL,
    tipo character varying(20) NOT NULL,
    opciones jsonb,
    respuesta_correcta jsonb NOT NULL,
    puntaje integer DEFAULT 1 NOT NULL,
    explicacion text,
    nivel character varying(20),
    categoria character varying(50),
    orden integer DEFAULT 0,
    CONSTRAINT pregunta_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[]))),
    CONSTRAINT pregunta_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['opcion_unica'::character varying, 'verdadero_falso'::character varying, 'opcion_multiple'::character varying, 'texto_corto'::character varying])::text[])))
);


ALTER TABLE public.pregunta OWNER TO joel;

--
-- Name: pregunta_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.pregunta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pregunta_id_seq OWNER TO joel;

--
-- Name: pregunta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.pregunta_id_seq OWNED BY public.pregunta.id;


--
-- Name: progreso_video; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.progreso_video (
    usuario_id integer NOT NULL,
    video_id integer NOT NULL,
    progreso integer DEFAULT 0,
    completado boolean DEFAULT false,
    ultima_visualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT progreso_video_progreso_check CHECK (((progreso >= 0) AND (progreso <= 100)))
);


ALTER TABLE public.progreso_video OWNER TO joel;

--
-- Name: puntuacion_evaluacion; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.puntuacion_evaluacion (
    evaluacion_id integer NOT NULL,
    criterio_id integer NOT NULL,
    puntuacion integer NOT NULL,
    CONSTRAINT puntuacion_evaluacion_puntuacion_check CHECK ((puntuacion >= 0))
);


ALTER TABLE public.puntuacion_evaluacion OWNER TO joel;

--
-- Name: respuesta_usuario; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.respuesta_usuario (
    id integer NOT NULL,
    examen_id integer NOT NULL,
    usuario_id integer NOT NULL,
    respuestas jsonb NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_envio timestamp without time zone,
    puntaje_obtenido integer,
    porcentaje double precision,
    aprobado boolean,
    estado character varying(20) DEFAULT 'en_curso'::character varying
);


ALTER TABLE public.respuesta_usuario OWNER TO joel;

--
-- Name: respuesta_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.respuesta_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.respuesta_usuario_id_seq OWNER TO joel;

--
-- Name: respuesta_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.respuesta_usuario_id_seq OWNED BY public.respuesta_usuario.id;


--
-- Name: rol; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.rol (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text
);


ALTER TABLE public.rol OWNER TO joel;

--
-- Name: rol_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_id_seq OWNER TO joel;

--
-- Name: rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.rol_id_seq OWNED BY public.rol.id;


--
-- Name: rubrica; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.rubrica (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    creador_id integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rubrica OWNER TO joel;

--
-- Name: rubrica_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.rubrica_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rubrica_id_seq OWNER TO joel;

--
-- Name: rubrica_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.rubrica_id_seq OWNED BY public.rubrica.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombre character varying(100) NOT NULL,
    avatar_url text,
    rol_id integer NOT NULL,
    activo boolean DEFAULT true,
    ultimo_acceso timestamp without time zone,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avatar character varying(255) DEFAULT NULL::character varying,
    preferencias jsonb DEFAULT '{"tema": "claro", "idioma": "es", "notificacionesEmail": true}'::jsonb NOT NULL,
    provincia character varying(100),
    CONSTRAINT email_valido CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))
);


ALTER TABLE public.usuario OWNER TO joel;

--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO joel;

--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: usuario_insignia; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.usuario_insignia (
    usuario_id integer NOT NULL,
    insignia_id integer NOT NULL,
    fecha_obtenida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario_insignia OWNER TO joel;

--
-- Name: video_tutorial; Type: TABLE; Schema: public; Owner: joel
--

CREATE TABLE public.video_tutorial (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    url_video text NOT NULL,
    duracion_seg integer NOT NULL,
    nivel character varying(20) NOT NULL,
    thumbnail_url text,
    fecha_publicacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    CONSTRAINT video_tutorial_duracion_seg_check CHECK ((duracion_seg >= 0)),
    CONSTRAINT video_tutorial_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[])))
);


ALTER TABLE public.video_tutorial OWNER TO joel;

--
-- Name: video_tutorial_id_seq; Type: SEQUENCE; Schema: public; Owner: joel
--

CREATE SEQUENCE public.video_tutorial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_tutorial_id_seq OWNER TO joel;

--
-- Name: video_tutorial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joel
--

ALTER SEQUENCE public.video_tutorial_id_seq OWNED BY public.video_tutorial.id;


--
-- Name: conversacion id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.conversacion ALTER COLUMN id SET DEFAULT nextval('public.conversacion_id_seq'::regclass);


--
-- Name: criterio id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.criterio ALTER COLUMN id SET DEFAULT nextval('public.criterio_id_seq'::regclass);


--
-- Name: curso id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.curso ALTER COLUMN id SET DEFAULT nextval('public.curso_id_seq'::regclass);


--
-- Name: documento id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.documento ALTER COLUMN id SET DEFAULT nextval('public.documento_id_seq'::regclass);


--
-- Name: evaluacion id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evaluacion ALTER COLUMN id SET DEFAULT nextval('public.evaluacion_id_seq'::regclass);


--
-- Name: evento id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evento ALTER COLUMN id SET DEFAULT nextval('public.evento_id_seq'::regclass);


--
-- Name: examen_teorico id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.examen_teorico ALTER COLUMN id SET DEFAULT nextval('public.examen_teorico_id_seq'::regclass);


--
-- Name: foro id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.foro ALTER COLUMN id SET DEFAULT nextval('public.foro_id_seq'::regclass);


--
-- Name: hilo id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.hilo ALTER COLUMN id SET DEFAULT nextval('public.hilo_id_seq'::regclass);


--
-- Name: insignia id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.insignia ALTER COLUMN id SET DEFAULT nextval('public.insignia_id_seq'::regclass);


--
-- Name: log_actividad id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.log_actividad ALTER COLUMN id SET DEFAULT nextval('public.log_actividad_id_seq'::regclass);


--
-- Name: mensaje id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje ALTER COLUMN id SET DEFAULT nextval('public.mensaje_id_seq'::regclass);


--
-- Name: mensaje_privado id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje_privado ALTER COLUMN id SET DEFAULT nextval('public.mensaje_privado_id_seq'::regclass);


--
-- Name: mentoria id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mentoria ALTER COLUMN id SET DEFAULT nextval('public.mentoria_id_seq'::regclass);


--
-- Name: pregunta id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.pregunta ALTER COLUMN id SET DEFAULT nextval('public.pregunta_id_seq'::regclass);


--
-- Name: respuesta_usuario id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.respuesta_usuario ALTER COLUMN id SET DEFAULT nextval('public.respuesta_usuario_id_seq'::regclass);


--
-- Name: rol id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rol ALTER COLUMN id SET DEFAULT nextval('public.rol_id_seq'::regclass);


--
-- Name: rubrica id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rubrica ALTER COLUMN id SET DEFAULT nextval('public.rubrica_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Name: video_tutorial id; Type: DEFAULT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.video_tutorial ALTER COLUMN id SET DEFAULT nextval('public.video_tutorial_id_seq'::regclass);


--
-- Data for Name: configuracion_usuario; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.configuracion_usuario (usuario_id, idioma, tema, notificaciones_email, notificaciones_push, perfil_publico) FROM stdin;
1	es	sistema	t	t	f
2	es	sistema	t	t	f
3	es	sistema	t	t	f
4	es	sistema	t	t	f
5	es	sistema	t	t	f
\.


--
-- Data for Name: conversacion; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.conversacion (id, usuario1_id, usuario2_id, ultimo_mensaje, ultima_actividad) FROM stdin;
\.


--
-- Data for Name: criterio; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.criterio (id, rubrica_id, descripcion, puntuacion_maxima) FROM stdin;
1	1	Posición del cuerpo	5
2	1	Timming	5
3	1	Coordinación	5
\.


--
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.curso (id, titulo, descripcion, nivel, imagen_url, activo, fecha_creacion) FROM stdin;
1	Fundamentos de Vela	Curso básico de navegación	principiante	\N	t	2026-06-01 00:00:00
2	Técnica Avanzada de Foil	Perfeccionamiento de foil	avanzado	\N	t	2026-06-02 00:00:00
\.


--
-- Data for Name: documento; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.documento (id, titulo, descripcion, tipo, url_archivo, tamano_bytes, autor_id, fecha_subida, version, aprobado) FROM stdin;
1	Reglamento 2025	Versión oficial del reglamento	pdf	/docs/reglamento2025.pdf	2500000	1	2026-06-01 22:20:05.100068	1	t
2	Plan de entrenamiento básico	Guía para principiantes	pdf	/docs/plan_entrenamiento.pdf	1800000	2	2026-06-01 22:20:05.100068	1	t
10	Reglamento 2025	Nuevo reglamento	pdf	documentos/reglamento2025.pdf	2500000	1	2026-06-19 20:00:15.941726	1	t
11	Plan de entrenamiento avanzado	Plan para atletas de alto rendimiento	pdf	documentos/plan_avanzado.pdf	1800000	2	2026-06-19 20:00:15.941726	1	t
8	Reglamento 2024	Versión antigua del reglamento (desactualizada)	pdf	documentos/reglamento2024.pdf	2300000	1	2025-01-15 10:00:00	2	t
9	Plan de entrenamiento 2024	Plan obsoleto de entrenamiento	pdf	documentos/plan2024.pdf	1500000	2	2025-02-20 14:30:00	1	t
\.


--
-- Data for Name: evaluacion; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.evaluacion (id, titulo, usuario_id, evaluador_id, rubrica_id, video_url, fecha_entrega, fecha_evaluacion, estado, comentarios, puntuacion_total) FROM stdin;
1	Evaluación de Juan Pérez	3	2	1	https://example.com/videos/3_1781913615.mp4	2026-03-28 20:00:15.76706	2026-04-01 20:00:15.76706	evaluado	Comentario de prueba para Juan Pérez	6
3	Evaluación de María García	4	2	1	https://example.com/videos/4_1781913615.mp4	2026-04-20 20:00:15.783225	2026-04-25 20:00:15.783225	evaluado	Comentario de prueba para María García	10
6	Evaluación de María García	4	2	1	https://example.com/videos/4_1781913615.mp4	2026-02-20 20:00:15.796967	2026-02-23 20:00:15.796967	pendiente	Comentario de prueba para María García	5
7	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1781913615.mp4	2025-12-25 20:00:15.801029	2025-12-26 20:00:15.801029	evaluado	Comentario de prueba para Luis Fernández	14
8	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1781913615.mp4	2026-02-27 20:00:15.8034	2026-03-04 20:00:15.8034	pendiente	Comentario de prueba para Luis Fernández	10
11	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1781913615.mp4	2026-04-01 20:00:15.810608	2026-04-05 20:00:15.810608	evaluado	Comentario de prueba para Pedro Rodríguez	11
12	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1781913615.mp4	2025-12-29 20:00:15.813476	2026-01-01 20:00:15.813476	evaluado	Comentario de prueba para Pedro Rodríguez	11
13	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1781913615.mp4	2026-04-04 20:00:15.816336	2026-04-06 20:00:15.816336	pendiente	Comentario de prueba para Pedro Rodríguez	5
15	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1781913615.mp4	2026-01-22 20:00:15.821434	2026-01-27 20:00:15.821434	evaluado	Comentario de prueba para Ana Torres	8
16	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1781913615.mp4	2026-02-24 20:00:15.824055	2026-02-26 20:00:15.824055	evaluado	Comentario de prueba para Ana Torres	12
17	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1781913615.mp4	2025-12-23 20:00:15.826416	2025-12-24 20:00:15.826416	evaluado	Comentario de prueba para Ana Torres	12
18	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1781913615.mp4	2026-02-20 20:00:15.828764	2026-02-25 20:00:15.828764	evaluado	Comentario de prueba para José Ramírez	6
19	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1781913615.mp4	2026-02-18 20:00:15.831012	2026-02-22 20:00:15.831012	pendiente	Comentario de prueba para José Ramírez	15
22	Evaluación de Marta Díaz	9	2	1	https://example.com/videos/9_1781913615.mp4	2025-12-23 20:00:15.838113	2025-12-28 20:00:15.838113	pendiente	Comentario de prueba para Marta Díaz	7
26	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1781913615.mp4	2026-01-25 20:00:15.846256	2026-01-28 20:00:15.846256	evaluado	Comentario de prueba para Roberto Mena	7
9	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1781913615.mp4	2026-06-13 20:00:15.806571	2026-06-17 20:00:15.806571	pendiente	Comentario de prueba para Luis Fernández	6
10	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1781913615.mp4	2026-05-28 20:00:15.8086	2026-05-30 20:00:15.8086	evaluado	Comentario de prueba para Luis Fernández	10
14	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1781913615.mp4	2026-06-12 20:00:15.818347	2026-06-15 20:00:15.818347	pendiente	Comentario de prueba para Pedro Rodríguez	9
20	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1781913615.mp4	2026-05-22 20:00:15.833305	2026-05-25 20:00:15.833305	evaluado	Comentario de prueba para José Ramírez	5
21	Evaluación de Marta Díaz	9	2	1	https://example.com/videos/9_1781913615.mp4	2026-05-13 20:00:15.835831	2026-05-14 20:00:15.835831	evaluado	Comentario de prueba para Marta Díaz	7
23	Evaluación de Marta Díaz	9	2	1	https://example.com/videos/9_1781913615.mp4	2026-05-27 20:00:15.840292	2026-05-28 20:00:15.840292	pendiente	Comentario de prueba para Marta Díaz	9
24	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1781913615.mp4	2026-06-10 20:00:15.842275	2026-06-14 20:00:15.842275	evaluado	Comentario de prueba para Roberto Mena	9
25	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1781913615.mp4	2026-06-10 20:00:15.844235	2026-06-11 20:00:15.844235	evaluado	Comentario de prueba para Roberto Mena	4
27	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1781913615.mp4	2026-05-19 20:00:15.848229	2026-05-21 20:00:15.848229	pendiente	Comentario de prueba para Roberto Mena	10
4	Evaluación de María García	4	2	1	https://example.com/videos/4_1781913615.mp4	2025-12-23 20:00:15.786964	2025-12-24 20:00:15.786964	evaluado	Comentario de prueba para María García	10
2	Evaluación de Juan Pérez	3	2	1	https://example.com/videos/3_1781913615.mp4	2026-02-21 20:00:15.777772	2026-02-26 20:00:15.777772	evaluado	Comentario de prueba para Juan Pérez	8
5	Evaluación de María García	4	2	1	https://example.com/videos/4_1781913615.mp4	2025-12-22 20:00:15.79248	2025-12-26 20:00:15.79248	evaluado	Comentario de prueba para María García	10
28	Evaluación de Juan Pérez - Mayo	3	2	1	https://example.com/videos/3_mayo.mp4	2026-05-15 10:00:00	2026-05-20 14:00:00	evaluado	Buena técnica	7
29	Evaluación de Juan Pérez - Junio	3	2	1	https://example.com/videos/3_junio.mp4	2026-06-10 09:00:00	2026-06-15 16:00:00	evaluado	Excelente progreso	9
30	Evaluación de María García - Mayo	4	2	1	https://example.com/videos/4_mayo.mp4	2026-05-20 11:00:00	2026-05-25 15:00:00	evaluado	Buen desempeño	3
31	Evaluación de María García - Junio	4	2	1	https://example.com/videos/4_junio.mp4	2026-06-12 08:30:00	2026-06-18 17:00:00	evaluado	Mejoró mucho	6
32	Evaluación de Luis Fernández - Junio	6	2	1	https://example.com/videos/6_junio.mp4	2026-06-05 10:00:00	2026-06-10 12:00:00	evaluado	Buen ritmo	10
33	Evaluación de Pedro Rodríguez - Junio	5	2	1	https://example.com/videos/5_junio.mp4	2026-06-08 14:00:00	2026-06-12 18:00:00	evaluado	Muy buena técnica	8
34	Evaluación avanzada de Juan Pérez	3	2	1	https://example.com/videos/3_avanzado.mp4	2026-06-20 00:00:00	2026-06-25 00:00:00	evaluado	Excelente rendimiento	18
35	Evaluación de Juan Pérez	3	2	1	https://example.com/videos/3_1782495836.mp4	2026-01-29 13:43:56.149384	2026-02-01 13:43:56.149384	evaluado	Comentario de prueba para Juan Pérez	9
36	Evaluación de Juan Pérez	3	2	1	https://example.com/videos/3_1782495836.mp4	2026-01-15 13:43:56.163481	2026-01-16 13:43:56.163481	pendiente	Comentario de prueba para Juan Pérez	15
37	Evaluación de María García	4	2	1	https://example.com/videos/4_1782495836.mp4	2026-04-04 13:43:56.170126	2026-04-07 13:43:56.170126	pendiente	Comentario de prueba para María García	13
38	Evaluación de María García	4	2	1	https://example.com/videos/4_1782495836.mp4	2026-03-03 13:43:56.173843	2026-03-06 13:43:56.173843	pendiente	Comentario de prueba para María García	11
39	Evaluación de María García	4	2	1	https://example.com/videos/4_1782495836.mp4	2026-02-25 13:43:56.176841	2026-03-02 13:43:56.176841	pendiente	Comentario de prueba para María García	7
40	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1782495836.mp4	2026-05-29 13:43:56.180905	2026-05-30 13:43:56.180905	pendiente	Comentario de prueba para Luis Fernández	13
41	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1782495836.mp4	2026-01-23 13:43:56.18455	2026-01-24 13:43:56.18455	evaluado	Comentario de prueba para Luis Fernández	15
42	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1782495836.mp4	2026-01-10 13:43:56.187107	2026-01-15 13:43:56.187107	pendiente	Comentario de prueba para Luis Fernández	12
43	Evaluación de Luis Fernández	6	2	1	https://example.com/videos/6_1782495836.mp4	2026-01-28 13:43:56.18933	2026-01-29 13:43:56.18933	pendiente	Comentario de prueba para Luis Fernández	7
44	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1782495836.mp4	2026-06-07 13:43:56.191314	2026-06-11 13:43:56.191314	evaluado	Comentario de prueba para Pedro Rodríguez	5
45	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1782495836.mp4	2026-04-07 13:43:56.194187	2026-04-10 13:43:56.194187	pendiente	Comentario de prueba para Pedro Rodríguez	15
46	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1782495836.mp4	2026-04-27 13:43:56.198535	2026-04-30 13:43:56.198535	pendiente	Comentario de prueba para Pedro Rodríguez	6
47	Evaluación de Pedro Rodríguez	5	2	1	https://example.com/videos/5_1782495836.mp4	2026-01-25 13:43:56.201506	2026-01-27 13:43:56.201506	pendiente	Comentario de prueba para Pedro Rodríguez	10
48	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1782495836.mp4	2026-04-29 13:43:56.203796	2026-05-02 13:43:56.203796	pendiente	Comentario de prueba para Ana Torres	14
49	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1782495836.mp4	2026-02-15 13:43:56.205919	2026-02-18 13:43:56.205919	evaluado	Comentario de prueba para Ana Torres	14
50	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1782495836.mp4	2026-05-14 13:43:56.208142	2026-05-19 13:43:56.208142	evaluado	Comentario de prueba para Ana Torres	10
51	Evaluación de Ana Torres	7	2	1	https://example.com/videos/7_1782495836.mp4	2026-01-31 13:43:56.211636	2026-02-03 13:43:56.211636	evaluado	Comentario de prueba para Ana Torres	6
52	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1782495836.mp4	2026-02-04 13:43:56.21412	2026-02-05 13:43:56.21412	evaluado	Comentario de prueba para José Ramírez	5
53	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1782495836.mp4	2026-01-16 13:43:56.216359	2026-01-19 13:43:56.216359	evaluado	Comentario de prueba para José Ramírez	13
54	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1782495836.mp4	2026-04-28 13:43:56.218692	2026-04-30 13:43:56.218692	pendiente	Comentario de prueba para José Ramírez	6
55	Evaluación de José Ramírez	8	2	1	https://example.com/videos/8_1782495836.mp4	2026-03-20 13:43:56.220871	2026-03-22 13:43:56.220871	evaluado	Comentario de prueba para José Ramírez	11
56	Evaluación de Marta Díaz	9	2	1	https://example.com/videos/9_1782495836.mp4	2026-03-11 13:43:56.222825	2026-03-15 13:43:56.222825	pendiente	Comentario de prueba para Marta Díaz	11
57	Evaluación de Marta Díaz	9	2	1	https://example.com/videos/9_1782495836.mp4	2026-06-19 13:43:56.2247	2026-06-22 13:43:56.2247	evaluado	Comentario de prueba para Marta Díaz	7
58	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1782495836.mp4	2026-04-23 13:43:56.227079	2026-04-28 13:43:56.227079	pendiente	Comentario de prueba para Roberto Mena	9
59	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1782495836.mp4	2026-03-01 13:43:56.229571	2026-03-03 13:43:56.229571	pendiente	Comentario de prueba para Roberto Mena	15
60	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1782495836.mp4	2026-02-17 13:43:56.232185	2026-02-22 13:43:56.232185	pendiente	Comentario de prueba para Roberto Mena	13
61	Evaluación de Roberto Mena	10	2	1	https://example.com/videos/10_1782495836.mp4	2026-05-08 13:43:56.234475	2026-05-13 13:43:56.234475	evaluado	Comentario de prueba para Roberto Mena	9
64	carrera Ejemplo	3	\N	1	/home/joel/Documentos/tesis/codigo/backend/uploads/videos_practica/3_1782772411.851686_IQFoil_-_Race_Day_-_2022_Singapore_Slalom_Nationals_at_Changi_Beach360P.mp4	2026-06-29 18:33:31.936285	\N	pendiente	un video corto de regata	\N
\.


--
-- Data for Name: evento; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.evento (id, titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, organizador_id, max_participantes, imagen_url, publico) FROM stdin;
1	Regata de primavera	Competición anual	2025-05-15 10:00:00	\N	Club Náutico	regata	1	50	\N	t
2	Entrenamiento de foil	Sesión práctica	2025-06-10 16:00:00	\N	Puerto Deportivo	entrenamiento	2	20	\N	t
10	Regata de otoño	Regata de otoño	2026-07-19 20:00:15.951699	\N	Club Náutico	regata	1	\N	\N	t
11	Entrenamiento de foil	Entrenamiento de foil	2026-07-04 20:00:15.951716	\N	Puerto Deportivo	entrenamiento	2	\N	\N	t
3	competencia	competencia amistosa	2026-06-18 21:02:00	2026-06-28 09:12:00	mata	entrenamiento	\N	\N	\N	t
\.


--
-- Data for Name: examen_teorico; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.examen_teorico (id, titulo, descripcion, nivel, tiempo_limite_minutos, puntaje_aprobacion, activo, fecha_creacion, creado_por) FROM stdin;
1	Reglamento de vela básico	Cuestionario sobre las normas básicas de navegación y regatas.	principiante	20	70	t	2026-06-26 15:31:54.610721	1
2	Meteorología y viento	Preguntas sobre interpretación del viento, nubes y fenómenos atmosféricos.	intermedio	25	65	t	2026-06-26 15:31:54.612301	1
3	Técnica avanzada de foil	Cuestionario sobre ajustes, maniobras y optimización del foil.	avanzado	30	75	t	2026-06-26 15:31:54.614163	1
\.


--
-- Data for Name: foro; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.foro (id, titulo, descripcion, orden) FROM stdin;
2	Técnica	Consejos y preguntas sobre técnica	0
3	Material	Equipamiento y embarcaciones	0
1	Reglamento	Dudas sobre las reglas de competición	0
\.


--
-- Data for Name: hilo; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.hilo (id, foro_id, titulo, autor_id, fecha_creacion, ultima_respuesta, contenido, respuestas, vistas, activo) FROM stdin;
1	1	¿Cómo se penaliza un fuera de línea?	3	2026-06-01 22:20:05.094293	2026-06-29 13:55:39.774699	En una regata, ¿cuándo se considera fuera de línea?	0	0	t
\.


--
-- Data for Name: insignia; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.insignia (id, nombre, descripcion, icono, categoria, color, requisitos) FROM stdin;
1	Principiante	Primer video completado	🌱	logro	\N	\N
2	Navegante	10 horas de navegación	⛵	logro	\N	\N
3	Estratega	Participación en 5 regatas	🏆	competencia	\N	\N
\.


--
-- Data for Name: log_actividad; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.log_actividad (id, usuario_id, accion, detalles, ip, fecha) FROM stdin;
1	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 16:38:50.746311
2	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 16:45:33.290777
3	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 16:46:47.687873
4	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 17:23:09.959992
5	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 17:44:21.356869
6	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 17:55:18.321176
7	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 18:41:23.021797
8	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-19 18:41:36.249755
9	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-19 18:43:23.661507
10	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-19 18:44:10.837375
11	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-19 18:44:55.950858
12	4	login	{"email": "atleta2@iqfoil.cu", "nombre": "María García"}	127.0.0.1	2026-06-19 18:45:07.334491
13	5	login	{"email": "atleta3@iqfoil.cu", "nombre": "Pedro Rodríguez"}	127.0.0.1	2026-06-19 18:45:40.071186
14	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 19:03:15.63753
15	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 19:18:30.401398
16	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 19:18:48.23286
17	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-19 19:19:37.890063
18	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 19:22:31.171257
19	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 19:48:48.689369
20	5	ver_video	{"info": "Acción ver_video"}	192.168.1.70	2026-05-20 20:00:15.911842
21	5	ver_video	{"info": "Acción ver_video"}	192.168.1.219	2026-03-02 20:00:15.911983
22	5	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.185	2025-12-22 20:00:15.912055
23	5	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.231	2026-02-06 20:00:15.912115
24	5	ver_video	{"info": "Acción ver_video"}	192.168.1.109	2026-03-02 20:00:15.912181
25	3	login	{"info": "Acción login"}	192.168.1.194	2026-04-09 20:00:15.912271
26	3	subir_documento	{"info": "Acción subir_documento"}	192.168.1.205	2026-04-05 20:00:15.912338
27	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.224	2026-01-15 20:00:15.912383
28	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.30	2026-06-07 20:00:15.912425
29	3	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.2	2026-06-04 20:00:15.912477
30	3	login	{"info": "Acción login"}	192.168.1.180	2026-06-12 20:00:15.912517
31	3	login	{"info": "Acción login"}	192.168.1.230	2026-06-15 20:00:15.912556
32	3	ver_video	{"info": "Acción ver_video"}	192.168.1.183	2026-01-11 20:00:15.912595
33	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.22	2026-02-23 20:00:15.912636
34	1	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.18	2026-01-07 20:00:15.912674
35	1	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.179	2026-05-22 20:00:15.912717
36	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.129	2026-03-13 20:00:15.912767
37	1	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.156	2026-06-07 20:00:15.912803
38	1	login	{"info": "Acción login"}	192.168.1.105	2026-01-14 20:00:15.912844
39	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.50	2026-03-07 20:00:15.912883
40	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.217	2026-03-26 20:00:15.912919
41	1	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.117	2026-04-07 20:00:15.912955
42	1	completar_video	{"info": "Acción completar_video"}	192.168.1.165	2026-03-24 20:00:15.912995
43	6	completar_video	{"info": "Acción completar_video"}	192.168.1.81	2026-02-17 20:00:15.913037
44	6	completar_video	{"info": "Acción completar_video"}	192.168.1.88	2026-04-06 20:00:15.913075
45	6	completar_video	{"info": "Acción completar_video"}	192.168.1.169	2025-12-30 20:00:15.913112
46	6	login	{"info": "Acción login"}	192.168.1.198	2026-04-07 20:00:15.913148
47	6	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.120	2026-03-17 20:00:15.913233
48	6	ver_video	{"info": "Acción ver_video"}	192.168.1.199	2026-05-08 20:00:15.913281
49	6	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.34	2026-05-07 20:00:15.913317
50	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.77	2026-03-05 20:00:15.91336
51	7	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.250	2026-01-18 20:00:15.913409
52	7	subir_documento	{"info": "Acción subir_documento"}	192.168.1.3	2026-05-17 20:00:15.913445
53	7	subir_documento	{"info": "Acción subir_documento"}	192.168.1.234	2026-02-03 20:00:15.913483
54	7	ver_video	{"info": "Acción ver_video"}	192.168.1.182	2026-04-07 20:00:15.913525
55	7	login	{"info": "Acción login"}	192.168.1.24	2026-05-14 20:00:15.913562
56	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.250	2026-05-21 20:00:15.913596
57	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.196	2026-05-28 20:00:15.913637
58	7	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.36	2026-02-12 20:00:15.913673
59	7	subir_documento	{"info": "Acción subir_documento"}	192.168.1.97	2026-03-10 20:00:15.913715
60	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.228	2026-02-09 20:00:15.913751
61	7	ver_video	{"info": "Acción ver_video"}	192.168.1.3	2026-05-08 20:00:15.913787
62	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.162	2026-04-06 20:00:15.913839
63	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.173	2026-03-14 20:00:15.913881
64	8	subir_documento	{"info": "Acción subir_documento"}	192.168.1.195	2026-03-16 20:00:15.913933
65	8	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.255	2026-03-17 20:00:15.913982
66	8	ver_video	{"info": "Acción ver_video"}	192.168.1.109	2026-04-10 20:00:15.914031
67	8	login	{"info": "Acción login"}	192.168.1.189	2026-06-06 20:00:15.914073
68	8	ver_video	{"info": "Acción ver_video"}	192.168.1.75	2026-05-27 20:00:15.914107
69	8	subir_documento	{"info": "Acción subir_documento"}	192.168.1.40	2026-06-17 20:00:15.91415
70	8	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.11	2026-04-26 20:00:15.914235
71	8	login	{"info": "Acción login"}	192.168.1.96	2026-01-01 20:00:15.91427
72	8	completar_video	{"info": "Acción completar_video"}	192.168.1.26	2026-05-10 20:00:15.914305
73	8	ver_video	{"info": "Acción ver_video"}	192.168.1.202	2026-03-13 20:00:15.914341
74	8	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.15	2026-06-07 20:00:15.914376
75	8	completar_video	{"info": "Acción completar_video"}	192.168.1.94	2026-03-10 20:00:15.914419
76	9	ver_video	{"info": "Acción ver_video"}	192.168.1.243	2026-03-03 20:00:15.914458
77	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.57	2025-12-21 20:00:15.914714
78	9	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.145	2026-05-09 20:00:15.914756
79	9	ver_video	{"info": "Acción ver_video"}	192.168.1.234	2025-12-30 20:00:15.914791
80	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.250	2026-05-30 20:00:15.914832
81	9	login	{"info": "Acción login"}	192.168.1.222	2026-04-18 20:00:15.914867
82	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.187	2026-04-27 20:00:15.914901
83	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.118	2026-05-19 20:00:15.91495
84	9	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.77	2026-04-21 20:00:15.915004
85	9	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.57	2026-01-14 20:00:15.915088
86	10	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.234	2026-02-09 20:00:15.915157
87	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.103	2026-04-07 20:00:15.915253
88	10	login	{"info": "Acción login"}	192.168.1.208	2026-06-12 20:00:15.915313
89	10	ver_video	{"info": "Acción ver_video"}	192.168.1.20	2026-06-14 20:00:15.915389
90	10	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.183	2025-12-30 20:00:15.915462
91	10	ver_video	{"info": "Acción ver_video"}	192.168.1.97	2026-01-20 20:00:15.915544
92	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.207	2026-05-12 20:00:15.915612
93	10	login	{"info": "Acción login"}	192.168.1.224	2026-03-27 20:00:15.915698
94	10	login	{"info": "Acción login"}	192.168.1.156	2025-12-31 20:00:15.915792
95	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.245	2026-02-16 20:00:15.915873
96	2	subir_documento	{"info": "Acción subir_documento"}	192.168.1.90	2026-03-16 20:00:15.915958
97	2	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.136	2026-06-14 20:00:15.916034
98	2	completar_video	{"info": "Acción completar_video"}	192.168.1.94	2026-03-16 20:00:15.91611
99	2	subir_documento	{"info": "Acción subir_documento"}	192.168.1.187	2026-01-02 20:00:15.916205
100	2	completar_video	{"info": "Acción completar_video"}	192.168.1.113	2026-02-21 20:00:15.916286
101	2	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.210	2026-04-30 20:00:15.916376
102	2	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.114	2026-01-19 20:00:15.916457
103	2	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.189	2026-03-19 20:00:15.916527
104	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.73	2026-03-05 20:00:15.916608
105	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.151	2026-02-06 20:00:15.916689
106	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.154	2026-05-05 20:00:15.916752
107	4	login	{"info": "Acción login"}	192.168.1.197	2026-04-16 20:00:15.916788
108	4	login	{"info": "Acción login"}	192.168.1.148	2026-01-20 20:00:15.916822
109	4	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.33	2026-05-07 20:00:15.916855
110	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.203	2026-05-25 20:00:15.916889
111	4	login	{"info": "Acción login"}	192.168.1.77	2026-01-31 20:00:15.916942
112	4	completar_video	{"info": "Acción completar_video"}	192.168.1.252	2026-02-14 20:00:15.916994
113	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.87	2026-06-16 20:00:15.917028
114	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.241	2026-05-11 20:00:15.917061
115	4	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.216	2026-03-02 20:00:15.917095
116	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.38	2026-01-16 20:00:15.917129
117	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 20:00:49.295091
118	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 20:07:06.224728
119	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-19 20:12:13.787058
120	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-20 08:51:56.733363
121	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-20 08:54:35.510058
122	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-20 09:13:48.822473
123	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-20 12:19:12.944757
124	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-25 15:35:48.272037
125	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-25 15:36:12.838636
126	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:07:31.469524
127	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:08:50.385634
128	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:12:23.060106
129	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:17:39.012092
130	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:23:18.233469
131	6	responder_hilo	{"info": "Acción generada automáticamente"}	192.168.1.196	2026-06-13 10:28:40.992884
132	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:41:35.47299
133	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:50:38.561948
134	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 10:59:13.318701
135	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:00:01.919784
136	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:20:07.418276
137	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:24:04.976228
138	4	login	{"email": "atleta2@iqfoil.cu", "nombre": "María García"}	127.0.0.1	2026-06-26 11:41:27.953739
139	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-26 11:42:38.416357
140	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:47:27.190457
141	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:48:02.662904
142	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:50:42.039937
143	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 11:58:35.170803
144	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-26 12:04:31.563118
177	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 12:35:31.111347
178	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 12:46:50.710153
179	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-26 12:51:16.613908
180	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:01:23.49399
181	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:34:52.08979
182	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-26 13:35:26.295863
183	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-26 13:36:22.084034
184	5	subir_documento	{"info": "Acción subir_documento"}	192.168.1.70	2026-04-28 13:43:56.280716
185	5	subir_documento	{"info": "Acción subir_documento"}	192.168.1.49	2026-05-08 13:43:56.280952
186	5	login	{"info": "Acción login"}	192.168.1.47	2026-03-23 13:43:56.281016
187	5	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.171	2026-05-01 13:43:56.281063
188	5	login	{"info": "Acción login"}	192.168.1.17	2026-04-05 13:43:56.281107
189	5	ver_video	{"info": "Acción ver_video"}	192.168.1.206	2026-01-17 13:43:56.281149
190	5	completar_video	{"info": "Acción completar_video"}	192.168.1.75	2026-04-29 13:43:56.281191
191	5	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.234	2026-03-12 13:43:56.281243
192	5	login	{"info": "Acción login"}	192.168.1.183	2026-03-20 13:43:56.281286
193	5	ver_video	{"info": "Acción ver_video"}	192.168.1.31	2026-05-02 13:43:56.281327
194	5	login	{"info": "Acción login"}	192.168.1.97	2026-04-07 13:43:56.281371
195	5	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.16	2026-06-12 13:43:56.281412
196	5	ver_video	{"info": "Acción ver_video"}	192.168.1.37	2026-02-19 13:43:56.281452
197	5	subir_documento	{"info": "Acción subir_documento"}	192.168.1.22	2026-01-20 13:43:56.281491
198	5	ver_video	{"info": "Acción ver_video"}	192.168.1.52	2026-02-25 13:43:56.281537
199	6	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.245	2026-05-24 13:43:56.281588
200	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.23	2026-03-13 13:43:56.281629
201	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.79	2026-03-23 13:43:56.281668
202	6	completar_video	{"info": "Acción completar_video"}	192.168.1.70	2026-05-07 13:43:56.281707
203	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.45	2026-05-20 13:43:56.281745
204	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.197	2026-05-30 13:43:56.281784
205	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.51	2026-05-21 13:43:56.28185
206	6	ver_video	{"info": "Acción ver_video"}	192.168.1.132	2026-02-15 13:43:56.281894
207	6	subir_documento	{"info": "Acción subir_documento"}	192.168.1.154	2026-03-24 13:43:56.282225
208	6	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.185	2026-01-01 13:43:56.282283
209	6	login	{"info": "Acción login"}	192.168.1.155	2026-05-28 13:43:56.282328
210	6	ver_video	{"info": "Acción ver_video"}	192.168.1.87	2026-06-11 13:43:56.282383
211	7	ver_video	{"info": "Acción ver_video"}	192.168.1.136	2026-06-22 13:43:56.282456
212	7	login	{"info": "Acción login"}	192.168.1.187	2026-01-08 13:43:56.282531
213	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.142	2026-05-11 13:43:56.282602
214	7	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.101	2026-02-20 13:43:56.282676
215	7	ver_video	{"info": "Acción ver_video"}	192.168.1.174	2026-03-15 13:43:56.282761
216	7	ver_video	{"info": "Acción ver_video"}	192.168.1.102	2026-05-11 13:43:56.282874
217	7	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.12	2026-01-23 13:43:56.282955
218	7	ver_video	{"info": "Acción ver_video"}	192.168.1.247	2026-03-19 13:43:56.283069
219	7	ver_video	{"info": "Acción ver_video"}	192.168.1.107	2026-06-23 13:43:56.283158
220	8	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.104	2026-03-12 13:43:56.283262
221	8	subir_documento	{"info": "Acción subir_documento"}	192.168.1.98	2026-04-16 13:43:56.283352
222	8	completar_video	{"info": "Acción completar_video"}	192.168.1.116	2026-01-07 13:43:56.283425
223	8	login	{"info": "Acción login"}	192.168.1.8	2026-05-09 13:43:56.283527
224	8	login	{"info": "Acción login"}	192.168.1.48	2026-04-30 13:43:56.283617
225	8	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.114	2026-06-02 13:43:56.283676
226	8	login	{"info": "Acción login"}	192.168.1.59	2026-01-09 13:43:56.283731
227	8	subir_documento	{"info": "Acción subir_documento"}	192.168.1.245	2026-01-19 13:43:56.283784
228	8	login	{"info": "Acción login"}	192.168.1.80	2026-02-12 13:43:56.283925
229	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.64	2026-01-16 13:43:56.284029
230	9	subir_documento	{"info": "Acción subir_documento"}	192.168.1.227	2026-05-26 13:43:56.28413
231	9	completar_video	{"info": "Acción completar_video"}	192.168.1.173	2026-03-07 13:43:56.284221
232	9	ver_video	{"info": "Acción ver_video"}	192.168.1.50	2026-02-24 13:43:56.28432
233	9	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.218	2026-01-18 13:43:56.284393
234	9	login	{"info": "Acción login"}	192.168.1.175	2026-02-25 13:43:56.284459
235	9	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.199	2026-02-27 13:43:56.284527
236	10	completar_video	{"info": "Acción completar_video"}	192.168.1.6	2026-06-20 13:43:56.284603
237	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.118	2026-03-12 13:43:56.28467
238	10	login	{"info": "Acción login"}	192.168.1.237	2026-03-01 13:43:56.284711
239	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.61	2026-03-23 13:43:56.284748
240	10	completar_video	{"info": "Acción completar_video"}	192.168.1.73	2026-01-01 13:43:56.284793
241	10	login	{"info": "Acción login"}	192.168.1.218	2026-06-14 13:43:56.284859
242	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.51	2026-03-24 13:43:56.284899
243	10	completar_video	{"info": "Acción completar_video"}	192.168.1.85	2026-03-05 13:43:56.284937
244	10	completar_video	{"info": "Acción completar_video"}	192.168.1.72	2026-03-22 13:43:56.284983
245	10	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.75	2026-04-02 13:43:56.285021
246	10	ver_video	{"info": "Acción ver_video"}	192.168.1.114	2026-04-02 13:43:56.285058
247	10	ver_video	{"info": "Acción ver_video"}	192.168.1.25	2026-05-06 13:43:56.285096
248	10	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.103	2026-05-02 13:43:56.285135
249	10	completar_video	{"info": "Acción completar_video"}	192.168.1.132	2026-02-20 13:43:56.285174
250	10	subir_documento	{"info": "Acción subir_documento"}	192.168.1.22	2026-04-05 13:43:56.285215
251	2	ver_video	{"info": "Acción ver_video"}	192.168.1.32	2026-01-10 13:43:56.285256
252	2	login	{"info": "Acción login"}	192.168.1.10	2026-05-12 13:43:56.285308
253	2	login	{"info": "Acción login"}	192.168.1.110	2026-02-18 13:43:56.285349
254	2	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.49	2026-05-13 13:43:56.285389
255	2	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.14	2026-06-22 13:43:56.285428
256	2	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.88	2026-01-04 13:43:56.285467
257	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.162	2026-01-01 13:43:56.285515
258	4	completar_video	{"info": "Acción completar_video"}	192.168.1.230	2026-01-31 13:43:56.285554
259	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.114	2026-03-16 13:43:56.285592
260	4	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.216	2026-02-12 13:43:56.285637
261	4	login	{"info": "Acción login"}	192.168.1.36	2026-05-19 13:43:56.285677
262	4	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.82	2026-04-29 13:43:56.285727
263	4	login	{"info": "Acción login"}	192.168.1.249	2026-04-14 13:43:56.285769
264	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.76	2026-04-10 13:43:56.285836
265	4	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.120	2026-05-09 13:43:56.285897
266	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.160	2026-06-22 13:43:56.285938
267	4	login	{"info": "Acción login"}	192.168.1.53	2026-03-06 13:43:56.285977
268	4	login	{"info": "Acción login"}	192.168.1.7	2026-02-09 13:43:56.286017
269	4	completar_video	{"info": "Acción completar_video"}	192.168.1.78	2026-01-17 13:43:56.286056
270	4	subir_documento	{"info": "Acción subir_documento"}	192.168.1.9	2026-06-15 13:43:56.286107
271	4	completar_video	{"info": "Acción completar_video"}	192.168.1.61	2026-06-26 13:43:56.286162
272	1	ver_video	{"info": "Acción ver_video"}	192.168.1.176	2026-01-03 13:43:56.286265
273	1	ver_video	{"info": "Acción ver_video"}	192.168.1.108	2026-02-09 13:43:56.286356
274	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.85	2026-06-24 13:43:56.286447
275	1	ver_video	{"info": "Acción ver_video"}	192.168.1.168	2026-03-28 13:43:56.286526
276	1	login	{"info": "Acción login"}	192.168.1.8	2026-05-07 13:43:56.286617
277	1	completar_video	{"info": "Acción completar_video"}	192.168.1.69	2026-05-22 13:43:56.286697
278	1	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.174	2026-04-25 13:43:56.28678
279	1	login	{"info": "Acción login"}	192.168.1.64	2026-05-17 13:43:56.286887
280	1	completar_video	{"info": "Acción completar_video"}	192.168.1.232	2026-05-07 13:43:56.286947
281	1	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.249	2026-06-20 13:43:56.28699
282	1	subir_documento	{"info": "Acción subir_documento"}	192.168.1.1	2026-06-16 13:43:56.287031
283	1	completar_video	{"info": "Acción completar_video"}	192.168.1.210	2026-01-01 13:43:56.287071
284	1	login	{"info": "Acción login"}	192.168.1.240	2026-06-12 13:43:56.287118
285	1	ver_video	{"info": "Acción ver_video"}	192.168.1.170	2026-05-09 13:43:56.287259
286	3	subir_documento	{"info": "Acción subir_documento"}	192.168.1.145	2026-04-21 13:43:56.287306
287	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.186	2026-03-25 13:43:56.287347
288	3	completar_video	{"info": "Acción completar_video"}	192.168.1.91	2026-04-23 13:43:56.287387
289	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.100	2026-02-14 13:43:56.287427
290	3	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.140	2026-04-01 13:43:56.287468
291	3	completar_video	{"info": "Acción completar_video"}	192.168.1.122	2026-03-28 13:43:56.287519
292	3	ver_video	{"info": "Acción ver_video"}	192.168.1.130	2026-05-23 13:43:56.287564
293	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.224	2026-04-30 13:43:56.287603
294	3	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.82	2026-05-11 13:43:56.28765
295	3	responder_hilo	{"info": "Acción responder_hilo"}	192.168.1.226	2026-04-09 13:43:56.287691
296	3	crear_hilo	{"info": "Acción crear_hilo"}	192.168.1.199	2026-04-20 13:43:56.287731
297	3	completar_video	{"info": "Acción completar_video"}	192.168.1.169	2026-04-12 13:43:56.28777
298	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:44:42.233975
299	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-26 13:45:20.234468
300	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:50:38.528144
301	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:54:09.678865
302	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 13:57:36.263561
303	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-26 13:58:14.983483
304	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-26 14:15:18.320484
305	2	login	{"email": "entrenador@iqfoil.cu", "nombre": "Carlos Gómez"}	127.0.0.1	2026-06-29 13:54:55.561546
306	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-29 15:42:12.485074
307	1	login	{"email": "admin@iqfoil.cu", "nombre": "Administrador"}	127.0.0.1	2026-06-29 15:46:03.115222
308	3	login	{"email": "atleta1@iqfoil.cu", "nombre": "Juan Pérez"}	127.0.0.1	2026-06-29 15:52:26.341249
\.


--
-- Data for Name: mensaje; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.mensaje (id, hilo_id, autor_id, contenido, fecha) FROM stdin;
1	1	2	depende de la bandera	2026-06-01 22:20:05.094293
3	1	1	hola se considera el uso de bandera negra\n	2026-06-29 13:53:50.310058
4	1	2	recuerden que con la bandera p tienen hasta un minuto para volver a entrar y salir por la linea\n	2026-06-29 13:55:39.774699
\.


--
-- Data for Name: mensaje_privado; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.mensaje_privado (id, conversacion_id, remitente_id, contenido, fecha, leido) FROM stdin;
\.


--
-- Data for Name: mentoria; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.mentoria (id, mentor_id, aprendiz_id, area, estado, fecha_inicio, fecha_solicitud) FROM stdin;
\.


--
-- Data for Name: participante_evento; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.participante_evento (evento_id, usuario_id, fecha_inscripcion) FROM stdin;
\.


--
-- Data for Name: pregunta; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.pregunta (id, examen_id, texto, tipo, opciones, respuesta_correcta, puntaje, explicacion, nivel, categoria, orden) FROM stdin;
1	1	¿Cuál es la prioridad entre dos barcos que se aproximan por babor?	opcion_unica	["El barco que viene por estribor tiene prioridad", "El barco que viene por babor tiene prioridad", "El barco más grande tiene prioridad", "El que va más rápido tiene prioridad"]	"El barco que viene por estribor tiene prioridad"	2	Según la regla 10 del RIPA, cuando dos barcos se aproximan por babor, el que viene por estribor es el que tiene prioridad.	principiante	reglamento	1
2	1	En una regata, un barco que está virando debe mantener su rumbo hasta completar la virada.	verdadero_falso	\N	true	1	Es correcto: durante la virada, el barco debe completarla sin cambiar de rumbo hasta que esté en la nueva dirección.	principiante	reglamento	2
3	1	¿Qué bandera se utiliza para indicar la salida de una regata?	opcion_unica	["Bandera azul", "Bandera roja", "Bandera amarilla", "Bandera verde"]	"Bandera roja"	1	La bandera roja es la que se iza para dar la señal de salida en la mayoría de las regatas.	principiante	reglamento	3
4	2	¿Qué tipo de nube indica generalmente la llegada de un frente frío?	opcion_unica	["Cúmulos", "Estratos", "Cumulonimbos", "Cirros"]	"Cumulonimbos"	2	Los cumulonimbos son nubes de tormenta que suelen asociarse con frentes fríos y pueden traer viento fuerte y lluvia.	intermedio	meteorología	1
5	2	El viento de tierra siempre es más fuerte que el viento de mar.	verdadero_falso	\N	false	1	Falso: el viento de mar suele ser más constante y fuerte, mientras que el de tierra puede ser más variable.	intermedio	meteorología	2
6	2	¿Qué significa la presión atmosférica en un barómetro cuando desciende rápidamente?	opcion_unica	["Buen tiempo", "Tormenta", "Niebla", "Viento calmo"]	"Tormenta"	2	Un descenso rápido de la presión indica la aproximación de una borrasca y mal tiempo.	intermedio	meteorología	3
7	3	¿Cuál es el ángulo de ataque óptimo para mantener el vuelo en foil en condiciones de viento medio?	opcion_unica	["2° a 3°", "5° a 7°", "10° a 12°", "15° a 18°"]	"5° a 7°"	2	Para mantener el foil en vuelo con viento medio, se recomienda un ángulo de ataque entre 5° y 7° para optimizar la sustentación sin aumentar excesivamente la resistencia.	avanzado	técnica	1
8	3	En condiciones de ola grande, es recomendable aumentar el rake del mástil para mejorar la estabilidad.	verdadero_falso	\N	true	1	Correcto: aumentar el rake del mástil (inclinarlo hacia atrás) ayuda a mantener el foil más estable en olas grandes.	avanzado	técnica	2
9	3	¿Qué ajuste se debe realizar en el foil para reducir la resistencia al avance en aguas planas?	opcion_unica	["Aumentar el ángulo de ataque", "Reducir el ángulo de ataque", "Aumentar la superficie alar", "Reducir la superficie alar"]	"Reducir el ángulo de ataque"	2	En aguas planas, un ángulo de ataque más bajo reduce la resistencia y permite mayor velocidad.	avanzado	técnica	3
10	3	El foil de popa siempre debe tener un mayor ángulo de ataque que el de proa.	verdadero_falso	\N	false	1	Falso: el ángulo de ataque de los foils se ajusta según el equilibrio y las condiciones; no hay una regla fija.	avanzado	técnica	4
\.


--
-- Data for Name: progreso_video; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.progreso_video (usuario_id, video_id, progreso, completado, ultima_visualizacion) FROM stdin;
3	1	100	t	2026-06-01 11:00:00
4	11	50	f	2026-05-23 20:00:15.647239
5	1	0	f	2026-01-22 20:00:15.671032
5	2	100	t	2026-02-05 20:00:15.6728
5	3	30	f	2026-02-11 20:00:15.675428
5	11	100	t	2026-03-05 20:00:15.68335
9	11	100	t	2026-03-30 20:00:15.738715
3	2	100	t	2026-01-15 10:00:00
3	3	70	f	2026-02-20 14:30:00
3	11	50	f	2026-04-05 16:00:00
4	1	100	t	2026-01-22 11:00:00
4	2	80	f	2026-02-28 15:00:00
4	3	100	t	2026-03-15 08:30:00
6	1	100	t	2026-01-05 10:00:00
6	2	100	t	2026-02-10 12:00:00
6	3	90	f	2026-03-20 14:00:00
6	11	70	f	2026-06-01 09:00:00
7	1	100	t	2026-01-10 10:00:00
7	2	100	t	2026-02-15 11:00:00
7	3	100	t	2026-03-25 12:00:00
7	11	60	f	2026-05-15 14:00:00
8	1	100	t	2026-01-12 10:00:00
8	2	100	t	2026-02-18 11:00:00
8	3	100	t	2026-03-22 12:00:00
8	11	50	f	2026-05-20 14:00:00
9	1	100	t	2026-01-18 10:00:00
9	2	100	t	2026-02-25 11:00:00
9	3	80	f	2026-03-30 12:00:00
10	1	100	t	2026-01-20 10:00:00
10	2	100	t	2026-02-28 11:00:00
10	3	90	f	2026-03-28 12:00:00
10	11	50	f	2026-06-05 14:00:00
3	26	30	f	2026-02-22 13:43:55.595838
3	27	100	t	2026-02-25 13:43:55.599012
3	28	50	f	2026-04-24 13:43:55.610944
3	29	50	f	2026-02-05 13:43:55.615342
3	30	30	f	2026-05-10 13:43:55.617124
3	31	0	f	2026-06-10 13:43:55.618742
3	32	0	f	2026-02-03 13:43:55.620421
3	33	50	f	2025-12-28 13:43:55.622201
3	34	100	t	2026-03-26 13:43:55.624285
3	35	0	f	2026-06-02 13:43:55.627146
3	36	50	f	2026-05-17 13:43:55.631205
3	37	50	f	2026-01-13 13:43:55.633959
4	26	30	f	2026-02-23 13:43:55.68263
4	27	70	f	2026-01-16 13:43:55.684013
4	28	0	f	2026-02-17 13:43:55.686258
4	29	50	f	2026-03-18 13:43:55.688266
4	30	0	f	2026-06-12 13:43:55.690395
4	31	50	f	2026-05-18 13:43:55.694696
4	32	30	f	2026-05-10 13:43:55.698915
4	33	70	f	2026-06-11 13:43:55.703148
4	34	0	f	2026-04-28 13:43:55.706217
4	35	100	t	2026-05-10 13:43:55.708197
4	36	50	f	2026-01-20 13:43:55.710208
4	37	50	f	2026-04-18 13:43:55.712382
6	26	50	f	2026-02-15 13:43:55.74569
6	27	70	f	2026-03-01 13:43:55.746919
6	28	50	f	2026-05-11 13:43:55.749205
6	29	100	t	2026-04-19 13:43:55.751376
6	30	70	f	2026-01-20 13:43:55.754074
6	31	50	f	2026-03-05 13:43:55.755979
6	32	70	f	2026-02-15 13:43:55.758267
6	33	50	f	2026-04-21 13:43:55.759996
6	34	50	f	2026-06-18 13:43:55.761964
6	35	100	t	2026-02-17 13:43:55.764796
6	36	50	f	2026-04-16 13:43:55.767097
6	37	100	t	2026-02-20 13:43:55.768926
5	26	100	t	2026-01-02 13:43:55.805043
5	27	30	f	2026-03-20 13:43:55.806492
5	28	70	f	2026-04-25 13:43:55.809022
5	29	100	t	2026-04-17 13:43:55.811514
5	30	0	f	2026-02-20 13:43:55.814066
5	31	70	f	2026-05-28 13:43:55.816816
5	32	50	f	2026-04-27 13:43:55.819411
5	33	30	f	2026-03-25 13:43:55.821786
5	34	50	f	2026-06-04 13:43:55.824235
5	35	0	f	2026-06-12 13:43:55.826835
5	36	100	t	2026-05-02 13:43:55.8295
5	37	0	f	2026-04-09 13:43:55.831617
7	26	70	f	2025-12-29 13:43:55.873136
7	27	50	f	2026-06-02 13:43:55.87458
7	28	0	f	2026-05-19 13:43:55.876987
7	29	100	t	2026-04-25 13:43:55.879355
7	30	100	t	2026-03-17 13:43:55.881929
7	31	70	f	2026-06-07 13:43:55.884267
7	32	100	t	2026-03-02 13:43:55.886591
7	33	50	f	2026-04-21 13:43:55.888908
7	34	70	f	2026-06-16 13:43:55.891221
7	35	50	f	2026-02-14 13:43:55.893445
7	36	70	f	2026-04-13 13:43:55.89537
7	37	100	t	2026-01-02 13:43:55.8973
8	26	30	f	2026-04-02 13:43:55.946167
8	27	50	f	2026-01-14 13:43:55.947339
8	28	30	f	2026-01-12 13:43:55.949975
8	29	0	f	2026-04-02 13:43:55.952458
8	30	50	f	2026-01-23 13:43:55.955307
8	31	0	f	2026-06-05 13:43:55.957777
8	32	30	f	2026-05-03 13:43:55.960239
8	33	50	f	2026-04-11 13:43:55.962686
8	34	70	f	2026-05-15 13:43:55.96564
8	35	50	f	2026-04-17 13:43:55.967795
8	36	30	f	2026-03-11 13:43:55.969687
8	37	70	f	2026-02-08 13:43:55.97147
9	26	70	f	2026-05-28 13:43:56.010369
9	27	100	t	2026-03-11 13:43:56.011513
9	28	0	f	2026-04-19 13:43:56.01375
9	29	70	f	2026-03-07 13:43:56.016112
9	30	30	f	2026-06-02 13:43:56.018429
9	31	30	f	2026-02-28 13:43:56.020589
9	32	70	f	2026-04-02 13:43:56.022727
9	33	100	t	2026-04-01 13:43:56.024882
9	34	100	t	2025-12-28 13:43:56.027235
9	35	70	f	2026-06-04 13:43:56.029478
9	36	50	f	2026-04-12 13:43:56.031667
9	37	70	f	2026-03-09 13:43:56.033817
10	26	70	f	2026-04-11 13:43:56.075349
10	27	30	f	2026-01-09 13:43:56.076451
10	28	100	t	2026-01-17 13:43:56.07877
10	29	50	f	2026-03-17 13:43:56.081355
10	30	0	f	2026-03-19 13:43:56.083677
10	31	50	f	2025-12-30 13:43:56.086005
10	32	50	f	2026-04-22 13:43:56.088345
10	33	30	f	2026-02-20 13:43:56.090947
10	34	100	t	2026-05-07 13:43:56.093354
10	35	0	f	2026-01-15 13:43:56.095676
10	36	50	f	2026-01-04 13:43:56.097993
10	37	100	t	2026-04-04 13:43:56.100403
\.


--
-- Data for Name: puntuacion_evaluacion; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.puntuacion_evaluacion (evaluacion_id, criterio_id, puntuacion) FROM stdin;
1	1	4
1	2	4
1	3	0
2	1	3
2	2	0
2	3	5
3	1	5
3	2	4
3	3	4
4	1	1
4	2	5
4	3	4
5	1	5
5	3	3
6	1	0
6	2	5
6	3	0
7	1	3
7	2	5
7	3	5
8	1	3
8	2	2
8	3	1
9	1	2
9	2	2
9	3	2
10	1	4
10	2	1
10	3	5
11	1	3
11	2	1
11	3	4
12	1	2
12	2	5
12	3	2
13	1	1
13	2	5
13	3	4
14	1	1
14	2	4
14	3	4
15	1	3
15	2	1
15	3	4
16	1	1
16	2	4
16	3	2
17	1	0
17	2	1
17	3	1
18	1	3
18	2	3
18	3	3
19	1	1
19	2	4
19	3	4
20	1	2
20	2	1
20	3	2
21	1	0
21	2	2
21	3	5
22	1	4
22	2	2
22	3	4
23	1	0
23	2	5
23	3	4
24	1	4
24	2	5
24	3	0
25	1	0
25	2	4
25	3	0
26	1	0
26	2	3
26	3	2
27	1	0
27	2	5
27	3	5
28	1	3
28	2	3
28	3	1
29	1	4
29	2	1
29	3	4
30	1	1
30	2	2
30	3	0
31	1	4
31	2	1
31	3	1
32	1	5
32	2	2
32	3	3
33	1	3
33	2	5
33	3	0
35	1	3
35	2	2
35	3	5
36	1	4
36	2	3
36	3	5
37	1	2
37	2	4
37	3	4
38	1	0
38	2	2
38	3	2
39	1	2
39	2	0
39	3	1
40	1	3
40	2	1
40	3	0
41	1	2
41	2	0
41	3	1
42	1	2
42	2	3
42	3	4
43	1	5
43	2	3
43	3	4
44	1	2
44	2	1
44	3	4
45	1	1
45	2	2
45	3	3
46	1	5
46	2	4
46	3	0
47	1	2
47	2	3
47	3	1
48	1	1
48	2	2
48	3	1
49	1	5
49	2	1
49	3	3
50	1	3
50	2	3
50	3	0
51	1	1
51	2	1
51	3	0
52	1	4
52	2	2
52	3	3
53	1	3
53	2	4
53	3	2
54	1	0
54	2	2
54	3	3
55	1	1
55	2	3
55	3	4
56	1	2
56	2	2
56	3	0
57	1	0
57	2	5
57	3	2
58	1	3
58	2	1
58	3	0
59	1	2
59	2	4
59	3	1
60	1	3
60	2	1
60	3	0
61	1	3
61	2	3
61	3	5
5	2	2
\.


--
-- Data for Name: respuesta_usuario; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.respuesta_usuario (id, examen_id, usuario_id, respuestas, fecha_inicio, fecha_envio, puntaje_obtenido, porcentaje, aprobado, estado) FROM stdin;
\.


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.rol (id, nombre, descripcion) FROM stdin;
1	admin	Administrador del sistema
2	entrenador	Entrenador o evaluador
3	atleta	Usuario atleta
\.


--
-- Data for Name: rubrica; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.rubrica (id, titulo, descripcion, creador_id, fecha_creacion) FROM stdin;
1	Técnica de virada	Evaluación de la maniobra de virada	\N	2026-06-01 22:20:05.090094
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.usuario (id, email, password_hash, nombre, avatar_url, rol_id, activo, ultimo_acceso, fecha_registro, avatar, preferencias, provincia) FROM stdin;
5	atleta3@iqfoil.cu	scrypt:32768:8:1$F24BJKFz5RJ2SihH$86704f4a09e724463afc5802484d254c9f4abcd92751e02f511156cd21c53fbadc99c5d0a2f98189526c86140e0a6644329460ffbaf9532369629b3046edc326	Pedro Rodríguez	\N	3	t	2026-06-19 18:45:40.218277	2026-06-19 17:41:16.556994	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Villa Clara
6	atleta4@iqfoil.cu	scrypt:32768:8:1$XvWsiScpcKzKHDtm$b7fa92667441851702f049edc2546b8b8c6f8c59f1ec9e47914dc455753d4177c393c3c853a219944c36f87921698a8f35c90d934dbdb62e5bc46ae06d7f91b3	Luis Fernández	\N	3	t	2026-06-25 18:19:40.116979	2026-06-19 20:00:14.933259	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Camagüey
7	atleta5@iqfoil.cu	scrypt:32768:8:1$kXSFv4sBXPTEWIbc$86de0148d516c6ccfeb2c0f84a89e8729fb42c2d2d04d7c28eedd5ff29edcee1754cf3f982b73e13e8c95b06f54ccafce5118ae5ba5e0bc6289523eef2e00a3c	Ana Torres	\N	3	t	2026-06-24 23:22:13.17207	2026-06-19 20:00:14.933259	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Santiago de Cuba
8	atleta6@iqfoil.cu	scrypt:32768:8:1$JPLigriBjuUooHKu$9af4b2bad7378a8e518222d0e9f711285aeb173c8b599df46f5fb36e329a2736d14d5014689750aea4addf84e939cd1afde21dd2175b98b2cba2235c3eb688e7	José Ramírez	\N	3	t	2026-06-21 18:42:16.637331	2026-06-19 20:00:14.933259	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Holguín
9	atleta7@iqfoil.cu	scrypt:32768:8:1$ZY1jPhe4VaUBNgn6$983a03d9303edd19d874687b440184d7b0d9386610d11227040900438b620fadc8ad5a20821ab293c1fba07c63972504f7188a0fec4181cb95ac6de038902fa2	Marta Díaz	\N	3	t	2026-06-23 02:23:45.769195	2026-06-19 20:00:14.933259	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Villa Clara
10	atleta8@iqfoil.cu	scrypt:32768:8:1$pkDAzkoBNXgCPka0$b8cbf19a7b9b7df16d55ea9f807a034ffcc098b28086e1dae6a95b9aa661d3f287e7c2051ff4140918bcf372c8af93e1e8414386912f48d50d1a56a1ff04959b	Roberto Mena	\N	3	t	2026-06-26 09:58:44.213322	2026-06-19 20:00:14.933259	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	La Habana
2	entrenador@iqfoil.cu	scrypt:32768:8:1$s9LtZkIsgV5esacm$a4eefee377931a07b4ab57275f816f6654eac3f219a8d4d8afe2b5ae080ac21949ba9b661f615c78d63bea8e6993dc8ecdf497e134518755080a36713a43e931	Carlos Gómez	\N	2	t	2026-06-29 13:54:55.747113	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "contraste": "normal", "tamanoFuente": "mediano", "notificacionesEmail": true}	La Habana
1	admin@iqfoil.cu	scrypt:32768:8:1$VT4JiKLKk40tMPFE$3cc794ca61f444d35aad6d1a81e18aef7d3781d741c95eb22ce3120f8c29cd035507f960281bb0be6e8dcaeb09466b92cdc9b6707a2637b757e1d32ed7a43ad7	Administrador	\N	1	t	2026-06-29 15:46:03.253202	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	La Habana
3	atleta1@iqfoil.cu	scrypt:32768:8:1$ZdgwSvRctEglinIi$ad33c68da4378825633e8b346efd128aaceb3a0f87aa8027447e1641039b08ccb0c7e8ccd83f2ec17cd584ffbe119d32231d270cc672e23484e150d047aaa3e7	Juan Pérez	\N	3	t	2026-06-29 15:52:26.511171	2026-06-01 22:20:05.081416	\N	{"tema": "sistema", "idioma": "es", "notificacionesEmail": true}	La Habana
4	atleta2@iqfoil.cu	scrypt:32768:8:1$RH5ISwhSV192lBIf$9a36bc43f038529911c650c94e24fce1caf515c74d955b9452b223316de339f7fe1e2fc818db2a453be7dd1717384a600ec2b6b5d4fb53149e738fa265c7f4b8	María García	\N	3	t	2026-06-26 11:41:28.094673	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	Santiago de Cuba
\.


--
-- Data for Name: usuario_insignia; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.usuario_insignia (usuario_id, insignia_id, fecha_obtenida) FROM stdin;
3	1	2026-06-01 22:20:05.106784
3	2	2026-01-04 20:00:15.86935
4	3	2026-02-19 20:00:15.873464
6	3	2026-03-01 20:00:15.875911
5	3	2025-12-29 20:00:15.879079
7	2	2026-06-18 20:00:15.882658
7	3	2026-06-18 20:00:15.884986
8	2	2026-05-16 20:00:15.887116
9	1	2026-04-20 20:00:15.89001
9	3	2026-03-05 20:00:15.893548
10	1	2026-06-09 20:00:15.897934
10	3	2026-01-27 20:00:15.90355
3	3	2026-03-15 00:00:00
4	1	2026-06-26 10:56:37.727812
4	2	2026-06-26 10:56:37.727812
6	1	2026-06-26 10:56:37.727812
6	2	2026-06-26 10:56:37.727812
5	1	2026-06-26 10:56:37.727812
5	2	2026-06-26 10:56:37.727812
7	1	2026-06-26 10:56:37.727812
8	1	2026-06-26 10:56:37.727812
8	3	2026-06-26 10:56:37.727812
9	2	2026-06-26 10:56:37.727812
10	2	2026-06-26 10:56:37.727812
\.


--
-- Data for Name: video_tutorial; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.video_tutorial (id, titulo, descripcion, url_video, duracion_seg, nivel, thumbnail_url, fecha_publicacion, activo) FROM stdin;
1	Introducción al foil	Conceptos básicos del foil	https://example.com/video1.mp4	360	principiante	https://example.com/thumb1.jpg	2026-06-01 22:20:05.088735	t
2	Técnica de virada	Aprende a virar correctamente	https://example.com/video2.mp4	480	intermedio	https://example.com/thumb2.jpg	2026-06-01 22:20:05.088735	t
3	Navegación con viento fuerte	Consejos para condiciones extremas	https://example.com/video3.mp4	600	avanzado	https://example.com/thumb3.jpg	2026-06-01 22:20:05.088735	t
11	Virada en ceñida	Virada en ceñida	uploads/videos/virada_ceñida.mp4	450	intermedio	\N	2026-06-19 20:00:15.572858	t
28	I Hate Fairyland - Resumen	Contenido variado (no relacionado con vela, pero disponible).	uploads/videos/I Hate Fairyland_ ¡El Viaje Más Violento al País de las Maravillas_ - Resumen(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
26	Cómo cuidar y terminar una superficie de foil	Tutorial sobre cuidado y acabado de superficies de foil.	uploads/videos/How to care for and finish a foil surface.mp4	0	intermedio	\N	2026-06-26 10:42:48.341046	t
27	Cómo hacer foil. Lección 1	Primera lección de foil: conceptos básicos.	uploads/videos/How to foil. Lesson 1(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
29	Diario de IQ Foil - Singapore Foil GP 2022 - Pasir Ris	Diario de competición: Singapore Foil GP 2022.	uploads/videos/IQ Foil Diary_ Singapore Foil GP 2022 - Pasir Ris(360P).mp4	0	avanzado	\N	2026-06-26 10:42:48.341046	t
30	IQFOIL - Episodio 5 - Cámara GoPro Fusion 360 en la marca de Jibe	Uso de cámara GoPro en la marca de jibe.	uploads/videos/IQFOIL - Episode 5_  GoPro Fusion 360 Camera on Jibe Mark(360P).mp4	0	intermedio	\N	2026-06-26 10:42:48.341046	t
31	IQFoil - Día de regata - Nacional de Slalom 2022 en Changi Beach	Día de regata en el Nacional de Slalom 2022.	uploads/videos/IQFoil - Race Day - 2022 Singapore Slalom Nationals at Changi Beach(360P).mp4	0	avanzado	\N	2026-06-26 10:42:48.341046	t
32	Ajuste del rake del mástil iQFoil	Ajuste del rake del mástil en iQFoil.	uploads/videos/iQFoil Mast Rake Adjustment(360P).mp4	0	avanzado	\N	2026-06-26 10:42:48.341046	t
33	IQFOIL Zero to Hero - Episodio 0 - Primer día de vuelo	Primer día de vuelo (foil) - episodio 0.	uploads/videos/IQFOIL Zero to Hero - Episode 0_ First Flight Day(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
34	IQFOIL Zero to Hero - Episodio 1 - Algunas ráfagas y práctica de jibe	Prácticas con ráfagas y jibe - episodio 1.	uploads/videos/IQFOIL Zero to Hero - Episode 1_ A few gusts and jibe practice(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
35	IQFOIL Zero to Hero - Episodio 2 - Encuentro cercano con la marca de gybe	Encuentro cercano con la marca de gybe - episodio 2.	uploads/videos/IQFOIL Zero to Hero - Episode 2_  Close encounter with gybe mark(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
36	IQFOIL Zero to Hero - Episodio 3 - Primer gybe en foil y día de práctica	Primer gybe en foil y día de práctica - episodio 3.	uploads/videos/IQFOIL Zero to Hero - Episode 3_ First Foil Gybe and Day of Practice(360P).mp4	0	principiante	\N	2026-06-26 10:42:48.341046	t
37	IQFOIL Zero to Hero - Episodio 4 - Navegando en una tormenta tropical del monzón del sureste	Navegando en tormenta tropical - episodio 4.	uploads/videos/IQFOIL Zero to Hero - Episode 4_ Foiling in a South East Monsoon Tropical Storm(360P).mp4	0	intermedio	\N	2026-06-26 10:42:48.341046	t
\.


--
-- Name: conversacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.conversacion_id_seq', 1, false);


--
-- Name: criterio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.criterio_id_seq', 7, true);


--
-- Name: curso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.curso_id_seq', 3, true);


--
-- Name: documento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.documento_id_seq', 13, true);


--
-- Name: evaluacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.evaluacion_id_seq', 64, true);


--
-- Name: evento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.evento_id_seq', 5, true);


--
-- Name: examen_teorico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.examen_teorico_id_seq', 3, true);


--
-- Name: foro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.foro_id_seq', 3, true);


--
-- Name: hilo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.hilo_id_seq', 3, true);


--
-- Name: insignia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.insignia_id_seq', 4, true);


--
-- Name: log_actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.log_actividad_id_seq', 308, true);


--
-- Name: mensaje_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mensaje_id_seq', 4, true);


--
-- Name: mensaje_privado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mensaje_privado_id_seq', 1, false);


--
-- Name: mentoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mentoria_id_seq', 1, false);


--
-- Name: pregunta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.pregunta_id_seq', 10, true);


--
-- Name: respuesta_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.respuesta_usuario_id_seq', 1, false);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.rol_id_seq', 3, true);


--
-- Name: rubrica_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.rubrica_id_seq', 3, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.usuario_id_seq', 5, true);


--
-- Name: video_tutorial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.video_tutorial_id_seq', 49, true);


--
-- Name: configuracion_usuario configuracion_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.configuracion_usuario
    ADD CONSTRAINT configuracion_usuario_pkey PRIMARY KEY (usuario_id);


--
-- Name: conversacion conversacion_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.conversacion
    ADD CONSTRAINT conversacion_pkey PRIMARY KEY (id);


--
-- Name: criterio criterio_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.criterio
    ADD CONSTRAINT criterio_pkey PRIMARY KEY (id);


--
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (id);


--
-- Name: documento documento_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.documento
    ADD CONSTRAINT documento_pkey PRIMARY KEY (id);


--
-- Name: evaluacion evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_pkey PRIMARY KEY (id);


--
-- Name: evento evento_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evento
    ADD CONSTRAINT evento_pkey PRIMARY KEY (id);


--
-- Name: examen_teorico examen_teorico_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.examen_teorico
    ADD CONSTRAINT examen_teorico_pkey PRIMARY KEY (id);


--
-- Name: foro foro_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.foro
    ADD CONSTRAINT foro_pkey PRIMARY KEY (id);


--
-- Name: hilo hilo_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.hilo
    ADD CONSTRAINT hilo_pkey PRIMARY KEY (id);


--
-- Name: insignia insignia_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.insignia
    ADD CONSTRAINT insignia_pkey PRIMARY KEY (id);


--
-- Name: log_actividad log_actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.log_actividad
    ADD CONSTRAINT log_actividad_pkey PRIMARY KEY (id);


--
-- Name: mensaje mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_pkey PRIMARY KEY (id);


--
-- Name: mensaje_privado mensaje_privado_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje_privado
    ADD CONSTRAINT mensaje_privado_pkey PRIMARY KEY (id);


--
-- Name: mentoria mentoria_mentor_id_aprendiz_id_key; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mentoria
    ADD CONSTRAINT mentoria_mentor_id_aprendiz_id_key UNIQUE (mentor_id, aprendiz_id);


--
-- Name: mentoria mentoria_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mentoria
    ADD CONSTRAINT mentoria_pkey PRIMARY KEY (id);


--
-- Name: participante_evento participante_evento_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.participante_evento
    ADD CONSTRAINT participante_evento_pkey PRIMARY KEY (evento_id, usuario_id);


--
-- Name: pregunta pregunta_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.pregunta
    ADD CONSTRAINT pregunta_pkey PRIMARY KEY (id);


--
-- Name: progreso_video progreso_video_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.progreso_video
    ADD CONSTRAINT progreso_video_pkey PRIMARY KEY (usuario_id, video_id);


--
-- Name: puntuacion_evaluacion puntuacion_evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.puntuacion_evaluacion
    ADD CONSTRAINT puntuacion_evaluacion_pkey PRIMARY KEY (evaluacion_id, criterio_id);


--
-- Name: respuesta_usuario respuesta_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.respuesta_usuario
    ADD CONSTRAINT respuesta_usuario_pkey PRIMARY KEY (id);


--
-- Name: rol rol_nombre_key; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id);


--
-- Name: rubrica rubrica_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rubrica
    ADD CONSTRAINT rubrica_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario_insignia usuario_insignia_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario_insignia
    ADD CONSTRAINT usuario_insignia_pkey PRIMARY KEY (usuario_id, insignia_id);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: video_tutorial video_tutorial_pkey; Type: CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.video_tutorial
    ADD CONSTRAINT video_tutorial_pkey PRIMARY KEY (id);


--
-- Name: idx_conversacion_unicos; Type: INDEX; Schema: public; Owner: joel
--

CREATE UNIQUE INDEX idx_conversacion_unicos ON public.conversacion USING btree (usuario1_id, usuario2_id);


--
-- Name: idx_criterio_rubrica; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_criterio_rubrica ON public.criterio USING btree (rubrica_id);


--
-- Name: idx_documento_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_documento_fecha ON public.documento USING btree (fecha_subida);


--
-- Name: idx_documento_tipo; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_documento_tipo ON public.documento USING btree (tipo);


--
-- Name: idx_evaluacion_estado; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_evaluacion_estado ON public.evaluacion USING btree (estado);


--
-- Name: idx_evaluacion_evaluador; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_evaluacion_evaluador ON public.evaluacion USING btree (evaluador_id);


--
-- Name: idx_evaluacion_usuario; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_evaluacion_usuario ON public.evaluacion USING btree (usuario_id);


--
-- Name: idx_evento_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_evento_fecha ON public.evento USING btree (fecha_inicio);


--
-- Name: idx_examen_activo; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_examen_activo ON public.examen_teorico USING btree (activo);


--
-- Name: idx_examen_nivel; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_examen_nivel ON public.examen_teorico USING btree (nivel);


--
-- Name: idx_hilo_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_hilo_fecha ON public.hilo USING btree (fecha_creacion);


--
-- Name: idx_hilo_foro; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_hilo_foro ON public.hilo USING btree (foro_id);


--
-- Name: idx_log_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_log_fecha ON public.log_actividad USING btree (fecha);


--
-- Name: idx_log_usuario; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_log_usuario ON public.log_actividad USING btree (usuario_id);


--
-- Name: idx_mensaje_hilo; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_mensaje_hilo ON public.mensaje USING btree (hilo_id);


--
-- Name: idx_mp_conversacion; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_mp_conversacion ON public.mensaje_privado USING btree (conversacion_id);


--
-- Name: idx_mp_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_mp_fecha ON public.mensaje_privado USING btree (fecha);


--
-- Name: idx_pregunta_examen; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_pregunta_examen ON public.pregunta USING btree (examen_id);


--
-- Name: idx_progreso_completado; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_progreso_completado ON public.progreso_video USING btree (completado);


--
-- Name: idx_progreso_usuario; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_progreso_usuario ON public.progreso_video USING btree (usuario_id);


--
-- Name: idx_usuario_email; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_usuario_email ON public.usuario USING btree (email);


--
-- Name: idx_usuario_rol; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_usuario_rol ON public.usuario USING btree (rol_id);


--
-- Name: idx_video_fecha; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_video_fecha ON public.video_tutorial USING btree (fecha_publicacion);


--
-- Name: idx_video_nivel; Type: INDEX; Schema: public; Owner: joel
--

CREATE INDEX idx_video_nivel ON public.video_tutorial USING btree (nivel);


--
-- Name: configuracion_usuario configuracion_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.configuracion_usuario
    ADD CONSTRAINT configuracion_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: conversacion conversacion_usuario1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.conversacion
    ADD CONSTRAINT conversacion_usuario1_id_fkey FOREIGN KEY (usuario1_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: conversacion conversacion_usuario2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.conversacion
    ADD CONSTRAINT conversacion_usuario2_id_fkey FOREIGN KEY (usuario2_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: criterio criterio_rubrica_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.criterio
    ADD CONSTRAINT criterio_rubrica_id_fkey FOREIGN KEY (rubrica_id) REFERENCES public.rubrica(id) ON DELETE CASCADE;


--
-- Name: documento documento_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.documento
    ADD CONSTRAINT documento_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: evaluacion evaluacion_evaluador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_evaluador_id_fkey FOREIGN KEY (evaluador_id) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: evaluacion evaluacion_rubrica_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_rubrica_id_fkey FOREIGN KEY (rubrica_id) REFERENCES public.rubrica(id);


--
-- Name: evaluacion evaluacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: evento evento_organizador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.evento
    ADD CONSTRAINT evento_organizador_id_fkey FOREIGN KEY (organizador_id) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: examen_teorico examen_teorico_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.examen_teorico
    ADD CONSTRAINT examen_teorico_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: hilo hilo_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.hilo
    ADD CONSTRAINT hilo_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: hilo hilo_foro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.hilo
    ADD CONSTRAINT hilo_foro_id_fkey FOREIGN KEY (foro_id) REFERENCES public.foro(id) ON DELETE CASCADE;


--
-- Name: log_actividad log_actividad_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.log_actividad
    ADD CONSTRAINT log_actividad_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: mensaje mensaje_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: mensaje mensaje_hilo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_hilo_id_fkey FOREIGN KEY (hilo_id) REFERENCES public.hilo(id) ON DELETE CASCADE;


--
-- Name: mensaje_privado mensaje_privado_conversacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje_privado
    ADD CONSTRAINT mensaje_privado_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.conversacion(id) ON DELETE CASCADE;


--
-- Name: mensaje_privado mensaje_privado_remitente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mensaje_privado
    ADD CONSTRAINT mensaje_privado_remitente_id_fkey FOREIGN KEY (remitente_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: mentoria mentoria_aprendiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mentoria
    ADD CONSTRAINT mentoria_aprendiz_id_fkey FOREIGN KEY (aprendiz_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: mentoria mentoria_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.mentoria
    ADD CONSTRAINT mentoria_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: participante_evento participante_evento_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.participante_evento
    ADD CONSTRAINT participante_evento_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.evento(id) ON DELETE CASCADE;


--
-- Name: participante_evento participante_evento_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.participante_evento
    ADD CONSTRAINT participante_evento_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: pregunta pregunta_examen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.pregunta
    ADD CONSTRAINT pregunta_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES public.examen_teorico(id) ON DELETE CASCADE;


--
-- Name: progreso_video progreso_video_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.progreso_video
    ADD CONSTRAINT progreso_video_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: progreso_video progreso_video_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.progreso_video
    ADD CONSTRAINT progreso_video_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.video_tutorial(id) ON DELETE CASCADE;


--
-- Name: puntuacion_evaluacion puntuacion_evaluacion_criterio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.puntuacion_evaluacion
    ADD CONSTRAINT puntuacion_evaluacion_criterio_id_fkey FOREIGN KEY (criterio_id) REFERENCES public.criterio(id) ON DELETE CASCADE;


--
-- Name: puntuacion_evaluacion puntuacion_evaluacion_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.puntuacion_evaluacion
    ADD CONSTRAINT puntuacion_evaluacion_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluacion(id) ON DELETE CASCADE;


--
-- Name: respuesta_usuario respuesta_usuario_examen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.respuesta_usuario
    ADD CONSTRAINT respuesta_usuario_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES public.examen_teorico(id) ON DELETE CASCADE;


--
-- Name: respuesta_usuario respuesta_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.respuesta_usuario
    ADD CONSTRAINT respuesta_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: rubrica rubrica_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.rubrica
    ADD CONSTRAINT rubrica_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- Name: usuario_insignia usuario_insignia_insignia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario_insignia
    ADD CONSTRAINT usuario_insignia_insignia_id_fkey FOREIGN KEY (insignia_id) REFERENCES public.insignia(id) ON DELETE CASCADE;


--
-- Name: usuario_insignia usuario_insignia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario_insignia
    ADD CONSTRAINT usuario_insignia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: usuario usuario_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joel
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.rol(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Kc6YXOv3KZ6PafcYx4r56n0qDKlNodSEGtMbwNVfAAwZctj12mJeVsoB0jbyZ5r

