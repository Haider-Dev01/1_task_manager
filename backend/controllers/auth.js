// register controller 
const bcrypt = require('bcrypt');  
const pool = require('../config/db');

// ✅ Sélectionner la bonne table selon l'environnement
const USERS_TABLE = process.env.NODE_ENV === 'test' ? 'users_test' : 'users';

exports.register = async (req, res) => {  
  const { email, password } = req.body;  

  // Validation basique  
  if (!email || !password) {  
    return res.status(400).json({ error: 'Email and password are required' });  
  }  

  try {  
    // Hacher le mot de passe  
    const hashedPassword = await bcrypt.hash(password, 10);  

    // Insérer dans la DB  
    const { rows } = await pool.query(  
      `INSERT INTO ${USERS_TABLE} (email, password_hash) VALUES ($1, $2) RETURNING id, email`,  
      [email, hashedPassword]  
    );  

    res.status(201).json(rows[0]);  
  } catch (err) {  
    if (err.code === '23505') { // Violation de contrainte UNIQUE  
      return res.status(409).json({ error: 'Email already exists' });  
    }  
    throw err; // Le middleware d'erreur global gère le reste  
  }  
};  

// Login controller
const jwt = require('jsonwebtoken');  

exports.login = async (req, res) => {  
  const { email, password } = req.body;  

  if (!email || !password) {  
    return res.status(400).json({ error: 'Email and password are required' });  
  }  

  try {  
    // Récupérer l'utilisateur  
    const { rows } = await pool.query(  
      `SELECT id, email, password_hash FROM ${USERS_TABLE} WHERE email = $1`,  
      [email]  
    );  

    if (rows.length === 0) {  
      return res.status(401).json({ error: 'Invalid credentials' });  
    }  

    // Vérifier le mot de passe  
    const isValid = await bcrypt.compare(password, rows[0].password_hash);  
    if (!isValid) {  
      return res.status(401).json({ error: 'Invalid credentials' });  
    }  

    // Générer un token JWT  
    const token = jwt.sign(  
      { userId: rows[0].id },  
      process.env.JWT_SECRET || 'default_secret',  
      { expiresIn: '72h' }  
    );  
    

    res.json({ token });  
  } catch (err) {  

    throw err;  
  } 
  // Dans exports.login (fichier controllers/auth.js)
// const token = jwt.sign(
//   { userId: rows[0].id, email: rows[0].email }, // ← Ajoutez email
//   process.env.JWT_SECRET || 'default_secret',
//   { expiresIn: '24h' }
// );

   
};  