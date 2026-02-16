const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();

app.use(cors());
app.use(express.json());

/* Swagger Setup */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable API',
      version: '1.0.0'
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

/* Error Handler (ALWAYS LAST) */
app.use(errorHandler);

module.exports = app;
