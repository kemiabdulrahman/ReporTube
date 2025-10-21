const { query } = require('../config/database');

class Subject {
  static async create({ name, code, description }) {
    const result = await query(
      `INSERT INTO subjects (name, code, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, code, description]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM subjects WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByCode(code) {
    const result = await query('SELECT * FROM subjects WHERE code = $1', [code]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM subjects ORDER BY name');
    return result.rows;
  }

  static async update(id, { name, code, description }) {
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      params.push(code);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const result = await query(
      `UPDATE subjects SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM subjects WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Subject;
