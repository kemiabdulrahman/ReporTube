const { query } = require('../config/database');

class Score {
  static async create({
    student_id,
    subject_id,
    class_id,
    teacher_id,
    academic_year,
    term,
    ca_score,
    exam_score,
    remark,
  }) {
    const result = await query(
      `INSERT INTO scores (
        student_id, subject_id, class_id, teacher_id,
        academic_year, term, ca_score, exam_score, remark
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        student_id,
        subject_id,
        class_id,
        teacher_id,
        academic_year,
        term,
        ca_score || 0,
        exam_score || 0,
        remark,
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT sc.*, st.first_name, st.last_name, st.admission_number,
        sub.name as subject_name, sub.code as subject_code,
        c.name as class_name,
        u.full_name as teacher_name
       FROM scores sc
       JOIN students st ON sc.student_id = st.id
       JOIN subjects sub ON sc.subject_id = sub.id
       JOIN classes c ON sc.class_id = c.id
       LEFT JOIN users u ON sc.teacher_id = u.id
       WHERE sc.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByStudent(student_id, academic_year, term) {
    const result = await query(
      `SELECT sc.*, sub.name as subject_name, sub.code as subject_code,
        u.full_name as teacher_name
       FROM scores sc
       JOIN subjects sub ON sc.subject_id = sub.id
       LEFT JOIN users u ON sc.teacher_id = u.id
       WHERE sc.student_id = $1 AND sc.academic_year = $2 AND sc.term = $3
       ORDER BY sub.name`,
      [student_id, academic_year, term]
    );
    return result.rows;
  }

  static async findByClassAndSubject(class_id, subject_id, academic_year, term) {
    const result = await query(
      `SELECT sc.*, st.first_name, st.last_name, st.admission_number
       FROM scores sc
       JOIN students st ON sc.student_id = st.id
       WHERE sc.class_id = $1 AND sc.subject_id = $2
         AND sc.academic_year = $3 AND sc.term = $4
       ORDER BY st.last_name, st.first_name`,
      [class_id, subject_id, academic_year, term]
    );
    return result.rows;
  }

  static async upsert({
    student_id,
    subject_id,
    class_id,
    teacher_id,
    academic_year,
    term,
    ca_score,
    exam_score,
    remark,
  }) {
    const result = await query(
      `INSERT INTO scores (
        student_id, subject_id, class_id, teacher_id,
        academic_year, term, ca_score, exam_score, remark
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (student_id, subject_id, academic_year, term)
      DO UPDATE SET
        ca_score = EXCLUDED.ca_score,
        exam_score = EXCLUDED.exam_score,
        remark = EXCLUDED.remark,
        teacher_id = EXCLUDED.teacher_id,
        is_approved = false
      RETURNING *`,
      [
        student_id,
        subject_id,
        class_id,
        teacher_id,
        academic_year,
        term,
        ca_score || 0,
        exam_score || 0,
        remark,
      ]
    );
    return result.rows[0];
  }

  static async update(id, { ca_score, exam_score, remark }) {
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (ca_score !== undefined) {
      updates.push(`ca_score = $${paramCount++}`);
      params.push(ca_score);
    }
    if (exam_score !== undefined) {
      updates.push(`exam_score = $${paramCount++}`);
      params.push(exam_score);
    }
    if (remark !== undefined) {
      updates.push(`remark = $${paramCount++}`);
      params.push(remark);
    }

    if (updates.length === 0) return null;

    // Reset approval when scores are updated
    updates.push('is_approved = false');

    params.push(id);
    const result = await query(
      `UPDATE scores SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async approve(id, approved_by) {
    const result = await query(
      `UPDATE scores
       SET is_approved = true, approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [approved_by, id]
    );
    return result.rows[0];
  }

  static async approveMultiple(score_ids, approved_by) {
    const result = await query(
      `UPDATE scores
       SET is_approved = true, approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2::int[])
       RETURNING *`,
      [approved_by, score_ids]
    );
    return result.rows;
  }

  static async getStudentReport(student_id, academic_year, term) {
    const result = await query(
      `SELECT sc.*, sub.name as subject_name, sub.code as subject_code,
        st.first_name, st.last_name, st.admission_number,
        c.name as class_name, c.level
       FROM scores sc
       JOIN subjects sub ON sc.subject_id = sub.id
       JOIN students st ON sc.student_id = st.id
       JOIN classes c ON sc.class_id = c.id
       WHERE sc.student_id = $1 AND sc.academic_year = $2 AND sc.term = $3
       ORDER BY sub.name`,
      [student_id, academic_year, term]
    );
    return result.rows;
  }

  static async getClassReport(class_id, academic_year, term) {
    const result = await query(
      `SELECT st.id as student_id, st.first_name, st.last_name,
        st.admission_number,
        json_agg(
          json_build_object(
            'subject_name', sub.name,
            'subject_code', sub.code,
            'ca_score', sc.ca_score,
            'exam_score', sc.exam_score,
            'total_score', sc.total_score,
            'grade', sc.grade,
            'is_approved', sc.is_approved
          ) ORDER BY sub.name
        ) as scores
       FROM students st
       LEFT JOIN scores sc ON st.id = sc.student_id
         AND sc.academic_year = $2 AND sc.term = $3
       LEFT JOIN subjects sub ON sc.subject_id = sub.id
       WHERE st.class_id = $1 AND st.is_active = true
       GROUP BY st.id, st.first_name, st.last_name, st.admission_number
       ORDER BY st.last_name, st.first_name`,
      [class_id, academic_year, term]
    );
    return result.rows;
  }

  static async delete(id) {
    const result = await query('DELETE FROM scores WHERE id = $1 RETURNING id', [
      id,
    ]);
    return result.rows[0];
  }

  static async getStatistics(class_id, academic_year, term) {
    const result = await query(
      `SELECT
        COUNT(*) as total_entries,
        COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_count,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_count,
        AVG(total_score) as average_score,
        MAX(total_score) as highest_score,
        MIN(total_score) as lowest_score
       FROM scores
       WHERE class_id = $1 AND academic_year = $2 AND term = $3`,
      [class_id, academic_year, term]
    );
    return result.rows[0];
  }
}

module.exports = Score;
