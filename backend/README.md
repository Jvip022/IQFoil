# IQFOIL-CUBA Backend

Backend para la plataforma educativa de windsurf con foil. Tecnologías: Node.js, Express, PostgreSQL, Elasticsearch.

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- Elasticsearch 8+

## Instalación

1. Clonar repositorio
2. Instalar dependencias: `npm install`
3. Copiar `.env.example` a `.env` y completar con tus credenciales
4. Crear bases de datos:
   - PostgreSQL: ejecutar `src/scripts/schema.sql`
   - Elasticsearch: crear índice con `src/scripts/elasticsearch-mapping.json`
5. Iniciar servidor: `npm run dev` (desarrollo) o `npm start` (producción)

## Estructura

- `src/config/`: configuraciones de bases de datos
- `src/controllers/`: lógica de endpoints
- `src/models/`: modelos de datos (PostgreSQL con consultas parametrizadas)
- `src/routes/`: definición de rutas
- `src/middlewares/`: autenticación, validación, errores
- `src/services/`: servicios auxiliares (email, JWT)
- `src/utils/`: funciones de utilidad
- `src/scripts/`: scripts SQL y datos iniciales

## API Endpoints (ejemplos)

- `POST /api/auth/login` – autenticar usuario (JWT)
- `GET /api/videos` – listar videos
- `POST /api/videos/progreso` – actualizar progreso
- `GET /api/evaluaciones/pendientes` – evaluaciones pendientes
- `GET /api/busqueda?q=texto` – búsqueda en Elasticsearch

## Seguridad

- Consultas parametrizadas (sin inyección SQL)
- Contraseñas hasheadas con bcrypt
- JWT con expiración
- Validación de entradas con express-validator

## Licencia

MIT
