// docs/swagger.js

const fs = require('fs');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 🔐 Configuration Swagger (OpenAPI 3.0)
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API RESTful pour la gestion des tâches avec authentification JWT',
      contact: {
        name: 'Développeur',
        email: 'dev@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./controllers/*.js'] // ⚠️ Lit les commentaires @swagger dans les contrôleurs
};

// 📦 Génère la spécification OpenAPI
const swaggerSpec = swaggerJSDoc(options);

// 📁 Sauvegarde la spec dans docs/ (pour éviter les boucles nodemon)
const swaggerPath = path.join(__dirname, 'swagger.json');
fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));

// ✅ Exporte pour utilisation dans index.js
module.exports = {
  swaggerUi,
  swaggerSpec
};