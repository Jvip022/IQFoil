const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async create({ email, password, nombre, rol_id = 3 }) {
    const password_hash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuario (email, password_hash, nombre, rol_id)
      VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol_id
    `;
    const values = [email, password_hash, nombre, rol_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM usuario WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT id, email, nombre, rol_id, activo FROM usuario WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Usuario;
