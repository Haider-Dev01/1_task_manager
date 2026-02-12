const jwt = require('jsonwebtoken');  

exports.protect = (req, res, next) => {  
  // Récupérer le token depuis l'header Authorization  
  const authHeader = req.headers.authorization;  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {  
    return res.status(401).json({ error: 'Access denied. No token provided.' });  
  }  

  const token = authHeader.split(' ')[1];  

  try {  
    // Vérifier le token  
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');  
    req.user = { id: decoded.userId }; // Attacher l'ID utilisateur à la requête  
    next();  
  } catch (err) {  
    res.status(401).json({ error: 'Invalid or expired token' });  
  }  
};  