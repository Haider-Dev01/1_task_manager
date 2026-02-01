// backend/controllers/tasks.js  
const pool = require('../config/db');  

//  GET /tasks  
exports.getTasks = async (req, res) => {  
  try {  
    const { rows } = await pool.query('SELECT * FROM tasks');  
    res.json(rows);  
  } catch (err) {  
    console.error('[GET /tasks] DB Error:', err);  
    res.status(500).json({ error: 'Failed to fetch tasks' });  
  }  
};  
// Get /tasks/:id
// 1) exports
exports.getTasksById = async (req,res) => {
  // 2) recuperer ID
  const {id} = req.params 
  // 3) verifier que ID est un nombre
  if( isNaN (id)) {
    return res.status(400).json({error : 'ID invalide ' })
  }
  // 4) recuperer la tache dans la BDD
  try {
    const {rows} = await pool.query('SELECT * FROM TASKS WHERE ID = $1' ,[id])
    // 5) si rows.length ===0  => 404 not found
    if (rows.length === 0) {
      return res.status(404).json({error : 'Tâche non trouvée'})
    }
    // 6) si rows.length ===1  => renvoyer la tache
    res.json(rows[0])
    // 7) gestion des erreurs de la BDD
  } catch (error) {
    console.error('[GET /tasks/:id] DB Error:', error);  
    res.status(500).json({ error: 'Failed to fetch task by ID' });  
  }
}
//  POST /tasks  
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

//  PUT /tasks/:id (à compléter plus tard) 
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, status } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET title = $1, status = $2 WHERE id = $3 RETURNING *',
      [title, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PUT /tasks/:id] DB Error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
}; 

//  DELETE /tasks/:id (à compléter plus tard)  
exports.deleteTask = async (req, res) => {  
  // TODO: Implémenter ici  
  //1)  exports
  
    // 2) recuperer ID
    const {id} = req.params
    // 3) ID est nombre not string
    if ( isNaN(id)) {
      return res.status(400).json({error : 'ID invalide '})
    }
    // 4) supprimer la ligne dans la BDD

    try {
      const {rowcount} = await pool.query('DELETE FROM TASKS WHERE ID = $1', [id])
    
    // 5) si rowcount  =0  => 404 not found
      if (rowcount ===0 ) {
        return res.status(404).json({error : 'ligne non trouvée '})
      }
    // 6) si rowcoount =1 ; 204 succes de delete 
      return res.status(204).send()

    }catch (error) {
      console.error('[DELETE /tasks/:id] DB Error:', error);  
      res.status(500).json({ error: 'Failed to delete task' });  

  }

}; 