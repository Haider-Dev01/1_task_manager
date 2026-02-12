const express = require ("express")
const app = express()
// const { Pool } = require('pg');
require('dotenv').config()
const errorHandler = require('./middleware/error'); // Importez le middleware d'erreur global
app.use(express.json());

const pool = require('./config/db'); // Importez le pool depuis config/db.js


// // 🔑 Connexion sécurisée à PostgreSQL  
// const pool = new Pool({  
//   host: process.env.DB_HOST,  
//   port: process.env.DB_PORT,  
//   user: process.env.DB_USER,  
//   password: process.env.DB_PASSWORD,  
//   database: process.env.DB_NAME,  
// }); 

// Test de connexion  
// pool.connect((err) => {  
//   if (err) throw new Error(`DB connection failed: ${err.message}`);  
//   console.log('✅ Connected to PostgreSQL');  
// });

// 🔗 Connexion aux routes  
app.use(tasksRouter = require('./routes/tasks'));  
app.use(authRouter = require('./routes/auth'));

// Middleware d'erreur (DOIT être le DERNIER)
app.use(errorHandler);


// //  Gestion des erreurs 404  
// app.use((req, res) => {  
//   res.status(404).json({ error: `Endpoint ${req.method} ${req.url} not found` });  
// });  


// app.use("/",(req,res) =>{ 
//     res.json({message:"salut"})
// } )


const port = process.env.PORT || 3000
app.listen(port , () => {console.log(`server is running in port : ${port}`)})   