const { Pool } = require('pg');
require('dotenv').config();

// Créer un pool pour la DB de test
const testPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME + '_test' // ← DB de test séparée
});

// Créer la DB de test si elle n'existe pas
async function setupTestDB() {
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // ← DB système pour créer la DB de test
  });

  try {
    await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}_test`);
    console.log('✅ Test database created');
  } catch (err) {
    if (err.code !== '42P04') { // 42P04 = DB already exists
      console.error('Error creating test DB:', err);
    }
  } finally {
    await adminPool.end();
  }

  // Créer les tables dans la DB de test
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await testPool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Test tables created');
}

module.exports = { testPool, setupTestDB };