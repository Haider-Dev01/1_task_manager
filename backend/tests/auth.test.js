const request = require('supertest');
const app = require('../index'); // ← Importez index.js (qui exporte app)
const pool = require('../config/db');

// Vider la DB avant chaque test
beforeEach(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

// Fermer la connexion après tous les tests
afterAll(async () => {
  await pool.end();
}, 10000);

describe('POST /register', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'test@test.com',
        password: '123456'
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@test.com');
  });

  it('should return 409 if email already exists', async () => {
    // Créer un utilisateur
    await request(app)
      .post('/register')
      .send({
        email: 'duplicate@test.com',
        password: '123456'
      });

    // Essayer de créer le même utilisateur → 409
    const res = await request(app)
      .post('/register')
      .send({
        email: 'duplicate@test.com',
        password: '123456'
      })
      .expect(409);

    expect(res.body.error).toBe('Email already exists');
  });
});

describe('POST /login', () => {
  it('should return a token for valid credentials', async () => {
    // Créer un utilisateur
    await request(app)
      .post('/register')
      .send({
        email: 'login@test.com',
        password: '123456'
      });

    // Se connecter
    const res = await request(app)
      .post('/login')
      .send({
        email: 'login@test.com',
        password: '123456'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'wrong@test.com',
        password: 'wrong'
      })
      .expect(401);

    expect(res.body.error).toBe('Invalid credentials');
  });
});