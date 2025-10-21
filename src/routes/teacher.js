const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { isTeacher } = require('../middleware/auth');
const { scoreValidation, validate } = require('../middleware/validators');

// Apply teacher middleware to all routes
router.use(isTeacher);

// Dashboard
router.get('/dashboard', teacherController.getDashboard);

// Classes
router.get('/classes', teacherController.getClasses);
router.get('/classes/:class_id/students/:subject_id', teacherController.getClassStudents);

// Scores
router.get('/scores/my-classes', teacherController.getMyClasses);
router.get('/scores/entry', teacherController.showScoreEntry);
router.post('/scores/save', teacherController.saveScores);
router.post('/scores/update/:id', teacherController.updateScore);

// Reports
router.get('/reports/student', teacherController.viewStudentReport);
router.get('/reports/download', teacherController.downloadReport);

module.exports = router;
