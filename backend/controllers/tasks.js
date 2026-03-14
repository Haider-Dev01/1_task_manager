const pool = require('../config/db');
const { taskSchema } = require('../utils/validators');

// Sélectionner les bonnes tables selon l'environnement
const TASKS_TABLE = process.env.NODE_ENV === 'test' ? 'tasks_test' : 'tasks';

// GET /tasks?page=1&limit=10
exports.getTasks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Récupérer les tâches paginées
  const { rows } = await pool.query(
    `SELECT * FROM ${TASKS_TABLE} 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );

  // Compter le total pour le frontend
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM ${TASKS_TABLE} WHERE user_id = $1`,
    [req.user.id]
  );

  res.json({
    data: rows,
    total: parseInt(countRows[0].count),
    page,
    limit
  });
};

// GET /tasks/:id
exports.getTasksById = async (req, res) => {
  const { id } = req.params;

  // Validation métier (400)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  const { rows } = await pool.query(
    `SELECT * FROM ${TASKS_TABLE} WHERE id = $1 AND user_id = $2`,
    [id, req.user.id]
  );

  // Validation métier (404)
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Tâche non trouvée ou non autorisée' });
  }

  res.json(rows[0]);
};

// POST /tasks
exports.createTask = async (req, res) => {
  // Validation de schema (Joi) → Sécurité renforcée
  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { title, status } = value;

  const { rows } = await pool.query(
    `INSERT INTO ${TASKS_TABLE} (title, status, user_id, created_at, updated_at) 
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
    [title.trim(), status, req.user.id]
  );

  res.status(201).json(rows[0]);
};

// PUT /tasks/:id
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, status } = req.body;

  // Validation métier (400)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  // Construire la requête dynamiquement
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

  // Validation métier (400)
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Ajouter user_id et id pour la clause WHERE
  values.push(req.user.id);
  values.push(parseInt(id));

  const { rows } = await pool.query(
    `UPDATE ${TASKS_TABLE} 
     SET ${updates.join(', ')}, updated_at = NOW() 
     WHERE user_id = $${index} AND id = $${index + 1} 
     RETURNING *`,
    values // ← CORRECTION : tableau values ajouté ici
  );

  // Validation métier (404)
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Tâche non trouvée ou non autorisée' });
  }

  res.json(rows[0]);
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  // Validation métier (400)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  const { rowCount } = await pool.query(
    `DELETE FROM ${TASKS_TABLE} WHERE id = $1 AND user_id = $2`,
    [parseInt(id), req.user.id]
  );

  // Validation métier (404)
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Tâche non trouvée ou non autorisée' });
  }

  res.status(204).send();
};