const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

exports.showLogin = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { error: null });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      return res.render('auth/login', {
        error: 'Invalid email or password',
      });
    }

    const isValidPassword = await User.verifyPassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.render('auth/login', {
        error: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.render('auth/login', {
        error: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.full_name = user.full_name;
    req.session.role = user.role;

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'teacher') {
      return res.redirect('/teacher/dashboard');
    }

    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/auth/login');
  });
};

exports.showChangePassword = (req, res) => {
  res.render('auth/change-password', { error: null, success: null });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return res.render('auth/change-password', {
        error: 'New passwords do not match',
        success: null,
      });
    }

    if (new_password.length < 6) {
      return res.render('auth/change-password', {
        error: 'Password must be at least 6 characters long',
        success: null,
      });
    }

    const user = await User.findByEmail(req.session.email);

    const isValidPassword = await User.verifyPassword(
      current_password,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.render('auth/change-password', {
        error: 'Current password is incorrect',
        success: null,
      });
    }

    await User.updatePassword(req.session.userId, new_password);

    res.render('auth/change-password', {
      error: null,
      success: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
