const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({
        success: false,
        errors: errorMessages,
      });
    }

    req.flash = req.flash || (() => {});
    req.flash('error', errorMessages.join(', '));
    return res.redirect('back');
  }
  next();
};

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const userValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('role')
    .isIn(['admin', 'teacher'])
    .withMessage('Invalid role'),
];

const studentValidation = [
  body('admission_number')
    .trim()
    .notEmpty()
    .withMessage('Admission number is required'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('gender')
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
  body('class_id')
    .isInt()
    .withMessage('Please select a valid class'),
  body('parent_email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid parent email'),
];

const classValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Class name is required'),
  body('level')
    .trim()
    .notEmpty()
    .withMessage('Level is required'),
  body('academic_year')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required')
    .matches(/^\d{4}\/\d{4}$/)
    .withMessage('Academic year must be in format YYYY/YYYY'),
];

const subjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .isLength({ max: 20 })
    .withMessage('Subject code must be 20 characters or less'),
];

const scoreValidation = [
  body('ca_score')
    .isFloat({ min: 0, max: 40 })
    .withMessage('CA score must be between 0 and 40'),
  body('exam_score')
    .isFloat({ min: 0, max: 60 })
    .withMessage('Exam score must be between 0 and 60'),
];

module.exports = {
  validate,
  loginValidation,
  userValidation,
  studentValidation,
  classValidation,
  subjectValidation,
  scoreValidation,
};
