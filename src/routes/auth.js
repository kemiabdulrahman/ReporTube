const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation, validate } = require('../middleware/validators');
const { isAuthenticated } = require('../middleware/auth');

router.get('/login', authController.showLogin);
router.post('/login', loginValidation, validate, authController.login);
router.get('/logout', authController.logout);

router.get('/change-password', isAuthenticated, authController.showChangePassword);
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;
