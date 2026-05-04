import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AstroVerse API',
      version: '1.0.0',
      description:
        'Astrology SaaS Platform — natal charts, personality analysis, forecasting, synastry',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/*/routes/*.ts', './src/shared/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
