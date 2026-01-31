// backend/config/db.js  
const { Pool } = require('pg');  
require('dotenv').config();  

const pool = new Pool({  
  host: process.env.DB_HOST,  
  port: process.env.DB_PORT,  
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,  
});  

// Test de connexion  
pool.connect((err) => {  
  if (err) throw new Error(`DB connection failed: ${err.message}`);  
  console.log('✅ DB Connected');  
});  

module.exports = pool;  