const request = require('supertest');
const app = require('../index'); // ← Importez index.js (qui exporte app)
const pool = require('../config/db');

// Vider la DB avant chaque test
beforeEach(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

afterEach(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

// Fonction utilitaire pour obtenir un token
async function getToken() {
  await request(app)
    .post('/register')
    .send({ email: 'test@test.com', password: '123456' });

  const res = await request(app)
    .post('/login')
    .send({ email: 'test@test.com', password: '123456' });

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
});