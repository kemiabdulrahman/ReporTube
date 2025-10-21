const { query } = require('../config/database');

class Class {
  static async create({ name, level, academic_year }) {
    const result = await query(
      `INSERT INTO classes (name, level, academic_year)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, level, academic_year]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM students WHERE class_id = c.id AND is_active = true) as student_count
       FROM classes c
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM students WHERE class_id = c.id AND is_active = true) as student_count
      FROM classes c
      WHERE c.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (filters.academic_year) {
      sql += ` AND c.academic_year = $${paramCount++}`;
      params.push(filters.academic_year);
    }

    sql += ' ORDER BY c.level, c.name';

    const result = await query(sql, params);
    return result.rows;
  }

  static async update(id, { name, level, academic_year, is_active }) {
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (level !== undefined) {
      updates.push(`level = $${paramCount++}`);
      params.push(level);
    }
    if (academic_year !== undefined) {
      updates.push(`academic_year = $${paramCount++}`);
      params.push(academic_year);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      params.push(is_active);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const result = await query(
      `UPDATE classes SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'UPDATE classes SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  static async assignTeacher(class_id, teacher_id, subject_id, academic_year) {
    const result = await query(
      `INSERT INTO class_teachers (class_id, teacher_id, subject_id, academic_year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (teacher_id, class_id, subject_id, academic_year) DO NOTHING
       RETURNING *`,
      [class_id, teacher_id, subject_id, academic_year]
    );
    return result.rows[0];
  }

  static async removeTeacher(class_id, teacher_id, subject_id) {
    const result = await query(
      `DELETE FROM class_teachers
       WHERE class_id = $1 AND teacher_id = $2 AND subject_id = $3
       RETURNING id`,
      [class_id, teacher_id, subject_id]
    );
    return result.rows[0];
  }

  static async getTeachers(class_id) {
    const result = await query(
      `SELECT ct.*, u.full_name as teacher_name, u.email as teacher_email,
        s.name as subject_name, s.code as subject_code
       FROM class_teachers ct
       JOIN users u ON ct.teacher_id = u.id
       JOIN subjects s ON ct.subject_id = s.id
       WHERE ct.class_id = $1
       ORDER BY s.name`,
      [class_id]
    );
    return result.rows;
  }

  static async getClassesByTeacher(teacher_id) {
    const result = await query(
      `SELECT DISTINCT c.*, ct.subject_id,
        s.name as subject_name, s.code as subject_code,
        ct.academic_year,
        (SELECT COUNT(*) FROM students WHERE class_id = c.id AND is_active = true) as student_count
       FROM classes c
       JOIN class_teachers ct ON c.id = ct.class_id
       JOIN subjects s ON ct.subject_id = s.id
       WHERE ct.teacher_id = $1 AND c.is_active = true
       ORDER BY c.level, c.name`,
      [teacher_id]
    );
    return result.rows;
  }
}

module.exports = Class;
