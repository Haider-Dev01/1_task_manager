// En haut du fichier, AVANT tout import de app
require('dotenv').config({ path: '.env.test' }); // ← Charge .env.test

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

// ✅ VIDE les tables AVANT chaque test
beforeEach(async () => {
  await pool.query('DELETE FROM tasks_test');
  await pool.query('DELETE FROM users_test CASCADE');
});

// ✅ Ferme la connexion APRÈS tous les tests
afterAll(async () => {
  await pool.end();
});

// Fonction utilitaire pour obtenir un token
async function getToken() {
  const uniqueId = Date.now() + Math.random();
  const email = `test${uniqueId}@test.com`;
  await request(app)
    .post('/register')
    .send({ email, password: '123456' });

  const res = await request(app)
    .post('/login')
    .send({ email, password: '123456' });

  return res.body.token;
}

describe('GET /tasks', () => {
  it('should return 401 without token', async () => {
    await request(app)
      .get('/tasks')
      .expect(401);
  });

  it('should return empty array with valid token', async () => {
    const token = await getToken();

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });
});

describe('GET /tasks/:id', () => {
  it('should return task by ID', async () => {
    const token = await getToken();

    // Créer une tâche
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task to fetch', status: 'pending' });

    const taskId = createRes.body.id;

    // Récupérer la tâche par ID
    const res = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe('Task to fetch');
  });

  it('should return 404 if task not found', async () => {
    const token = await getToken();

    const res = await request(app)
      .get('/tasks/9999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBe('Tâche non trouvée');
  });

  it('should return 400 if ID is not a number', async () => {
    const token = await getToken();

    const res = await request(app)
      .get('/tasks/invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.error).toContain('ID invalide');
  });
});

describe('POST /tasks', () => {
  it('should create a task with valid token', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test task', status: 'pending' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test task');
    expect(res.body.user_id).toBeDefined();
  });

  it('should return 400 if title is missing', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pending' })
      .expect(400);

    expect(res.body.error).toBe('Title is required');
  });

  it('should trim whitespace from title', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '  Test task with spaces  ', status: 'pending' })
      .expect(201);

    expect(res.body.title).toBe('Test task with spaces');
  });
});

describe('PUT /tasks/:id', () => {
  it('should update task title', async () => {
    const token = await getToken();

    // Créer une tâche
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original title', status: 'pending' });

    const taskId = createRes.body.id;

    // Mettre à jour la tâche
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title' })
      .expect(200);

    expect(res.body.title).toBe('Updated title');
    expect(res.body.id).toBe(taskId);
  });

  it('should update task status', async () => {
    const token = await getToken();

    // Créer une tâche
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task', status: 'pending' });

    const taskId = createRes.body.id;

    // Mettre à jour le statut
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(res.body.status).toBe('completed');
  });

  it('should return 404 if task not found for update', async () => {
    const token = await getToken();

    const res = await request(app)
      .put('/tasks/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' })
      .expect(404);

    expect(res.body.error).toContain('Tâche non trouvée');
  });

  it('should return 400 if no fields to update', async () => {
    const token = await getToken();

    // Créer une tâche
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task', status: 'pending' });

    const taskId = createRes.body.id;

    // Essayer de mettre à jour sans champs
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body.error).toBe('No fields to update');
  });

  it('should return 400 if ID is not a number for update', async () => {
    const token = await getToken();

    const res = await request(app)
      .put('/tasks/invalid')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' })
      .expect(400);

    expect(res.body.error).toBe('ID invalide');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should delete task and return 204', async () => {
    const token = await getToken();

    // Créer une tâche
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task to delete', status: 'pending' });

    const taskId = createRes.body.id;

    // Supprimer la tâche
    await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    // Vérifier que la tâche est supprimée
    const res = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 if task not found for delete', async () => {
    const token = await getToken();

    const res = await request(app)
      .delete('/tasks/9999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toContain('Tâche non trouvée');
  });

  it('should return 400 if ID is not a number for delete', async () => {
    const token = await getToken();

    const res = await request(app)
      .delete('/tasks/invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.error).toBe('ID invalide');
  });
});