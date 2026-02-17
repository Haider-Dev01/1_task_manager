module.exports = {
  testEnvironment: 'node',
  maxWorkers: 1,  // ✅ Exécuter les tests en série (1 worker)
  setupFilesAfterEnv: [],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**'
  ]
};
