const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const logger = require('./utils/logger');

// ✅ 1. Parsing JSON
app.use(express.json());

// ✅ 2. Logging (DOIT être avant les routes)
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// ✅ 3. Routes
app.use(require('./routes/auth'));
app.use(require('./routes/tasks'));
app.use('/api-docs', require('./docs/swagger').swaggerUi.serve, require('./docs/swagger').swaggerUi.setup(require('./docs/swagger').swaggerSpec));

// ✅ 4. Middleware d'erreur (dernier)
app.use(require('./middleware/error'));

// ✅ 5. Démarrage
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;