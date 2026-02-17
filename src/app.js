const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/', apiRateLimiter);

/* Swagger Setup */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable API',
      version: '1.0.0',
      description: 'Authentication and task APIs with JWT and RBAC'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      { url: 'http://localhost:5000/api/v1' }
    ]
  },
  apis: ['./src/modules/**/*.js']
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/* Routes */
app.use('/api/v1', routes);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }

  return next();
});

/* Error Handler (ALWAYS LAST) */
app.use(errorHandler);

module.exports = app;
