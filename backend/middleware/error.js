// Middleware d'erreur global (4 paramètres obligatoires)
const errorHandler = (err, req, res, next) => {
  // 1. Log détaillé (côté serveur)
  console.error(' GLOBAL ERROR:', {
    message: err.message,
    stack: err.stack,
    url: `${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
  
  // 2. Déterminer le code HTTP
  const statusCode = err.statusCode || err.status || 500;
  
  // 3. Envoyer réponse au client
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    // En dev, montrer le stack (optionnel)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

// je peux l'utiliser dans index.js avec app.use(errorHandler);
// et dans les controllers avec next(err);
 