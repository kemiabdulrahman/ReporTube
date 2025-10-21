const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Score = require('../models/Score');
const emailService = require('../services/emailService');
const reportService = require('../services/reportService');
const { AppError } = require('../middleware/errorHandler');

// Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [classes, students, teachers, subjects] = await Promise.all([
      Class.findAll(),
      Student.findAll(),
      User.getTeachers(),
      Subject.findAll(),
    ]);

    const stats = {
      totalClasses: classes.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalSubjects: subjects.length,
    };

    res.render('admin/dashboard', { stats, classes, students: students.slice(0, 5) });
  } catch (error) {
    next(error);
  }
};

// Users Management
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.render('admin/users/list', { users });
  } catch (error) {
    next(error);
  }
};

exports.showAddUser = (req, res) => {
  res.render('admin/users/add', { error: null });
};

exports.addUser = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.render('admin/users/add', {
        error: 'User with this email already exists',
      });
    }

    const user = await User.create({ email, password, full_name, role });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, full_name, password, role);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

exports.showEditUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.render('admin/users/edit', { user, error: null });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { email, full_name, is_active } = req.body;
    await User.update(req.params.id, { email, full_name, is_active: is_active === 'true' });
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.delete(req.params.id);
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

// Classes Management
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.findAll();
    res.render('admin/classes/list', { classes });
  } catch (error) {
    next(error);
  }
};

exports.showAddClass = (req, res) => {
  res.render('admin/classes/add', { error: null });
};

exports.addClass = async (req, res, next) => {
  try {
    const { name, level, academic_year } = req.body;
    await Class.create({ name, level, academic_year });
    res.redirect('/admin/classes');
  } catch (error) {
    next(error);
  }
};

exports.showClassDetails = async (req, res, next) => {
  try {
    const [classData, students, teachers, subjects, allTeachers] = await Promise.all([
      Class.findById(req.params.id),
      Student.findByClass(req.params.id),
      Class.getTeachers(req.params.id),
      Subject.findAll(),
      User.getTeachers(),
    ]);

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    res.render('admin/classes/details', {
      class: classData,
      students,
      teachers,
      subjects,
      allTeachers,
    });
  } catch (error) {
    next(error);
  }
};

exports.assignTeacher = async (req, res, next) => {
  try {
    const { teacher_id, subject_id, academic_year } = req.body;
    await Class.assignTeacher(req.params.id, teacher_id, subject_id, academic_year);
    res.redirect(`/admin/classes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

exports.removeTeacher = async (req, res, next) => {
  try {
    const { teacher_id, subject_id } = req.body;
    await Class.removeTeacher(req.params.id, teacher_id, subject_id);
    res.redirect(`/admin/classes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

// Students Management
exports.getStudents = async (req, res, next) => {
  try {
    const { class_id, search } = req.query;
    const students = await Student.findAll({ class_id, search });
    const classes = await Class.findAll();
    res.render('admin/students/list', { students, classes, filters: { class_id, search } });
  } catch (error) {
    next(error);
  }
};

exports.showAddStudent = async (req, res, next) => {
  try {
    const classes = await Class.findAll();
    res.render('admin/students/add', { classes, error: null });
  } catch (error) {
    next(error);
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const studentData = req.body;

    const existing = await Student.findByAdmissionNumber(studentData.admission_number);
    if (existing) {
      const classes = await Class.findAll();
      return res.render('admin/students/add', {
        classes,
        error: 'Student with this admission number already exists',
      });
    }

    await Student.create(studentData);
    res.redirect('/admin/students');
  } catch (error) {
    next(error);
  }
};

exports.showEditStudent = async (req, res, next) => {
  try {
    const [student, classes] = await Promise.all([
      Student.findById(req.params.id),
      Class.findAll(),
    ]);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    res.render('admin/students/edit', { student, classes, error: null });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    await Student.update(req.params.id, req.body);
    res.redirect('/admin/students');
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    await Student.delete(req.params.id);
    res.redirect('/admin/students');
  } catch (error) {
    next(error);
  }
};

// Subjects Management
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll();
    res.render('admin/subjects/list', { subjects });
  } catch (error) {
    next(error);
  }
};

exports.showAddSubject = (req, res) => {
  res.render('admin/subjects/add', { error: null });
};

exports.addSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const existing = await Subject.findByCode(code);
    if (existing) {
      return res.render('admin/subjects/add', {
        error: 'Subject with this code already exists',
      });
    }

    await Subject.create({ name, code, description });
    res.redirect('/admin/subjects');
  } catch (error) {
    next(error);
  }
};

// Scores & Reports
exports.getScores = async (req, res, next) => {
  try {
    const { class_id, academic_year, term } = req.query;
    const classes = await Class.findAll();

    let scores = [];
    let statistics = null;

    if (class_id && academic_year && term) {
      scores = await Score.getClassReport(class_id, academic_year, term);
      statistics = await Score.getStatistics(class_id, academic_year, term);
    }

    res.render('admin/scores/list', {
      scores,
      classes,
      statistics,
      filters: { class_id, academic_year, term },
    });
  } catch (error) {
    next(error);
  }
};

exports.approveScore = async (req, res, next) => {
  try {
    await Score.approve(req.params.id, req.session.userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.approveMultipleScores = async (req, res, next) => {
  try {
    const { score_ids } = req.body;
    await Score.approveMultiple(score_ids, req.session.userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Report Generation & Email
exports.showSendReports = async (req, res, next) => {
  try {
    const classes = await Class.findAll();
    res.render('admin/reports/send', { classes, message: null });
  } catch (error) {
    next(error);
  }
};

exports.sendReports = async (req, res, next) => {
  try {
    const { class_id, academic_year, term } = req.body;

    const students = await Student.findByClass(class_id);
    const classInfo = await Class.findById(class_id);

    const emailResults = [];

    for (const student of students) {
      if (!student.parent_email) {
        emailResults.push({
          student: `${student.first_name} ${student.last_name}`,
          success: false,
          message: 'No parent email found',
        });
        continue;
      }

      try {
        const scores = await Score.getStudentReport(student.id, academic_year, term);

        if (scores.length === 0) {
          emailResults.push({
            student: `${student.first_name} ${student.last_name}`,
            success: false,
            message: 'No scores found',
          });
          continue;
        }

        const reportBuffer = await reportService.generateStudentReport(
          student,
          scores,
          {
            academic_year,
            term,
            class_name: classInfo.name,
            level: classInfo.level,
          }
        );

        await emailService.sendReportToParent(
          student.parent_email,
          `${student.first_name} ${student.last_name}`,
          reportBuffer,
          { academic_year, term }
        );

        emailResults.push({
          student: `${student.first_name} ${student.last_name}`,
          success: true,
          message: 'Report sent successfully',
        });
      } catch (error) {
        emailResults.push({
          student: `${student.first_name} ${student.last_name}`,
          success: false,
          message: error.message,
        });
      }
    }

    const classes = await Class.findAll();
    res.render('admin/reports/send', {
      classes,
      message: 'Reports sending completed',
      results: emailResults,
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadStudentReport = async (req, res, next) => {
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
