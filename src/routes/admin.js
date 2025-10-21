const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');
const {
  userValidation,
  studentValidation,
  classValidation,
  subjectValidation,
  validate,
} = require('../middleware/validators');

// Apply admin middleware to all routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/add', adminController.showAddUser);
router.post('/users/add', userValidation, validate, adminController.addUser);
router.get('/users/edit/:id', adminController.showEditUser);
router.post('/users/edit/:id', adminController.updateUser);
router.post('/users/delete/:id', adminController.deleteUser);

// Classes
router.get('/classes', adminController.getClasses);
router.get('/classes/add', adminController.showAddClass);
router.post('/classes/add', classValidation, validate, adminController.addClass);
router.get('/classes/:id', adminController.showClassDetails);
router.post('/classes/:id/assign-teacher', adminController.assignTeacher);
router.post('/classes/:id/remove-teacher', adminController.removeTeacher);

// Students
router.get('/students', adminController.getStudents);
router.get('/students/add', adminController.showAddStudent);
router.post('/students/add', studentValidation, validate, adminController.addStudent);
router.get('/students/edit/:id', adminController.showEditStudent);
router.post('/students/edit/:id', adminController.updateStudent);
router.post('/students/delete/:id', adminController.deleteStudent);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.get('/subjects/add', adminController.showAddSubject);
router.post('/subjects/add', subjectValidation, validate, adminController.addSubject);

// Scores
router.get('/scores', adminController.getScores);
router.post('/scores/approve/:id', adminController.approveScore);
router.post('/scores/approve-multiple', adminController.approveMultipleScores);

// Reports
router.get('/reports/send', adminController.showSendReports);
router.post('/reports/send', adminController.sendReports);
router.get('/reports/download', adminController.downloadStudentReport);

module.exports = router;
