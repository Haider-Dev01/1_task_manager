// utils/validators.js
const Joi = require('joi');

// ✅ Schéma pour les tâches
exports.taskSchema = Joi.object({
  title: Joi.string().min(3).max(255).trim().required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters'
  }),
  status: Joi.string()
    .valid('pending', 'done', 'in-progress')
    .default('pending')
    .messages({
      'any.only': 'Status must be: pending, done, or in-progress'
    })
});

// ✅ Schéma pour l'inscription
exports.registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters'
  })
});

// ✅ Schéma pour la connexion
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required()
});