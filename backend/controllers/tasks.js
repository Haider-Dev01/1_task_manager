// backend/controllers/tasks.js  
const pool = require('../config/db');  

//  GET /tasks  
exports.getTasks = async (req, res) => {  
  try {  
    const { rows } = await pool.query('SELECT * FROM tasks WHERE user_id = $1,[req.user.id]') ; // ← Seulement les tâches de l'utilisateur 
    // Filtrer par user_id
  
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
    const {rows} = await pool.query('SELECT * FROM TASKS WHERE user_id = $1 AND user_id = $2 ,[id,req.user.id]')
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
  const { title, status  } = req.body;  

  if (!title?.trim()) {  
    return res.status(400).json({ error: 'Title is required' });  
  }  

  try {  
    const { rows } = await pool.query(  
      'INSERT INTO tasks (title, status,user_id) VALUES ($1, $2, $3) RETURNING *',  
      [title.trim(), status, req.user.id]  
    );  
    res.status(201).json(rows[0]);  
  } catch (err) {  
    console.error('[POST /tasks] DB Error:', err);  
    res.status(500).json({ error: 'Failed to create task' });  
  }  
};  

//  PUT /tasks/:id (à compléter plus tard) 
// exports.updateTask = async (req, res) => {
//   const { id } = req.params;
//   const { title, status } = req.body;

//   if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

//   try {
//     const { rows } = await pool.query(
//       'UPDATE tasks SET title = $1, status = $2 WHERE user_id = $3 RETURNING *',
//       [title, status, req.user.id]
//     );
//     if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('[PUT /tasks/:id] DB Error:', err);
//     res.status(500).json({ error: 'Failed to update task' });
//   }
// }; 

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, status } = req.body;

  // Validation de l'ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Construire la requête dynamiquement (seulement les champs fournis)
  const updates = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    updates.push(`title = $${index++}`);
    values.push(title.trim());
  }
  if (status !== undefined) {
    updates.push(`status = $${index++}`);
    values.push(status);
  }

  // Si aucun champ à mettre à jour
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Ajouter user_id pour la clause WHERE
  values.push(req.user.id);
  values.push(parseInt(id));

  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE user_id = $${index} AND id = $${index + 1} RETURNING *`,
      values
    );

    // Si aucune tâche mise à jour → soit ID invalide, soit pas la propriété de l'utilisateur
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée ou non autorisée' });
    }

    res.json(rows[0]);
  } catch (err) {
    throw err; // Middleware d'erreur global gère ça
  }
};


//  DELETE /tasks/:id (à compléter plus tard)  
// exports.deleteTask = async (req, res) => {  
//   // TODO: Implémenter ici  
//   //1)  exports
  
//     // 2) recuperer ID
//     const {id} = req.params
//     // 3) ID est nombre not string
//     if ( isNaN(id)) {
//       return res.status(400).json({error : 'ID invalide '})
//     }
//     // 4) supprimer la ligne dans la BDD

//     try {
//       const {rowCount} = await pool.query('DELETE FROM TASKS WHERE ID = $1', [id])
    
//     // 5) si rowCount  =0  => 404 not found
//       if (rowCount ===0 ) {
//         return res.status(404).json({error : 'ligne non trouvée '})
//       }
//     // 6) si rowcoount =1 ; 204 succes de delete 
//       return res.status(204).send()

//     }catch (error) {
//       console.error('[DELETE /tasks/:id] DB Error:', error);  
//       res.status(500).json({ error: 'Failed to delete task' });  

//   }
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  // Validation de l'ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [parseInt(id), req.user.id]
    );

    // Si rowCount === 0 → soit ID invalide, soit pas la propriété de l'utilisateur
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée ou non autorisée' });
    }

    res.status(204).send();
  } catch (err) {
    throw err; // Middleware d'erreur global gère ça
  }


}; 

// apres implemntation de middleware de erreur global , on peut supprimer tous les TRY CATCH 

