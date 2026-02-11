// backend/routes/tasks.js  
const express = require('express');  
const router = express.Router();  
const tasksController = require('../controllers/tasks');  

// ✅ Routes CRUD  
router.get('/tasks', tasksController.getTasks);  
router.get('/tasks/:id', tasksController.getTasksById);
router.post('/tasks', tasksController.createTask);  
router.put('/tasks/:id', tasksController.updateTask);  
router.delete('/tasks/:id', tasksController.deleteTask);  

module.exports = router;  
