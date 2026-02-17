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


describe('POST /register', () => {
  it('should create a new user', async () => {
    const email = `test_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/register')
      .send({
        email,
        password: '123456'
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(email);
  });

  it('should return 409 if email already exists', async () => {
    const email = `dup_${Date.now()}@test.com`;
    // Créer un utilisateur
    await request(app)
      .post('/register')
      .send({
        email,
        password: '123456'
      });

    // Essayer de créer le même utilisateur → 409
    const res = await request(app)
      .post('/register')
      .send({
        email,
        password: '123456'
      })
      .expect(409);

    expect(res.body.error).toBe('Email already exists');
  });
});

describe('POST /login', () => {
  it('should return a token for valid credentials', async () => {
    const email = `login_${Date.now()}@test.com`;
    // Créer un utilisateur
    await request(app)
      .post('/register')
      .send({
        email,
        password: '123456'
      });

    // Se connecter
    const res = await request(app)
      .post('/login')
      .send({
        email,
        password: '123456'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: `wrong_${Date.now()}@test.com`,
        password: 'wrong'
      })
      .expect(401);

    expect(res.body.error).toBe('Invalid credentials');
  });
});