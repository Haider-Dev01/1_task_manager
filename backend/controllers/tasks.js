// backend/controllers/tasks.js  
const pool = require('../config/db');  

// ✅ GET /tasks  
exports.getTasks = async (req, res) => {  
  try {  
    const { rows } = await pool.query('SELECT * FROM tasks');  
    res.json(rows);  
  } catch (err) {  
    console.error('[GET /tasks] DB Error:', err);  
    res.status(500).json({ error: 'Failed to fetch tasks' });  
  }  
};  

// ✅ POST /tasks  
exports.createTask = async (req, res) => {  
  const { title, status = 'pending' } = req.body;  

  if (!title?.trim()) {  
    return res.status(400).json({ error: 'Title is required' });  
  }  

  try {  
    const { rows } = await pool.query(  
      'INSERT INTO tasks (title, status) VALUES ($1, $2) RETURNING *',  
      [title.trim(), status]  
    );  
    res.status(201).json(rows[0]);  
  } catch (err) {  
    console.error('[POST /tasks] DB Error:', err);  
    res.status(500).json({ error: 'Failed to create task' });  
  }  
};  

// ✅ PUT /tasks/:id (à compléter plus tard)  
exports.updateTask = async (req, res) => {  
  // TODO: Implémenter ici  
};  

// ✅ DELETE /tasks/:id (à compléter plus tard)  
exports.deleteTask = async (req, res) => {  
  // TODO: Implémenter ici  
};  