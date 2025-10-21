const Class = require('../models/Class');
const Student = require('../models/Student');
const Score = require('../models/Score');
const reportService = require('../services/reportService');
const GradeService = require('../services/gradeService');
const { AppError } = require('../middleware/errorHandler');

// Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const classes = await Class.getClassesByTeacher(req.session.userId);

    const stats = {
      totalClasses: classes.length,
      totalStudents: classes.reduce((sum, cls) => sum + parseInt(cls.student_count || 0), 0),
    };

    res.render('teacher/dashboard', { classes, stats });
  } catch (error) {
    next(error);
  }
};

// View Classes
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.getClassesByTeacher(req.session.userId);
    res.render('teacher/classes/list', { classes });
  } catch (error) {
    next(error);
  }
};

// View Class Students
exports.getClassStudents = async (req, res, next) => {
  try {
    const { class_id, subject_id } = req.params;

    const [classInfo, students] = await Promise.all([
      Class.findById(class_id),
      Student.findByClass(class_id),
    ]);

    if (!classInfo) {
      throw new AppError('Class not found', 404);
    }

    res.render('teacher/classes/students', {
      class: classInfo,
      students,
      subject_id,
    });
  } catch (error) {
    next(error);
  }
};

// Score Entry Form
exports.showScoreEntry = async (req, res, next) => {
  try {
    const { class_id, subject_id, academic_year, term } = req.query;

    if (!class_id || !subject_id || !academic_year || !term) {
      throw new AppError('Missing required parameters', 400);
    }

    const [classInfo, students, existingScores] = await Promise.all([
      Class.findById(class_id),
      Student.findByClass(class_id),
      Score.findByClassAndSubject(class_id, subject_id, academic_year, term),
    ]);

    // Map existing scores to students
    const scoresMap = {};
    existingScores.forEach(score => {
      scoresMap[score.student_id] = score;
    });

    const studentsWithScores = students.map(student => ({
      ...student,
      score: scoresMap[student.id] || null,
    }));

    res.render('teacher/scores/entry', {
      class: classInfo,
      students: studentsWithScores,
      subject_id,
      academic_year,
      term,
    });
  } catch (error) {
    next(error);
  }
};

// Save Scores
exports.saveScores = async (req, res, next) => {
  try {
    const { class_id, subject_id, academic_year, term, scores } = req.body;

    if (!scores || !Array.isArray(scores)) {
      throw new AppError('Invalid scores data', 400);
    }

    const results = [];

    for (const scoreData of scores) {
      const { student_id, ca_score, exam_score, remark } = scoreData;

      // Validate scores
      const validation = GradeService.validateScore(
        parseFloat(ca_score),
        parseFloat(exam_score)
      );

      if (!validation.isValid) {
        results.push({
          student_id,
          success: false,
          errors: validation.errors,
        });
        continue;
      }

      try {
        await Score.upsert({
          student_id,
          subject_id,
          class_id,
          teacher_id: req.session.userId,
          academic_year,
          term,
          ca_score: parseFloat(ca_score),
          exam_score: parseFloat(exam_score),
          remark,
        });

        results.push({
          student_id,
          success: true,
        });
      } catch (error) {
        results.push({
          student_id,
          success: false,
          errors: [error.message],
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

// Update Single Score
exports.updateScore = async (req, res, next) => {
  try {
    const { ca_score, exam_score, remark } = req.body;

    const validation = GradeService.validateScore(
      parseFloat(ca_score),
      parseFloat(exam_score)
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    await Score.update(req.params.id, {
      ca_score: parseFloat(ca_score),
      exam_score: parseFloat(exam_score),
      remark,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// View Student Report
exports.viewStudentReport = async (req, res, next) => {
  try {
    const { student_id, academic_year, term } = req.query;

    const [student, scores] = await Promise.all([
      Student.findById(student_id),
      Score.getStudentReport(student_id, academic_year, term),
    ]);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const summary = GradeService.calculateOverallSummary(scores);

    res.render('teacher/reports/student', {
      student,
      scores,
      summary,
      academic_year,
      term,
    });
  } catch (error) {
    next(error);
  }
};

// Download Student Report PDF
exports.downloadReport = async (req, res, next) => {
  try {
    const { student_id, academic_year, term } = req.query;

    const [student, scores] = await Promise.all([
      Student.findById(student_id),
      Score.getStudentReport(student_id, academic_year, term),
    ]);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const reportBuffer = await reportService.generateStudentReport(
      student,
      scores,
      {
        academic_year,
        term,
        class_name: student.class_name,
        level: student.level,
      }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${student.first_name}_${student.last_name}_Report.pdf"`
    );
    res.send(reportBuffer);
  } catch (error) {
    next(error);
  }
};

// My Classes with Score Entry Links
exports.getMyClasses = async (req, res, next) => {
  try {
    const classes = await Class.getClassesByTeacher(req.session.userId);
    res.render('teacher/scores/my-classes', { classes });
  } catch (error) {
    next(error);
  }
};
