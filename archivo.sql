--
-- PostgreSQL database dump
--

\restrict h1cePvnenE2KmkBRZaKO4tx22u82RujDCDhJCed0HXHXNQZkWWkX8sNRTbkq5Qf

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
\.


--
-- Data for Name: documento; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.documento (id, titulo, descripcion, tipo, url_archivo, tamano_bytes, autor_id, fecha_subida, version, aprobado) FROM stdin;
1	Reglamento 2025	Versión oficial del reglamento	pdf	/docs/reglamento2025.pdf	2500000	1	2026-06-01 22:20:05.100068	1	t
2	Plan de entrenamiento básico	Guía para principiantes	pdf	/docs/plan_entrenamiento.pdf	1800000	2	2026-06-01 22:20:05.100068	1	t
7	prueba		pdf	documentos/Joel_Rdz_CV_Desarrollador_Full-Stack_Webtoon__Comic_Digital_.pdf	384108	1	2026-06-10 21:46:47.731809	1	f
\.


--
-- Data for Name: evaluacion; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.evaluacion (id, titulo, usuario_id, evaluador_id, rubrica_id, video_url, fecha_entrega, fecha_evaluacion, estado, comentarios, puntuacion_total) FROM stdin;
\.


--
-- Data for Name: evento; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.evento (id, titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, organizador_id, max_participantes, imagen_url, publico) FROM stdin;
1	Regata de primavera	Competición anual	2025-05-15 10:00:00	\N	Club Náutico	regata	1	50	\N	t
2	Entrenamiento de foil	Sesión práctica	2025-06-10 16:00:00	\N	Puerto Deportivo	entrenamiento	2	20	\N	t
3	competencia	sdss	2026-06-18 21:02:00	2026-06-28 09:12:00	mata	entrenamiento	\N	\N	\N	t
\.


--
-- Data for Name: foro; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.foro (id, titulo, descripcion, orden) FROM stdin;
1	Reglamento	Dudas sobre las reglas de competición	0
2	Técnica	Consejos y preguntas sobre técnica	0
3	Material	Equipamiento y embarcaciones	0
\.


--
-- Data for Name: hilo; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.hilo (id, foro_id, titulo, autor_id, fecha_creacion, ultima_respuesta, contenido, respuestas, vistas, activo) FROM stdin;
1	1	¿Cómo se penaliza un fuera de línea?	3	2026-06-01 22:20:05.094293	\N	En una regata, ¿cuándo se considera fuera de línea?	0	0	t
2	1	poui	1	2026-06-10 21:51:17.701057	2026-06-10 21:51:17.701057	yuyu	0	0	t
3	2	prueba	1	2026-06-13 10:23:53.579927	2026-06-13 10:24:01.815271	hola	0	0	t
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
\.


--
-- Data for Name: mensaje; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.mensaje (id, hilo_id, autor_id, contenido, fecha) FROM stdin;
1	1	2	Depende de la situación, según la regla 42...	2026-06-01 22:20:05.094293
2	3	1	hola!	2026-06-13 10:24:01.815271
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
-- Data for Name: progreso_video; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.progreso_video (usuario_id, video_id, progreso, completado, ultima_visualizacion) FROM stdin;
1	24	100	t	2026-06-10 22:40:28.505325
\.


--
-- Data for Name: puntuacion_evaluacion; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.puntuacion_evaluacion (evaluacion_id, criterio_id, puntuacion) FROM stdin;
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
2	entrenador@iqfoil.cu	$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq	Carlos Gómez	\N	2	t	\N	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	\N
3	atleta1@iqfoil.cu	$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq	Juan Pérez	\N	3	t	\N	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	\N
4	atleta2@iqfoil.cu	$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36B7Zx2lY5gZk3v6tGX9ySq	María García	\N	3	t	\N	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	\N
1	admin@iqfoil.cu	scrypt:32768:8:1$VT4JiKLKk40tMPFE$3cc794ca61f444d35aad6d1a81e18aef7d3781d741c95eb22ce3120f8c29cd035507f960281bb0be6e8dcaeb09466b92cdc9b6707a2637b757e1d32ed7a43ad7	Administrador	\N	1	t	2026-06-19 16:28:58.544603	2026-06-01 22:20:05.081416	\N	{"tema": "claro", "idioma": "es", "notificacionesEmail": true}	\N
\.


--
-- Data for Name: usuario_insignia; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.usuario_insignia (usuario_id, insignia_id, fecha_obtenida) FROM stdin;
3	1	2026-06-01 22:20:05.106784
\.


--
-- Data for Name: video_tutorial; Type: TABLE DATA; Schema: public; Owner: joel
--

COPY public.video_tutorial (id, titulo, descripcion, url_video, duracion_seg, nivel, thumbnail_url, fecha_publicacion, activo) FROM stdin;
1	Introducción al foil	Conceptos básicos del foil	https://example.com/video1.mp4	360	principiante	https://example.com/thumb1.jpg	2026-06-01 22:20:05.088735	t
2	Técnica de virada	Aprende a virar correctamente	https://example.com/video2.mp4	480	intermedio	https://example.com/thumb2.jpg	2026-06-01 22:20:05.088735	t
3	Navegación con viento fuerte	Consejos para condiciones extremas	https://example.com/video3.mp4	600	avanzado	https://example.com/thumb3.jpg	2026-06-01 22:20:05.088735	t
24	prueba	sds	uploads/videos/lofi-home-garden-moewalls-com.mp4	0	principiante	\N	2026-06-10 22:39:59.140644	t
25	prueba		uploads/videos/fire-flag-one-piece-moewalls-com.mp4	0	principiante	\N	2026-06-11 14:13:36.722873	t
\.


--
-- Name: conversacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.conversacion_id_seq', 1, false);


--
-- Name: criterio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.criterio_id_seq', 3, true);


--
-- Name: curso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.curso_id_seq', 1, false);


--
-- Name: documento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.documento_id_seq', 7, true);


--
-- Name: evaluacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.evaluacion_id_seq', 1, false);


--
-- Name: evento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.evento_id_seq', 3, true);


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

SELECT pg_catalog.setval('public.insignia_id_seq', 3, true);


--
-- Name: log_actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.log_actividad_id_seq', 1, false);


--
-- Name: mensaje_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mensaje_id_seq', 2, true);


--
-- Name: mensaje_privado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mensaje_privado_id_seq', 1, false);


--
-- Name: mentoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.mentoria_id_seq', 1, false);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.rol_id_seq', 3, true);


--
-- Name: rubrica_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.rubrica_id_seq', 1, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.usuario_id_seq', 4, true);


--
-- Name: video_tutorial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: joel
--

SELECT pg_catalog.setval('public.video_tutorial_id_seq', 25, true);


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

\unrestrict h1cePvnenE2KmkBRZaKO4tx22u82RujDCDhJCed0HXHXNQZkWWkX8sNRTbkq5Qf

