const Usuario = require('../models/Usuario');
const jwtService = require('../services/jwtService');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password, nombre } = req.body;
    const existingUser = await Usuario.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const user = await Usuario.create({ email, password, nombre });
    const token = jwtService.generateToken({ id: user.id, email: user.email, rol_id: user.rol_id });
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await Usuario.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valid = await Usuario.verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwtService.generateToken({ id: user.id, email: user.email, rol_id: user.rol_id });
    res.json({ user: { id: user.id, email: user.email, nombre: user.nombre, rol_id: user.rol_id }, token });
  } catch (error) {
    next(error);
  }
};
