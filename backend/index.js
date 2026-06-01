require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectPostgres, closePostgres } = require('./src/config/database');
const { connectElasticsearch, closeElasticsearch } = require('./src/config/elasticsearch');
const errorMiddleware = require('./src/middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./src/routes/authRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const evaluacionRoutes = require('./src/routes/evaluacionRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const documentoRoutes = require('./src/routes/documentoRoutes');
const foroRoutes = require('./src/routes/foroRoutes');
const talentoRoutes = require('./src/routes/talentoRoutes');
const busquedaRoutes = require('./src/routes/busquedaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/foro', foroRoutes);
app.use('/api/talentos', talentoRoutes);
app.use('/api/busqueda', busquedaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'IQFOIL-CUBA Backend funcionando' });
});

app.use(errorMiddleware);

async function startServer() {
  try {
    await connectPostgres();
    await connectElasticsearch();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Cerrando conexiones...');
  await closePostgres();
  await closeElasticsearch();
  process.exit(0);
});

startServer();
