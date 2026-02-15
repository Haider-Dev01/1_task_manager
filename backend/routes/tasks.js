// backend/routes/tasks.js  
const express = require('express');  
const router = express.Router();  
const tasksController = require('../controllers/tasks');  
const authMiddleware = require('../middleware/auth');  
const authController = require('../controllers/auth');

// Routes publiques (inscription/login)
router.post('/register', authController.register);  
router.post('/login', authController.login);

// Appliquer le middleware d'auth AVANT les routes protégées
router.use(authMiddleware.protect);  

// ✅ Routes CRUD protégées
router.get('/tasks', tasksController.getTasks);  
router.get('/tasks/:id', tasksController.getTasksById);
router.post('/tasks', tasksController.createTask);
router.put('/tasks/:id', tasksController.updateTask);
router.delete('/tasks/:id', tasksController.deleteTask);


module.exports = router;  
