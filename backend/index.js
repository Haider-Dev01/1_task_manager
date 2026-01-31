const express = require ("express")
const app = express()
const { Pool } = require('pg');
require('dotenv').config()

app.use(express.json());

// 🔑 Connexion sécurisée à PostgreSQL  
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
  console.log('✅ Connected to PostgreSQL');  
});

app.use("/",(req,res) =>{ 
    res.json({message:"salut"})
} )


const port = process.env.PORT || 3000
app.listen(port , () => {console.log(`server is running in port : ${port}`)})   