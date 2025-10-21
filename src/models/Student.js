const { query } = require('../config/database');

class Student {
  static async create({
    admission_number,
    first_name,
    last_name,
    middle_name,
    date_of_birth,
    gender,
    class_id,
    parent_name,
    parent_email,
    parent_phone,
  }) {
    const result = await query(
      `INSERT INTO students (
        admission_number, first_name, last_name, middle_name,
        date_of_birth, gender, class_id, parent_name,
        parent_email, parent_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        admission_number,
        first_name,
        last_name,
        middle_name,
        date_of_birth,
        gender,
        class_id,
        parent_name,
        parent_email,
        parent_phone,
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT s.*, c.name as class_name, c.level, c.academic_year
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByAdmissionNumber(admission_number) {
    const result = await query(
      'SELECT * FROM students WHERE admission_number = $1',
      [admission_number]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT s.*, c.name as class_name, c.level, c.academic_year
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (filters.class_id) {
      sql += ` AND s.class_id = $${paramCount++}`;
      params.push(filters.class_id);
    }

    if (filters.search) {
      sql += ` AND (
        s.first_name ILIKE $${paramCount} OR
        s.last_name ILIKE $${paramCount} OR
        s.admission_number ILIKE $${paramCount}
      )`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY s.last_name, s.first_name';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findByClass(class_id) {
    const result = await query(
      `SELECT s.*, c.name as class_name, c.level
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.class_id = $1 AND s.is_active = true
       ORDER BY s.last_name, s.first_name`,
      [class_id]
    );
    return result.rows;
  }

  static async update(id, data) {
    const {
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      class_id,
      parent_name,
      parent_email,
      parent_phone,
      is_active,
    } = data;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      params.push(last_name);
    }
    if (middle_name !== undefined) {
      updates.push(`middle_name = $${paramCount++}`);
      params.push(middle_name);
    }
    if (date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      params.push(date_of_birth);
    }
    if (gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      params.push(gender);
    }
    if (class_id !== undefined) {
      updates.push(`class_id = $${paramCount++}`);
      params.push(class_id);
    }
    if (parent_name !== undefined) {
      updates.push(`parent_name = $${paramCount++}`);
      params.push(parent_name);
    }
    if (parent_email !== undefined) {
      updates.push(`parent_email = $${paramCount++}`);
      params.push(parent_email);
    }
    if (parent_phone !== undefined) {
      updates.push(`parent_phone = $${paramCount++}`);
      params.push(parent_phone);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      params.push(is_active);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const result = await query(
      `UPDATE students SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'UPDATE students SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  static async getCount(class_id = null) {
    let sql = 'SELECT COUNT(*) FROM students WHERE is_active = true';
    const params = [];

    if (class_id) {
      sql += ' AND class_id = $1';
      params.push(class_id);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Student;
