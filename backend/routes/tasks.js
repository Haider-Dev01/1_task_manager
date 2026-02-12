// backend/routes/tasks.js  
const express = require('express');  
const router = express.Router();  
const tasksController = require('../controllers/tasks');  
const authMiddleware = require('../middleware/auth');  
const authController = require('../controllers/auth');

// ✅ Routes CRUD  
router.get('/tasks', tasksController.getTasks);  
router.get('/tasks/:id', tasksController.getTasksById);
router.post('/tasks', tasksController.createTask);  
router.put('/tasks/:id', tasksController.updateTask);  
router.delete('/tasks/:id', tasksController.deleteTask);  

router.post('/register', authController.register);  
router.post('/login', authController.login);

// Appliquer le middleware à TOUTES les routes tasks  
router.use(authMiddleware.protect);  

router.get('/tasks', tasksController.getTasks);  
router.get('/tasks/:id', tasksController.getTasksById);
router.post('/tasks', tasksController.createTask);
router.put('/tasks/:id', tasksController.updateTask);
router.delete('/tasks/:id', tasksController.deleteTask);


module.exports = router;  
